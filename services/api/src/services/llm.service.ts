import Anthropic from '@anthropic-ai/sdk';

import { auditLogService } from './audit.service';
import {
	isLlmRerankEnabled,
	isLlmRerankEnabledForHousehold,
} from './featureFlags.service';
import { llmCacheService } from './llmCache.service';
import {
	LLMUnavailable,
	type LlmCandidate,
	type LlmRerankContext,
	type LlmRerankInput,
	type LlmRerankResult,
	type LlmTasteProfile,
	type LlmUsage,
} from './llm.types';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 512;
const TIMEOUT_MS = 8_000;

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
		// Widen from the readonly tuple `as const` below would otherwise infer:
		// the SDK's Tool type requires a mutable string[] for `required`.
		required: ['pick_tmdb_id', 'alternates_tmdb_ids', 'rationale'] as string[],
		additionalProperties: false,
	},
} as const;

interface SubmitPickInput {
	pick_tmdb_id: number;
	alternates_tmdb_ids: number[];
	rationale: string;
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
	if (client) return client;
	const apiKey = process.env.ANTHROPIC_API_KEY;
	if (!apiKey) {
		throw new LLMUnavailable('ANTHROPIC_API_KEY is not set');
	}
	client = new Anthropic({ apiKey });
	return client;
}

function renderTasteBlock(profiles: LlmTasteProfile[]): string {
	const lines = profiles.map(
		(p, i) => `Member ${i + 1} (${p.user_id}): ${p.summary}`
	);
	return ['Household taste profiles:', ...lines].join('\n');
}

function renderCandidatesBlock(
	candidates: LlmCandidate[],
	mood: string,
	minutes: number
): string {
	const header = `Mood: ${mood}\nMax runtime: ${minutes} min\nCandidates:`;
	const rows = candidates.map(c => {
		const genres = c.genres.join(', ');
		return `- ${c.tmdb_id} | ${c.title} (${c.year}) | ${c.runtime} min | [${genres}] | ${c.overview}`;
	});
	return [header, ...rows, 'Call submit_pick with your choice.'].join('\n');
}

function extractToolUse(
	content: Anthropic.Messages.ContentBlock[]
): SubmitPickInput {
	for (const block of content) {
		if (block.type === 'tool_use' && block.name === 'submit_pick') {
			return block.input as SubmitPickInput;
		}
	}
	throw new LLMUnavailable('Model did not call submit_pick tool');
}

function extractUsage(raw: Anthropic.Messages.Message['usage']): LlmUsage {
	const usage: LlmUsage = {
		input_tokens: raw.input_tokens,
		output_tokens: raw.output_tokens,
	};
	if (typeof raw.cache_read_input_tokens === 'number') {
		usage.cache_read_input_tokens = raw.cache_read_input_tokens;
	}
	if (typeof raw.cache_creation_input_tokens === 'number') {
		usage.cache_creation_input_tokens = raw.cache_creation_input_tokens;
	}
	return usage;
}

export async function rerankCandidates(
	input: LlmRerankInput
): Promise<LlmRerankResult> {
	const anthropic = getClient();

	const tasteBlock = renderTasteBlock(input.tasteProfiles);
	const candidatesBlock = renderCandidatesBlock(
		input.candidates,
		input.mood,
		input.minutes
	);

	try {
		const response = await anthropic.messages.create(
			{
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
							{
								type: 'text',
								text: candidatesBlock,
							},
						],
					},
				],
			},
			{ timeout: TIMEOUT_MS }
		);

		const toolInput = extractToolUse(response.content);
		return {
			pick_tmdb_id: toolInput.pick_tmdb_id,
			alternates_tmdb_ids: (toolInput.alternates_tmdb_ids ?? []).slice(0, 2),
			rationale: toolInput.rationale,
			raw_usage: extractUsage(response.usage),
		};
	} catch (err) {
		if (err instanceof LLMUnavailable) throw err;
		throw new LLMUnavailable('Anthropic call failed', err);
	}
}

/**
 * Integration point for Phase B's recommender.
 *
 * Contract:
 *   - Returns `null` if the LLM rerank flag is off, the cache returns nothing
 *     and the call fails, or any unexpected error occurs.
 *   - When `null` is returned, callers MUST fall back to their pure-ML top-1.
 *   - When a result is returned, `pick_tmdb_id` and `alternates_tmdb_ids` are
 *     guaranteed to be drawn from the input candidate list (the model is
 *     instructed to do so; callers should still validate before surfacing).
 */
export async function maybeRerank(
	candidates: LlmCandidate[],
	ctx: LlmRerankContext
): Promise<LlmRerankResult | null> {
	try {
		const enabled = ctx.householdId
			? await isLlmRerankEnabledForHousehold(ctx.householdId)
			: await isLlmRerankEnabled();
		if (!enabled) return null;

		const cacheKey = llmCacheService.buildCacheKey({
			mood: ctx.mood,
			minutes: ctx.minutes,
			candidates,
			tasteProfileVersions: ctx.tasteProfileVersions,
		});

		const cached = llmCacheService.get(cacheKey);
		if (cached) return cached;

		const result = await rerankCandidates({
			candidates,
			tasteProfiles: ctx.tasteProfiles,
			mood: ctx.mood,
			minutes: ctx.minutes,
		});

		llmCacheService.set(cacheKey, result);
		return result;
	} catch (err) {
		void auditLogService.warn('LLM rerank unavailable', 'llm-service', {
			error: err instanceof Error ? err.message : 'Unknown error',
		});
		return null;
	}
}

export const llmService = {
	rerankCandidates,
	maybeRerank,
};
