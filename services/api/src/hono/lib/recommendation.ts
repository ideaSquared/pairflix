import {
	householdMembers,
	tasteProfiles,
	watchedTogether,
	type Database,
	type TasteProfileRow,
} from '@pairflix/db';
import { eq, inArray } from 'drizzle-orm';
import type { CommitPickRequest, PickRequest } from '@pairflix/lib.validation';
import type { Bindings } from '../types';
import { isLlmRerankEnabledForHousehold } from './featureFlags';
import { GENRE_NAMES, MOOD_FILTERS } from './genres';
import { newId } from './id';
import { maybeRerank, type LlmCandidate, type LlmTasteProfile } from './llm';
import { recordPickEvent } from './pickEvents';
import { summariseTasteProfile } from './tasteSummary';
import {
	discoverMedia,
	getMovieFullDetails,
	getTVFullDetails,
	getWatchProviders,
	type RegionProviders,
	type TMDbDiscoverMovie,
	type TMDbDiscoverTV,
} from './tmdb';

/**
 * Ported from the current Express `recommendation.service.ts`, with these deliberate
 * departures:
 *
 * - No in-memory `/discover` candidate cache -- same Worker-isolate reasoning already applied to
 *   `lib/tmdb.ts` and `lib/llm.ts`. Edge-caching `/discover` (CLAUDE.md) is deferred to the
 *   providers/history domain.
 * - `getFinishedTmdbIdsForMembers` (an exclusion source keyed off the personal `WatchlistEntry`
 *   table) is dropped entirely rather than ported -- that table has no D1 equivalent and the
 *   personal watchlist it backed is being deleted, not preserved, per the product pivot. The
 *   household-level `watchedTogether` exclusion set already serves "don't re-recommend something
 *   this household watched together", which is what the pivoted product actually needs.
 * - Hydration widens from a fixed top-3 to top-10 when the household is LLM-rerank eligible (see
 *   `pickForHousehold`), runs its TMDb calls in parallel instead of sequentially, and keeps each
 *   hydrated card paired with its originating scored candidate throughout -- the Express version
 *   read `top[0]` for the picked candidate's genre_ids independently of which entry actually
 *   became `cards[0]`, which silently mismatches once provider filtering drops an earlier
 *   candidate. Keeping the pairing intact fixes that.
 * - `providersMatch` and the rationale's provider-name lookup both widen from flatrate-only to
 *   flatrate+free+ads+rent+buy, matching `providerLaunch.service.ts`'s definition of "available".
 * - The LLM re-rank (`lib/llm.ts`, previously unwired dead code) is now wired in behind
 *   `isLlmRerankEnabledForHousehold`, with a validated fall-through to the pure-ML top-1 pick
 *   whenever it's disabled, ineligible, or fails.
 *
 * Known, out-of-scope gap: nothing in this port computes `taste_profiles` rows going forward (the
 * Express `tasteProfile.service.ts` `recompute*` functions are entirely built on the same
 * `WatchlistEntry` table being deleted, so there's no straight port). `pickForHousehold` only
 * reads whatever taste profiles already exist; `mergeProfiles` degrades to mood-only genre
 * filtering when a household has none, which is the common case pre-launch. Deriving taste
 * weights from `watchedTogether` instead is a real product decision (what signal, what decay)
 * left for a follow-up rather than decided inline here.
 */

export class HouseholdNotFoundError extends Error {
	constructor() {
		super('household_not_found');
		this.name = 'HouseholdNotFoundError';
	}
}

export class NoCandidatesError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NoCandidatesError';
	}
}

export type RecommendationCard = {
	tmdbId: number;
	mediaType: 'movie' | 'tv';
	title: string;
	year: number | null;
	runtime: number | null;
	overview: string;
	posterPath: string | null;
	providers: RegionProviders;
};

export type RecommendationResult = {
	pick: RecommendationCard;
	alternates: RecommendationCard[];
	rationale: string;
	score: number;
};

const gaussian = (x: number, mu: number, sigma: number): number => {
	const z = (x - mu) / sigma;
	return Math.exp(-0.5 * z * z);
};

