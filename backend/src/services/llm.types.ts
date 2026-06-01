/**
 * Phase C LLM re-ranker types.
 *
 * Defined locally rather than imported from the Phase B recommender, since
 * Phase B is being built in parallel in another worktree. The shapes here
 * describe only what the re-ranker needs as input/output; the merge will
 * reconcile against the recommender's canonical types.
 */

export interface LlmCandidate {
	tmdb_id: number;
	title: string;
	year: number;
	runtime: number;
	overview: string;
	genres: string[];
}

export interface LlmTasteProfile {
	user_id: string;
	summary: string;
}

export interface LlmRerankInput {
	candidates: LlmCandidate[];
	tasteProfiles: LlmTasteProfile[];
	mood: string;
	minutes: number;
}

export interface LlmUsage {
	input_tokens: number;
	output_tokens: number;
	cache_read_input_tokens?: number;
	cache_creation_input_tokens?: number;
}

export interface LlmRerankResult {
	pick_tmdb_id: number;
	alternates_tmdb_ids: number[];
	rationale: string;
	raw_usage: LlmUsage;
}

/**
 * Context passed to maybeRerank by the caller. Used both for cache key
 * construction and for the LLM prompt.
 */
export interface LlmRerankContext {
	mood: string;
	minutes: number;
	tasteProfiles: LlmTasteProfile[];
	/**
	 * Opaque version markers per taste profile (e.g. updated_at). Included in
	 * the cache key so a profile change invalidates cached LLM picks.
	 */
	tasteProfileVersions: string[];
}

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
