/**
 * Deterministic, no-LLM summariser for a taste profile -- produces the short blurb the LLM
 * re-ranker (lib/llm.ts) consumes as cached prompt context. Determinism matters: identical input
 * must produce identical output so the Anthropic prompt cache hits.
 */
export type TasteProfileSummaryInput = {
	userId: string;
	/** genre name -> weight in [0, 1] (does not need to sum to 1) */
	genreWeights?: Record<string, number>;
	/** preferred runtime in minutes */
	preferredRuntime?: number | null;
	likes?: string[];
	dislikes?: string[];
};

const asPercent = (n: number): number => Math.round(n * 100);

const topGenres = (
	weights: Record<string, number> | undefined,
	limit = 2
): [string, number][] => {
	if (!weights) return [];
	const entries = Object.entries(weights).filter(([, w]) => w > 0);
	entries.sort((a, b) =>
		b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])
	);
	return entries.slice(0, limit);
};

export const summariseTasteProfile = (
	profile: TasteProfileSummaryInput
): string => {
	const parts: string[] = [];

	const top = topGenres(profile.genreWeights, 2);
	if (top.length === 1) {
		const [genre, weight] = top[0]!;
		parts.push(`Leans ${genre} (${asPercent(weight)}%).`);
	} else if (top.length >= 2) {
		const [genre1, weight1] = top[0]!;
		const [genre2, weight2] = top[1]!;
		parts.push(
			`Leans ${genre1} (${asPercent(weight1)}%) and ${genre2} (${asPercent(weight2)}%).`
		);
	}

	if (typeof profile.preferredRuntime === 'number') {
		parts.push(`Prefers ~${Math.round(profile.preferredRuntime)} min films.`);
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
};