const mergeProfiles = (profiles: TasteProfileRow[]): Record<number, number> => {
	if (profiles.length === 0) return {};
	const allGenreKeys = new Set<string>();
	for (const p of profiles) {
		for (const k of Object.keys(p.weights.genres ?? {})) {
			allGenreKeys.add(k);
		}
	}

	const merged: Record<number, number> = {};
	for (const k of allGenreKeys) {
		let product = 1;
		for (const p of profiles) {
			const w = p.weights.genres?.[k] ?? 0;
			product *= w;
		}
		const id = Number(k);
		if (!Number.isNaN(id)) merged[id] = product;
	}

	const max = Math.max(...Object.values(merged), 0);
	if (max <= 0) return merged;
	for (const k of Object.keys(merged)) {
		const id = Number(k);
		merged[id] = (merged[id] ?? 0) / max;
	}
	return merged;
};

const topMergedGenres = (
	merged: Record<number, number>,
	moodGenres: number[],
	limit = 3
): number[] => {
	const sorted = Object.entries(merged)
		.map(([id, w]) => [Number(id), w] as const)
		.sort((a, b) => b[1] - a[1])
		.map(([id]) => id);
	const top = sorted.slice(0, limit);
	return Array.from(new Set<number>([...top, ...moodGenres]));
};

const genreWeightsByName = (
	idWeights: Record<string, number> | undefined
): Record<string, number> => {
	if (!idWeights) return {};
	const byName: Record<string, number> = {};
	for (const [idStr, weight] of Object.entries(idWeights)) {
		const name = GENRE_NAMES[Number(idStr)];
		if (name) byName[name] = weight;
	}
	return byName;
};

const getYear = (item: TMDbDiscoverMovie | TMDbDiscoverTV): number | null => {
	// TMDbDiscoverMovie/TV are structurally disjoint on these two date fields; the caller doesn't
	// have a mediaType to discriminate on in every use of this helper, so check both fields.
	const dateStr =
		(item as TMDbDiscoverMovie).release_date ??
		(item as TMDbDiscoverTV).first_air_date;
	if (!dateStr) return null;
	const year = parseInt(dateStr.slice(0, 4), 10);
	return Number.isNaN(year) ? null : year;
};

const getTitle = (
	item: TMDbDiscoverMovie | TMDbDiscoverTV,
	mediaType: 'movie' | 'tv'
): string =>
	mediaType === 'movie'
		? (item as TMDbDiscoverMovie).title // mediaType is caller-supplied, so it safely discriminates the union
		: (item as TMDbDiscoverTV).name;

const scoreCandidate = (
	item: TMDbDiscoverMovie | TMDbDiscoverTV,
	runtime: number | null,
	mergedGenres: Record<number, number>,
	moodGenres: number[],
	targetMinutes: number,
	currentYear: number
): number => {
	const genreIds = item.genre_ids ?? [];

	let genreSum = 0;
	let genreCount = 0;
	for (const g of genreIds) {
		const w = mergedGenres[g];
		if (w !== undefined) {
			genreSum += w;
			genreCount += 1;
		}
	}
	const genreMatch = genreCount > 0 ? genreSum / genreCount : 0;

	const runtimeFit =
		runtime !== null && runtime > 0
			? gaussian(runtime, targetMinutes - 10, 25)
			: 0.5;

	const moodHit = genreIds.some(g => moodGenres.includes(g)) ? 1 : 0;

	const year = getYear(item);
	const yearsOld = year !== null ? Math.max(0, currentYear - year) : 20;
	const recencyBonus = Math.max(0, 1 - yearsOld / 30);

	return (
		0.5 * genreMatch + 0.2 * runtimeFit + 0.15 * moodHit + 0.15 * recencyBonus
	);
};

const providersMatch = (
	providers: RegionProviders,
	wanted: string[]
): boolean => {
	if (wanted.length === 0) return true;
	const available = [
		...(providers.flatrate ?? []),
		...(providers.free ?? []),
		...(providers.ads ?? []),
		...(providers.rent ?? []),
		...(providers.buy ?? []),
	];
	const wantedNorm = wanted.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, ''));
	return available.some(p => {
		const name = p.provider_name.toLowerCase().replace(/[^a-z0-9]/g, '');
		return wantedNorm.some(w => name.includes(w) || w.includes(name));
	});
};

