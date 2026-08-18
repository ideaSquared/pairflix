import type { Bindings } from '../types';

/**
 * LLM re-rank client -- fetch-based (Workers-native, no SDK), matching `lib/email.ts` and
 * CLAUDE.md's "Called from the Worker over fetch" instruction. Ported from the current Express
 * `llm.service.ts`. Two deliberate simplifications vs. that version: no in-memory LRU response
 * cache (a Worker isolate doesn't reliably live long enough for one to pay for itself -- same
 * reasoning `lib/tmdb.ts` used to drop its watch-providers cache), and `console.warn` instead of
 * `auditLogService`, matching the logging convention already used elsewhere in this port.
 *
 * `rerankCandidates` throws `LLMUnavailable` on any failure (not configured, network error, bad
 * response shape) -- deciding whether to call it at all (feature flag, premium entitlement) and
 * catching that failure to fall back to a pure-ML pick are both `lib/recommendation.ts`'s job, not
 * this module's: the caller already has to check eligibility once to size its candidate hydration,
 * so a self-checking wrapper here would just re-read the same `settings`/`subscriptions` rows on
 * every call.
 */

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 512;
const TIMEOUT_MS = 8_000;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';

const SYSTEM_PROMPT = [
	'You are a film-pick reasoner for a couples movie app.',
	'You receive 10 candidate films pre-filtered by an ML scorer and short taste',
	'blurbs for each household member. Pick ONE film both people are likely to',
	'enjoy together for the given mood and available minutes, plus up to 2',
	'alternates. Prefer shared genre overlap and respect dislikes. Keep the',
	'rationale to one short sentence shown on the card. Always call the',
	'submit_pick tool. Never reply in prose.',
].join(' ');

const SUBMIT_PICK_TOOL = {
	name: 'submit_pick',
	description:
		'Submit the final pick, up to 2 alternates, and a one-sentence rationale.',
	input_schema: {
		type: 'object',
		properties: {
			pick_tmdb_id: {
				type: 'integer',
				description: 'tmdb_id of the chosen film from the candidate list',
			},
			alternates_tmdb_ids: {
				type: 'array',
				items: { type: 'integer' },
				maxItems: 2,
				description: 'Up to 2 alternate tmdb_ids from the candidate list',
			},
			rationale: {
				type: 'string',
				description: 'One short sentence explaining the pick',
			},
		},
		required: ['pick_tmdb_id', 'alternates_tmdb_ids', 'rationale'],
		additionalProperties: false,
	},
};

export type LlmTasteProfile = {
	userId: string;
	summary: string;
};

export type LlmCandidate = {
	tmdbId: number;
	title: string;
	year: number;
	runtime: number;
	overview: string;
	genres: string[];
};

export type LlmUsage = {
	inputTokens: number;
	outputTokens: number;
	cacheReadInputTokens?: number;
	cacheCreationInputTokens?: number;
};

export type LlmRerankResult = {
	pickTmdbId: number;
	alternatesTmdbIds: number[];
	rationale: string;
	rawUsage: LlmUsage;
};

export type LlmRerankInput = {
	candidates: LlmCandidate[];
	tasteProfiles: LlmTasteProfile[];
	mood: string;
	minutes: number;
};

export class LLMUnavailable extends Error {
	readonly cause?: unknown;

	constructor(message: string, cause?: unknown) {
		super(message);
		this.name = 'LLMUnavailable';
		if (cause !== undefined) {
			this.cause = cause;
		}
	}
}

type SubmitPickInput = {
	pick_tmdb_id: number;
	alternates_tmdb_ids: number[];
	rationale: string;
};

const isSubmitPickInput = (value: unknown): value is SubmitPickInput => {
	if (typeof value !== 'object' || value === null) return false;
	// Narrow unknown to an indexable object after the typeof/null guard above.
	const v = value as Record<string, unknown>;
	return (
		typeof v.pick_tmdb_id === 'number' &&
		Array.isArray(v.alternates_tmdb_ids) &&
		v.alternates_tmdb_ids.every(id => typeof id === 'number') &&
		typeof v.rationale === 'string'
	);
};

type AnthropicMessageResponse = {
	content: Array<{ type: string; name?: string; input?: unknown }>;
	usage: {
		input_tokens: number;
		output_tokens: number;
		cache_read_input_tokens?: number;
		cache_creation_input_tokens?: number;
	};
};

