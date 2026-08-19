import {
	householdMembers,
	tasteProfiles,
	watchedTogether,
	type Database,
	type TasteProfileRow,
} from '@pairflix/db';
import { eq, inArray } from 'drizzle-orm';
import type {
	CommitPickRequest,
	Mood,
	PickRequest,
} from '@pairflix/lib.validation';
import type { Bindings } from '../types';
import { eraBucketForYear } from './eras';
import { isLlmRerankEnabledForHousehold } from './featureFlags';
import {
	GENRE_NAMES,
	MOOD_FILTERS,
	TV_ACTION_ADVENTURE_GENRE_ID,
	TV_COMPATIBLE_GENRE_IDS,
	toMovieGenreIds,
} from './genres';
import { newId } from './id';
import {
	rerankCandidates,
	type LlmCandidate,
	type LlmRerankResult,
	type LlmTasteProfile,
} from './llm';
import { recordPickEvent } from './pickEvents';
import { cacheContentDetails, getCachedProviders } from './providers';
import { summariseTasteProfile } from './tasteSummary';
import { NEUTRAL_ERA_WEIGHT, NEUTRAL_TONE_WEIGHT } from './tasteWeights';
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
 * `taste_profiles` gets its first writer from `lib/tasteRecompute.ts`: a watched-together thumbs
 * rating (`PATCH /:id/history/:watchedId`) nudges every current member's genre weights via an EMA.
 * `pickForHousehold` still only reads whatever exists here; `mergeProfiles` still degrades to
 * mood-only genre filtering for a household with no ratings yet, which remains the common case
 * until ratings accumulate. `runtime_pref`/`era`/`tone` still have no writer -- deriving those from
 * `watchedTogether` (what signal, what decay) remains a follow-up, not decided here.
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

/** Merges one taste-weights dimension (genre/era/tone -- whichever `select` reads) multiplicatively
 * across household members, normalizing so the top key lands at exactly 1.0. A key absent from any
 * one member's profile counts as 0 for that member, which is why every taste-profile writer keeps
 * its dense-fill invariant (see `lib/tasteWeights.ts`) -- a sparse write would zero out that key the
 * moment it's merged against a partner's profile that does have a value there. */
const mergeWeightRecord = (
	profiles: TasteProfileRow[],
	select: (
		weights: TasteProfileRow['weights']
	) => Record<string, number> | undefined
): Record<string, number> => {
	if (profiles.length === 0) return {};
	const allKeys = new Set<string>();
	for (const p of profiles) {
		for (const k of Object.keys(select(p.weights) ?? {})) {
			allKeys.add(k);
		}
	}

	const merged: Record<string, number> = {};
	for (const k of allKeys) {
		let product = 1;
		for (const p of profiles) {
			const w = select(p.weights)?.[k] ?? 0;
			product *= w;
		}
		merged[k] = product;
	}

	const max = Math.max(...Object.values(merged), 0);
	if (max <= 0) return merged;
	for (const k of Object.keys(merged)) {
		merged[k] = (merged[k] ?? 0) / max;
	}
	return merged;
};

const mergeProfiles = (profiles: TasteProfileRow[]): Record<number, number> => {
	const merged = mergeWeightRecord(profiles, w => w.genres);
	// Genre keys are always numeric-string ids; every other caller of this merge (era, tone) wants
	// its keys left as strings, so the numeric conversion happens here, not inside the shared helper.
	const byId: Record<number, number> = {};
	for (const [k, v] of Object.entries(merged)) {
		const id = Number(k);
		if (!Number.isNaN(id)) byId[id] = v;
	}
	return byId;
};

const mergeEra = (profiles: TasteProfileRow[]): Record<string, number> =>
	mergeWeightRecord(profiles, w => w.era);

const mergeTone = (profiles: TasteProfileRow[]): Record<string, number> =>
	mergeWeightRecord(profiles, w => w.tone);

/** Not a weight-per-key record like the other three dimensions -- a single scalar minutes estimate
 * per user, so "merging across the household" is just an average of whichever members have rated
 * enough to have one yet. `null` (not 0) when nobody does, so callers can tell "no signal" apart
 * from "the household prefers 0-minute films". */