const buildRationale = (
	moodLabel: string,
	pickGenres: number[],
	mergedGenres: Record<number, number>,
	targetMinutes: number,
	runtime: number | null,
	providerName: string | null
): string => {
	const sharedGenre = pickGenres
		.map(g => ({ g, w: mergedGenres[g] ?? 0, name: GENRE_NAMES[g] }))
		.filter(x => x.w > 0.3 && x.name)
		.sort((a, b) => b.w - a.w)[0];

	const parts: string[] = [];
	if (sharedGenre) {
		parts.push(`Both of you lean ${sharedGenre.name}`);
	} else {
		parts.push(`Matches your ${moodLabel} mood`);
	}
	if (runtime !== null && runtime > 0) {
		parts.push(`fits your ${targetMinutes}-minute slot at ${runtime} min`);
	}
	if (providerName) {
		parts.push(`available on ${providerName}`);
	}
	return `${parts.join('; ')}.`;
};

const hydrate = async (
	env: Bindings,
	item: TMDbDiscoverMovie | TMDbDiscoverTV,
	mediaType: 'movie' | 'tv',
	region: string,
	providersFilter?: string[]
): Promise<RecommendationCard | null> => {
	let runtime: number | null;
	try {
		if (mediaType === 'movie') {
			const full = await getMovieFullDetails(env, item.id);
			runtime = full.runtime ?? null;
		} else {
			const full = await getTVFullDetails(env, item.id);
			runtime = full.episode_run_time?.[0] ?? null;
		}
	} catch {
		runtime = null;
	}

	let providers: RegionProviders = {};
	if (providersFilter && providersFilter.length > 0) {
		try {
			providers = await getWatchProviders(env, item.id, mediaType, region);
		} catch {
			providers = {};
		}
		if (!providersMatch(providers, providersFilter)) {
			return null;
		}
	}

	return {
		tmdbId: item.id,
		mediaType,
		title: getTitle(item, mediaType),
		year: getYear(item),
		runtime,
		overview: item.overview,
		posterPath: item.poster_path,
		providers,
	};
};

const pickProviderName = (providers: RegionProviders): string | null =>
	providers.flatrate?.[0]?.provider_name ??
	providers.free?.[0]?.provider_name ??
	providers.ads?.[0]?.provider_name ??
	providers.rent?.[0]?.provider_name ??
	providers.buy?.[0]?.provider_name ??
	null;