const renderTasteBlock = (profiles: LlmTasteProfile[]): string => {
	const lines = profiles.map(
		(p, i) => `Member ${i + 1} (${p.userId}): ${p.summary}`
	);
	return ['Household taste profiles:', ...lines].join('\n');
};

const renderCandidatesBlock = (
	candidates: LlmCandidate[],
	mood: string,
	minutes: number
): string => {
	const header = `Mood: ${mood}\nMax runtime: ${minutes} min\nCandidates:`;
	const rows = candidates.map(c => {
		const genres = c.genres.join(', ');
		return `- ${c.tmdbId} | ${c.title} (${c.year}) | ${c.runtime} min | [${genres}] | ${c.overview}`;
	});
	return [header, ...rows, 'Call submit_pick with your choice.'].join('\n');
};

const extractToolUse = (
	content: AnthropicMessageResponse['content']
): SubmitPickInput => {
	const block = content.find(
		b => b.type === 'tool_use' && b.name === 'submit_pick'
	);
	if (!block) throw new LLMUnavailable('Model did not call submit_pick tool');
	if (!isSubmitPickInput(block.input)) {
		throw new LLMUnavailable(
			'submit_pick tool call had an unexpected input shape'
		);
	}
	return block.input;
};

const extractUsage = (usage: AnthropicMessageResponse['usage']): LlmUsage => {
	const result: LlmUsage = {
		inputTokens: usage.input_tokens,
		outputTokens: usage.output_tokens,
	};
	if (typeof usage.cache_read_input_tokens === 'number') {
		result.cacheReadInputTokens = usage.cache_read_input_tokens;
	}
	if (typeof usage.cache_creation_input_tokens === 'number') {
		result.cacheCreationInputTokens = usage.cache_creation_input_tokens;
	}
	return result;
};

/** Throws `LLMUnavailable` if not configured or the call fails for any reason. On success,
 * `pickTmdbId`/`alternatesTmdbIds` are expected (not guaranteed) to be drawn from
 * `input.candidates` -- the model is instructed to do so, but callers should still validate
 * before surfacing. */
export const rerankCandidates = async (
	env: Bindings,
	input: LlmRerankInput
): Promise<LlmRerankResult> => {
	if (!env.ANTHROPIC_API_KEY) {
		throw new LLMUnavailable('ANTHROPIC_API_KEY is not set');
	}

	const tasteBlock = renderTasteBlock(input.tasteProfiles);
	const candidatesBlock = renderCandidatesBlock(
		input.candidates,
		input.mood,
		input.minutes
	);

	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
	try {
		const response = await fetch(ANTHROPIC_API_URL, {
			method: 'POST',
			headers: {
				'x-api-key': env.ANTHROPIC_API_KEY,
				'anthropic-version': ANTHROPIC_VERSION,
				'content-type': 'application/json',
			},
			signal: controller.signal,
			body: JSON.stringify({
				model: MODEL,
				max_tokens: MAX_TOKENS,
				system: [
					{
						type: 'text',
						text: SYSTEM_PROMPT,
						cache_control: { type: 'ephemeral' },
					},
				],
				tools: [SUBMIT_PICK_TOOL],
				tool_choice: { type: 'tool', name: 'submit_pick' },
				messages: [
					{
						role: 'user',
						content: [
							{
								type: 'text',
								text: tasteBlock,
								cache_control: { type: 'ephemeral' },
							},
							{ type: 'text', text: candidatesBlock },
						],
					},
				],
			}),
		});

		if (!response.ok) {
			const text = await response.text().catch(() => '');
			throw new LLMUnavailable(
				`Anthropic API error: ${response.status} ${text}`
			);
		}

		// External API response -- fields are validated below via isSubmitPickInput before use,
		// matching the single-cast convention lib/tmdb.ts's tmdbFetch uses for its own responses.
		const data = (await response.json()) as AnthropicMessageResponse;
		const toolInput = extractToolUse(data.content);

		return {
			pickTmdbId: toolInput.pick_tmdb_id,
			alternatesTmdbIds: toolInput.alternates_tmdb_ids.slice(0, 2),
			rationale: toolInput.rationale,
			rawUsage: extractUsage(data.usage),
		};
	} catch (err) {
		if (err instanceof LLMUnavailable) throw err;
		throw new LLMUnavailable('Anthropic call failed', err);
	} finally {
		clearTimeout(timeout);
	}
};