const mergeRuntimePref = (profiles: TasteProfileRow[]): number | null => {
	const values = profiles
		.map(p => p.weights.runtime_pref)
		.filter((v): v is number => v !== null && v !== undefined);
	if (values.length === 0) return null;
	return values.reduce((sum, v) => sum + v, 0) / values.length;
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

/** The household's merged genre/era/tone weights plus its averaged runtime_pref -- everything
 * `scoreCandidate` needs from `taste_profiles`, bundled so its own parameter list doesn't grow one
 * entry per learned dimension. */
type MergedPreferences = {
	genres: Record<number, number>;
	era: Record<string, number>;
	tone: Record<string, number>;
	runtimePref: number | null;
};

const scoreCandidate = (
	item: TMDbDiscoverMovie | TMDbDiscoverTV,
	runtime: number | null,
	prefs: MergedPreferences,
	moodGenres: number[],
	mood: Mood,
	targetMinutes: number,
	currentYear: number
): number => {
	// Already normalized to the movie genre-id space by the time a TV item reaches here -- see
	// where `candidates` is built in pickForHousehold.
	const genreIds = item.genre_ids ?? [];

	let genreSum = 0;
	let genreCount = 0;
	for (const g of genreIds) {
		const w = prefs.genres[g];
		if (w !== undefined) {
			genreSum += w;
			genreCount += 1;
		}
	}
	const genreMatch = genreCount > 0 ? genreSum / genreCount : 0;

	// Blends the household's learned runtime_pref into the gaussian's center, weighted toward the
	// request's own minutes budget (0.7) over the historical average (0.3) -- "how long do you have
	// tonight" is explicitly a per-request input to this product (see CLAUDE.md), not a household
	// trait that should override what was actually asked for. `runtimePref === null` (no rating with
	// a known runtime yet) collapses this to exactly `targetMinutes - 10`, the original center.
	const runtimeCenter =
		prefs.runtimePref !== null
			? 0.7 * targetMinutes + 0.3 * prefs.runtimePref - 10
			: targetMinutes - 10;
	const runtimeFit =
		runtime !== null && runtime > 0
			? gaussian(runtime, runtimeCenter, 25)
			: 0.5;

	// Blends the flat mood-genre-overlap check with the household's learned enjoyment rate for this
	// specific mood (`tone`) -- a household that repeatedly picks "tense" and doesn't enjoy it scores
	// tense candidates a little lower even though the genre still matches. NEUTRAL_TONE_WEIGHT (same
	// value as the density-fill neutral genre/era writers use) keeps an unrated mood from swinging
	// this either direction.
	const genreMoodHit = genreIds.some(g => moodGenres.includes(g)) ? 1 : 0;
	const moodHit =
		0.5 * genreMoodHit + 0.5 * (prefs.tone[mood] ?? NEUTRAL_TONE_WEIGHT);

	// Same blend shape as moodHit, using the household's learned era preference alongside the
	// existing flat "newer is better" recency heuristic.
	const year = getYear(item);
	const yearsOld = year !== null ? Math.max(0, currentYear - year) : 20;
	const recencyBonus = Math.max(0, 1 - yearsOld / 30);
	const eraBucket = year !== null ? eraBucketForYear(year) : null;
	const eraPref =
		eraBucket !== null
			? (prefs.era[eraBucket] ?? NEUTRAL_ERA_WEIGHT)
			: NEUTRAL_ERA_WEIGHT;
	const eraMatch = 0.5 * recencyBonus + 0.5 * eraPref;

	return 0.5 * genreMatch + 0.2 * runtimeFit + 0.15 * moodHit + 0.15 * eraMatch;
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

	// Fetched unconditionally -- this is display data for the returned card, independent of
	// whether the caller also wants to filter candidates down to a provider subset below.
	let providers: RegionProviders = {};
	try {
		providers = await getWatchProviders(env, item.id, mediaType, region);
	} catch {
		providers = {};
	}
	if (
		providersFilter &&
		providersFilter.length > 0 &&
		!providersMatch(providers, providersFilter)
	) {
		return null;
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
	const prefs: MergedPreferences = {
		genres: merged,
		era: mergeEra(profiles),
		tone: mergeTone(profiles),
		runtimePref: mergeRuntimePref(profiles),
	};

	const watchedRows = await db
		.select({
			tmdbId: watchedTogether.tmdbId,
			mediaType: watchedTogether.mediaType,
		})
		.from(watchedTogether)
		.where(eq(watchedTogether.householdId, householdId));
	// Keyed by tmdbId+mediaType, not tmdbId alone -- movie and TV ids are assigned from separate
	// TMDb id spaces, so a watched movie must not exclude an unrelated TV show (or vice versa)
	// that happens to share the same numeric id, now that both are candidate sources below.
	const excludedWatched = new Set<string>(
		watchedRows.map(w => `${w.tmdbId}:${w.mediaType}`)
	);
	const excludedRequested = new Set<number>(request.excludeTmdbIds ?? []);

	const discoverParams = {
		genres,
		withRuntimeLte: request.minutes,
		voteCountGte: 200,
		region,
	};
	// Only fetch TV candidates when every genre the *mood itself* filters on is valid in TV's genre
	// taxonomy -- see TV_COMPATIBLE_GENRE_IDS's doc comment. The up-to-3 extra ids pulled in from
	// the household's taste weights don't gate eligibility -- an eligible mood can still pull in an
	// incompatible one, so the TV call filters `genres` (mood + taste extras) down to the
	// compatible subset itself, not the full list the movie call uses. Action (28) and Adventure
	// (12) aren't literally in TV_COMPATIBLE_GENRE_IDS -- TMDb merges them into the
	// differently-numbered TV_ACTION_ADVENTURE_GENRE_ID -- so both the eligibility check and the
	// filter treat that pair as compatible too, remapped to the TV id `/discover/tv` actually
	// understands.
	const isTvCompatibleGenre = (g: number) =>
		TV_COMPATIBLE_GENRE_IDS.has(g) || g === 28 || g === 12;
	const toTvGenreId = (g: number) =>
		g === 28 || g === 12 ? TV_ACTION_ADVENTURE_GENRE_ID : g;
	const tvEligible = moodCfg.genres.every(isTvCompatibleGenre);
	const [movieResp, tvResp] = await Promise.all([
		discoverMedia(env, { ...discoverParams, mediaType: 'movie' }),
		tvEligible
			? discoverMedia(env, {
					...discoverParams,
					genres: [
						...new Set(genres.filter(isTvCompatibleGenre).map(toTvGenreId)),
					],
					mediaType: 'tv',
				})
			: Promise.resolve({ results: [] }),
	]);

	const candidates = [
		...(movieResp.results ?? []).map(item => ({
			item,
			mediaType: 'movie' as const,
		})),
		// Normalized to the movie genre-id space here, once, so every downstream reader of
		// `item.genre_ids` (scoreCandidate, buildRationale, the LLM candidate payload) sees ids
		// consistent with GENRE_NAMES/taste_profiles.weights.genres/MOOD_FILTERS without each of
		// them needing to remember to expand TV_ACTION_ADVENTURE_GENRE_ID individually.
		...(tvResp.results ?? []).map(item => ({
			item: { ...item, genre_ids: toMovieGenreIds(item.genre_ids ?? []) },
			mediaType: 'tv' as const,
		})),
	];
	const filtered = candidates.filter(
		c =>
			!excludedWatched.has(`${c.item.id}:${c.mediaType}`) &&
			!excludedRequested.has(c.item.id)
	);
	if (filtered.length === 0) {
		throw new NoCandidatesError('No candidates found for these inputs');
	}

	const currentYear = new Date().getFullYear();
	const scored = filtered
		.map(c => ({
			...c,
			// /discover responses don't carry runtime; use null so the runtime component contributes
			// a neutral 0.5 instead of the gaussian peak for every candidate alike here. This score
			// only decides which candidates get hydrated (real runtime fetched below) -- the `ranked`
			// re-score after hydration is what actually decides the final pick.
			score: scoreCandidate(
				c.item,
				null,
				prefs,
				moodCfg.genres,
				request.mood,
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
			card: await hydrate(
				env,
				entry.item,
				entry.mediaType,
				region,
				request.providers
			),
		}))
	);
	const paired = hydrated.filter(
		(h): h is { entry: (typeof top)[number]; card: RecommendationCard } =>
			h.card !== null
	);
	if (paired.length === 0) {
		throw new NoCandidatesError('No candidates matched the provider filter');
	}

	// Re-score with each candidate's now-known real runtime (the scoring pass above used null,
	// since /discover doesn't carry it) and re-sort -- the pre-hydration order only ever reflected
	// a neutral runtime guess for every candidate alike, so this is the first point a candidate's
	// actual fit for the household's time budget can affect which one wins, not just display copy.
	const ranked = paired
		.map(p => ({
			...p,
			score: scoreCandidate(
				p.entry.item,
				p.card.runtime,
				prefs,
				moodCfg.genres,
				request.mood,
				request.minutes,
				currentYear
			),
		}))
		.sort((a, b) =>
			b.score !== a.score
				? b.score - a.score
				: b.entry.item.vote_average - a.entry.item.vote_average
		);

	const cards = ranked.map(p => p.card);
	const mlPick = ranked[0]!;
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
		score: mlPick.score,
	};

	if (!llmEligible || ranked.length < 2) {
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

	const llmCandidates: LlmCandidate[] = ranked.map(p => ({
		tmdbId: p.card.tmdbId,
		title: p.card.title,
		year: p.card.year ?? currentYear,
		runtime: p.card.runtime ?? 0,
		overview: p.card.overview,
		genres: (p.entry.item.genre_ids ?? [])
			.map(id => GENRE_NAMES[id])
			.filter((name): name is string => Boolean(name)),
	}));

	// llmEligible is already known (checked once above, to size hydration) -- call the Anthropic
	// client directly instead of through a self-checking wrapper that would re-read the same
	// settings/subscriptions rows for no reason.
	let llmResult: LlmRerankResult | null = null;
	try {
		llmResult = await rerankCandidates(env, {
			candidates: llmCandidates,
			tasteProfiles: tasteProfilesForLlm,
			mood: request.mood,
			minutes: request.minutes,
		});
	} catch (err) {
		console.warn(
			'[recommendation] LLM rerank unavailable',
			err instanceof Error ? err.message : 'Unknown error'
		);
	}
	if (!llmResult) return mlResult;

	const byTmdbId = new Map(ranked.map(p => [p.card.tmdbId, p]));
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
		score: llmPick.score,
	};
};

export const commitPick = async (
	env: Bindings,
	db: Database,
	householdId: string,
	userId: string,
	tmdbId: number,
	request: CommitPickRequest
): Promise<{ id: string }> => {
	const id = newId('watchedtogether');
	await Promise.all([
		db.insert(watchedTogether).values({
			id,
			householdId,
			tmdbId,
			mediaType: request.mediaType,
			watchedAt: new Date(),
			enjoyed: null,
			moodAtPick: request.mood ?? null,
			minutesBudgetAtPick: request.minutes ?? null,
		}),
		recordPickEvent(db, {
			householdId,
			userId,
			tmdbId,
			mediaType: request.mediaType,
			kind: 'accepted',
			mood: request.mood ?? null,
			minutesBudget: request.minutes ?? null,
		}),
		// Populates/refreshes the `content` cache row (providers, then title/year/runtime/poster) for
		// this title -- previously only `lib/providerLaunch.ts` ever wrote to `content`, so a pick
		// committed without a provider-launch happening first left `lib/history.ts`'s join with
		// nothing to return. Both calls are best-effort and never throw; they write disjoint columns,
		// so the order between them doesn't matter (see `cacheContentDetails`'s doc comment).
		getCachedProviders(env, db, tmdbId, request.mediaType),
		cacheContentDetails(env, db, tmdbId, request.mediaType),
	]);
	return { id };
};