export const pickForHousehold = async (
	env: Bindings,
	db: Database,
	householdId: string,
	request: PickRequest
): Promise<RecommendationResult> => {
	const region = request.region ?? 'GB';
	const moodCfg = MOOD_FILTERS[request.mood];

	const members = await db
		.select({ userId: householdMembers.userId })
		.from(householdMembers)
		.where(eq(householdMembers.householdId, householdId));
	if (members.length === 0) {
		throw new HouseholdNotFoundError();
	}
	const memberIds = members.map(m => m.userId);

	const profiles = await db
		.select()
		.from(tasteProfiles)
		.where(inArray(tasteProfiles.userId, memberIds));
	const merged = mergeProfiles(profiles);
	const genres = topMergedGenres(merged, moodCfg.genres, 3);

	const watchedRows = await db
		.select({ tmdbId: watchedTogether.tmdbId })
		.from(watchedTogether)
		.where(eq(watchedTogether.householdId, householdId));
	const excluded = new Set<number>([
		...watchedRows.map(w => w.tmdbId),
		...(request.excludeTmdbIds ?? []),
	]);

	const discoverResp = await discoverMedia(env, {
		mediaType: 'movie',
		genres,
		withRuntimeLte: request.minutes,
		voteCountGte: 200,
		region,
	});
	const filtered = (discoverResp.results ?? []).filter(
		c => !excluded.has(c.id)
	);
	if (filtered.length === 0) {
		throw new NoCandidatesError('No candidates found for these inputs');
	}

	const currentYear = new Date().getFullYear();
	const scored = filtered
		.map(item => ({
			item,
			// /discover responses don't carry runtime; use null so the runtime component contributes
			// a neutral 0.5 instead of the gaussian peak -- real runtime is fetched during hydration
			// below, for display only, and never re-scored.
			score: scoreCandidate(
				item,
				null,
				merged,
				moodCfg.genres,
				request.minutes,
				currentYear
			),
		}))
		.sort((a, b) =>
			b.score !== a.score
				? b.score - a.score
				: b.item.vote_average - a.item.vote_average
		);

	const llmEligible = await isLlmRerankEnabledForHousehold(db, householdId);
	const top = scored.slice(0, llmEligible ? 10 : 3);

	const hydrated = await Promise.all(
		top.map(async entry => ({
			entry,
			card: await hydrate(env, entry.item, 'movie', region, request.providers),
		}))
	);
	const paired = hydrated.filter(
		(h): h is { entry: (typeof top)[number]; card: RecommendationCard } =>
			h.card !== null
	);
	if (paired.length === 0) {
		throw new NoCandidatesError('No candidates matched the provider filter');
	}

	const cards = paired.map(p => p.card);
	const mlPick = paired[0]!;
	const mlResult: RecommendationResult = {
		pick: mlPick.card,
		alternates: cards.slice(1, 3),
		rationale: buildRationale(
			moodCfg.label,
			mlPick.entry.item.genre_ids ?? [],
			merged,
			request.minutes,
			mlPick.card.runtime,
			pickProviderName(mlPick.card.providers)
		),
		score: mlPick.entry.score,
	};

	if (!llmEligible || paired.length < 2) {
		return mlResult;
	}

	const tasteProfilesForLlm: LlmTasteProfile[] = profiles.map(p => ({
		userId: p.userId,
		summary: summariseTasteProfile({
			userId: p.userId,
			genreWeights: genreWeightsByName(p.weights.genres),
			preferredRuntime: p.weights.runtime_pref ?? null,
		}),
	}));

	const llmCandidates: LlmCandidate[] = paired.map(p => ({
		tmdbId: p.card.tmdbId,
		title: p.card.title,
		year: p.card.year ?? currentYear,
		runtime: p.card.runtime ?? 0,
		overview: p.card.overview,
		genres: (p.entry.item.genre_ids ?? [])
			.map(id => GENRE_NAMES[id])
			.filter((name): name is string => Boolean(name)),
	}));

	const llmResult = await maybeRerank(env, db, llmCandidates, {
		mood: request.mood,
		minutes: request.minutes,
		tasteProfiles: tasteProfilesForLlm,
		householdId,
	});
	if (!llmResult) return mlResult;

	const byTmdbId = new Map(paired.map(p => [p.card.tmdbId, p]));
	const llmPick = byTmdbId.get(llmResult.pickTmdbId);
	if (!llmPick) return mlResult;

	const llmAlternates = llmResult.alternatesTmdbIds
		.map(id => byTmdbId.get(id)?.card)
		.filter((c): c is RecommendationCard => c !== undefined)
		.slice(0, 2);

	return {
		pick: llmPick.card,
		alternates: llmAlternates,
		rationale: llmResult.rationale,
		score: llmPick.entry.score,
	};
};

export const commitPick = async (
	db: Database,
	householdId: string,
	userId: string,
	tmdbId: number,
	request: CommitPickRequest
): Promise<{ id: string }> => {
	const id = newId('watchedtogether');
	await db.insert(watchedTogether).values({
		id,
		householdId,
		tmdbId,
		mediaType: request.mediaType,
		watchedAt: new Date(),
		enjoyed: null,
		moodAtPick: request.mood ?? null,
		minutesBudgetAtPick: request.minutes ?? null,
	});
	await recordPickEvent(db, {
		householdId,
		userId,
		tmdbId,
		mediaType: request.mediaType,
		kind: 'accepted',
		mood: request.mood ?? null,
		minutesBudget: request.minutes ?? null,
	});
	return { id };
};
