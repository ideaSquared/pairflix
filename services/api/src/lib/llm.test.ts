import { env } from 'cloudflare:workers';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LLMUnavailable, rerankCandidates, type LlmRerankInput } from './llm';

const REAL_FETCH = globalThis.fetch;
afterEach(() => {
	globalThis.fetch = REAL_FETCH;
	vi.restoreAllMocks();
});

const input: LlmRerankInput = {
	candidates: [
		{
			tmdbId: 1,
			title: 'One',
			year: 2020,
			runtime: 100,
			overview: 'o1',
			genres: ['comedy'],
		},
		{
			tmdbId: 2,
			title: 'Two',
			year: 2019,
			runtime: 110,
			overview: 'o2',
			genres: ['drama'],
		},
	],
	tasteProfiles: [{ userId: 'u1', summary: 'Leans comedy.' }],
	mood: 'funny',
	minutes: 120,
};

const toolUseResponse = (
	pick: number,
	alternates: number[],
	usage: Record<string, number> = { input_tokens: 100, output_tokens: 50 }
): Response =>
	new Response(
		JSON.stringify({
			content: [
				{
					type: 'tool_use',
					name: 'submit_pick',
					input: {
						pick_tmdb_id: pick,
						alternates_tmdb_ids: alternates,
						rationale: 'because',
					},
				},
			],
			usage,
		}),
		{ status: 200, headers: { 'content-type': 'application/json' } }
	);

describe('rerankCandidates', () => {
	it('throws LLMUnavailable when the API key is not configured', async () => {
		await expect(
			rerankCandidates({ ...env, ANTHROPIC_API_KEY: undefined }, input)
		).rejects.toBeInstanceOf(LLMUnavailable);
	});

	it('returns the parsed pick, alternates, rationale and usage', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue(toolUseResponse(2, [1]));
		const result = await rerankCandidates(env, input);
		expect(result).toEqual({
			pickTmdbId: 2,
			alternatesTmdbIds: [1],
			rationale: 'because',
			rawUsage: { inputTokens: 100, outputTokens: 50 },
		});
	});

	it('caps alternates at two even if the model returns more', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue(toolUseResponse(1, [2, 3, 4]));
		const result = await rerankCandidates(env, input);
		expect(result.alternatesTmdbIds).toEqual([2, 3]);
	});

	it('surfaces prompt-cache usage fields when present', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue(
			toolUseResponse(1, [], {
				input_tokens: 10,
				output_tokens: 5,
				cache_read_input_tokens: 200,
				cache_creation_input_tokens: 300,
			})
		);
		const result = await rerankCandidates(env, input);
		expect(result.rawUsage).toEqual({
			inputTokens: 10,
			outputTokens: 5,
			cacheReadInputTokens: 200,
			cacheCreationInputTokens: 300,
		});
	});

	it('throws LLMUnavailable on a non-ok API response', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValue(new Response('nope', { status: 500 }));
		await expect(rerankCandidates(env, input)).rejects.toBeInstanceOf(
			LLMUnavailable
		);
	});

	it('throws LLMUnavailable when the model does not call submit_pick', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					content: [{ type: 'text', text: 'here is my pick' }],
					usage: { input_tokens: 1, output_tokens: 1 },
				}),
				{ status: 200 }
			)
		);
		await expect(rerankCandidates(env, input)).rejects.toBeInstanceOf(
			LLMUnavailable
		);
	});

	it('throws LLMUnavailable when the tool input shape is wrong', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					content: [
						{
							type: 'tool_use',
							name: 'submit_pick',
							input: { pick_tmdb_id: 'not-a-number' },
						},
					],
					usage: { input_tokens: 1, output_tokens: 1 },
				}),
				{ status: 200 }
			)
		);
		await expect(rerankCandidates(env, input)).rejects.toBeInstanceOf(
			LLMUnavailable
		);
	});

	it('wraps a network failure as LLMUnavailable and keeps the cause', async () => {
		const boom = new Error('network down');
		globalThis.fetch = vi.fn().mockRejectedValue(boom);
		const err = await rerankCandidates(env, input).catch(e => e);
		expect(err).toBeInstanceOf(LLMUnavailable);
		expect((err as LLMUnavailable).cause).toBe(boom);
	});

	it('sends a tool-forced request with prompt caching on the system and taste blocks', async () => {
		const fetchMock = vi.fn().mockResolvedValue(toolUseResponse(1, []));
		globalThis.fetch = fetchMock;
		await rerankCandidates(env, input);

		const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
		expect(url).toBe('https://api.anthropic.com/v1/messages');
		expect((init.headers as Record<string, string>)['x-api-key']).toBe(
			env.ANTHROPIC_API_KEY
		);
		const sent = JSON.parse(init.body as string);
		expect(sent.model).toBe('claude-sonnet-4-6');
		expect(sent.tool_choice).toEqual({ type: 'tool', name: 'submit_pick' });
		expect(sent.system[0].cache_control).toEqual({ type: 'ephemeral' });
		expect(sent.messages[0].content[0].cache_control).toEqual({
			type: 'ephemeral',
		});
	});
});
