/**
 * Deterministic, no-LLM summariser for a user's taste profile.
 *
 * Produces a short blurb consumed by the LLM re-ranker as cached prompt
 * context. Determinism matters: identical input must produce identical
 * output so the Anthropic prompt cache hits.
 */

export interface TasteProfileInput {
	user_id: string;
	/** genre name -> weight in [0, 1] (does not need to sum to 1) */
	genre_weights?: Record<string, number>;
	/** preferred runtime in minutes (optional) */
	preferred_runtime?: number;
	/** free-form positive tags, e.g. "feel-good", "twisty" */
	likes?: string[];
	/** free-form negative tags, e.g. "horror", "gore" */
	dislikes?: string[];
}

const PCT = (n: number): number => Math.round(n * 100);

function topGenres(
	weights: Record<string, number> | undefined,
	limit = 2
): Array<[string, number]> {
	if (!weights) return [];
	const entries = Object.entries(weights).filter(([, v]) => v > 0);
	entries.sort((a, b) => {
		if (b[1] !== a[1]) return b[1] - a[1];
		return a[0].localeCompare(b[0]);
	});
	return entries.slice(0, limit);
}

export function summariseTasteProfile(profile: TasteProfileInput): string {
	const parts: string[] = [];

	const top = topGenres(profile.genre_weights, 2);
	if (top.length === 1) {
		const [g, w] = top[0]!;
		parts.push(`Leans ${g} (${PCT(w)}%).`);
	} else if (top.length >= 2) {
		const [g1, w1] = top[0]!;
		const [g2, w2] = top[1]!;
		parts.push(`Leans ${g1} (${PCT(w1)}%) and ${g2} (${PCT(w2)}%).`);
	}

	if (typeof profile.preferred_runtime === 'number') {
		parts.push(`Prefers ~${Math.round(profile.preferred_runtime)} min films.`);
	}

	const likes = (profile.likes ?? []).slice().sort();
	const dislikes = (profile.dislikes ?? []).slice().sort();
	if (likes.length > 0 && dislikes.length > 0) {
		parts.push(`Likes ${likes.join(', ')}, avoids ${dislikes.join(', ')}.`);
	} else if (likes.length > 0) {
		parts.push(`Likes ${likes.join(', ')}.`);
	} else if (dislikes.length > 0) {
		parts.push(`Avoids ${dislikes.join(', ')}.`);
	}

	return parts.join(' ');
}
