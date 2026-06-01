import models from '../models';
import {
	type TMDbDiscoverMovie,
	type TMDbDiscoverTV,
	discoverMedia,
	getMovieFullDetails,
	getTVFullDetails,
	getWatchProviders,
} from './tmdb.service';
import type {
	HouseholdRepository,
	HouseholdStub,
	Mood,
	PickForHouseholdInput,
	RecommendationCard,
	RecommendationResult,
	TasteProfileStub,
	WatchProvidersResult,
	WatchedTogetherStub,
} from './recommendation.types';

const MOOD_FILTERS: Record<Mood, { genres: number[]; label: string }> = {
	funny: { genres: [35], label: 'comedy' },
	dark: { genres: [80, 53], label: 'dark crime/thriller' },
	feelgood: { genres: [10751, 35], label: 'feel-good' },
	tense: { genres: [53, 27], label: 'tense thriller/horror' },
	romantic: { genres: [10749], label: 'romance' },
	thoughtful: { genres: [18], label: 'thoughtful drama' },
	action: { genres: [28, 12], label: 'action/adventure' },
};

const GENRE_NAMES: Record<number, string> = {
	28: 'action',
	12: 'adventure',
	16: 'animation',
	35: 'comedy',
	80: 'crime',
	99: 'documentary',
	18: 'drama',
	10751: 'family',
	14: 'fantasy',
	36: 'history',
	27: 'horror',
	10402: 'music',
	9648: 'mystery',
	10749: 'romance',
	878: 'sci-fi',
	53: 'thriller',
	10752: 'war',
	37: 'western',
};

interface CacheEntry<T> {
	value: T;
	expiresAt: number;
}

const THIRTY_MIN_MS = 30 * 60 * 1000;
const candidateCache = new Map<
	string,
	CacheEntry<(TMDbDiscoverMovie | TMDbDiscoverTV)[]>
>();

function minutesBucket(minutes: number): number {
	return Math.round(minutes / 15) * 15;
}

function gaussian(x: number, mu: number, sigma: number): number {
	const z = (x - mu) / sigma;
	return Math.exp(-0.5 * z * z);
}

function mergeProfiles(profiles: TasteProfileStub[]): Record<number, number> {
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
}

function topMergedGenres(
	merged: Record<number, number>,
	moodGenres: number[],
	limit = 3
): number[] {
	const sorted = Object.entries(merged)
		.map(([id, w]) => [Number(id), w] as const)
		.sort((a, b) => b[1] - a[1])
		.map(([id]) => id);
	const top = sorted.slice(0, limit);
	const set = new Set<number>([...top, ...moodGenres]);
	return Array.from(set);
}

function getYear(item: TMDbDiscoverMovie | TMDbDiscoverTV): number | null {
	const dateStr =
		(item as TMDbDiscoverMovie).release_date ??
		(item as TMDbDiscoverTV).first_air_date;
	if (!dateStr) return null;
	const y = parseInt(dateStr.slice(0, 4), 10);
	return Number.isNaN(y) ? null : y;
}

function getTitle(
	item: TMDbDiscoverMovie | TMDbDiscoverTV,
	mediaType: 'movie' | 'tv'
): string {
	return mediaType === 'movie'
		? (item as TMDbDiscoverMovie).title
		: (item as TMDbDiscoverTV).name;
}

function scoreCandidate(
	item: TMDbDiscoverMovie | TMDbDiscoverTV,
	runtime: number | null,
	mergedGenres: Record<number, number>,
	moodGenres: number[],
	targetMinutes: number,
	currentYear: number
): {
	score: number;
	parts: { genre: number; runtime: number; mood: number; recency: number };
} {
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

	const score =
		0.5 * genreMatch + 0.2 * runtimeFit + 0.15 * moodHit + 0.15 * recencyBonus;

	return {
		score,
		parts: {
			genre: genreMatch,
			runtime: runtimeFit,
			mood: moodHit,
			recency: recencyBonus,
		},
	};
}

function providersMatch(
	providers: WatchProvidersResult,
	wanted: string[]
): boolean {
	if (wanted.length === 0) return true;
	const flatrate = providers.flatrate ?? [];
	const wantedNorm = wanted.map(p => p.toLowerCase().replace(/[^a-z0-9]/g, ''));
	return flatrate.some(p => {
		const name = p.provider_name.toLowerCase().replace(/[^a-z0-9]/g, '');
		return wantedNorm.some(w => name.includes(w) || w.includes(name));
	});
}

function buildRationale(
	pickTitle: string,
	moodLabel: string,
	pickGenres: number[],
	mergedGenres: Record<number, number>,
	targetMinutes: number,
	runtime: number | null,
	providerName: string | null
): string {
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
}

export class RecommendationService {
	constructor(private readonly repo: HouseholdRepository) {}

	async pickForHousehold(
		input: PickForHouseholdInput
	): Promise<RecommendationResult> {
		const region = input.region ?? 'GB';
		const moodCfg = MOOD_FILTERS[input.mood];

		const household = await this.repo.getHousehold(input.householdId);
		if (!household) {
			throw new Error('Household not found');
		}

		const profiles = await this.repo.getMemberTasteProfiles(
			household.member_ids
		);
		const merged = mergeProfiles(profiles);
		const genres = topMergedGenres(merged, moodCfg.genres, 3);

		const watched = await this.repo.getWatchedTogether(input.householdId);
		const finished = await this.repo.getFinishedTmdbIdsForMembers(
			household.member_ids
		);

		const excluded = new Set<number>([
			...watched.map(w => w.tmdb_id),
			...finished,
			...(input.excludeTmdbIds ?? []),
		]);

		const cacheKey = `${input.mood}:${minutesBucket(input.minutes)}:${region}`;
		const candidates = candidateCache.get(cacheKey);
		let candidateList: (TMDbDiscoverMovie | TMDbDiscoverTV)[];
		if (candidates && candidates.expiresAt > Date.now()) {
			candidateList = candidates.value;
		} else {
			const discoverResp = await discoverMedia({
				mediaType: 'movie',
				genres,
				withRuntimeLte: input.minutes,
				voteCountGte: 200,
				region,
			});
			candidateList = discoverResp.results ?? [];
			candidateCache.set(cacheKey, {
				value: candidateList,
				expiresAt: Date.now() + THIRTY_MIN_MS,
			});
		}

		const filtered = candidateList.filter(c => !excluded.has(c.id));

		const currentYear = new Date().getFullYear();
		const scored = filtered.map(item => {
			// /discover responses don't carry runtime; use null so the runtime
			// component contributes a neutral 0.5 instead of the gaussian peak.
			const { score } = scoreCandidate(
				item,
				null,
				merged,
				moodCfg.genres,
				input.minutes,
				currentYear
			);
			return { item, score };
		});

		scored.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			return b.item.vote_average - a.item.vote_average;
		});

		const top = scored.slice(0, 3);
		if (top.length === 0) {
			throw new Error('No candidates found for these inputs');
		}

		const cards: RecommendationCard[] = [];
		for (const entry of top) {
			const card = await this.hydrate(
				entry.item,
				'movie',
				region,
				input.providers
			);
			if (card) cards.push(card);
		}

		if (cards.length === 0) {
			throw new Error('No candidates matched the provider filter');
		}

		const pick = cards[0]!;
		const alternates = cards.slice(1, 3);

		const pickGenres = top[0]!.item.genre_ids ?? [];
		const providerName = pick.providers.flatrate?.[0]?.provider_name ?? null;
		const rationale = buildRationale(
			pick.title,
			moodCfg.label,
			pickGenres,
			merged,
			input.minutes,
			pick.runtime,
			providerName
		);

		return {
			pick,
			alternates,
			rationale,
			score: top[0]!.score,
		};
	}

	private async hydrate(
		item: TMDbDiscoverMovie | TMDbDiscoverTV,
		mediaType: 'movie' | 'tv',
		region: string,
		providersFilter?: string[]
	): Promise<RecommendationCard | null> {
		let runtime: number | null = null;
		try {
			if (mediaType === 'movie') {
				const full = await getMovieFullDetails(item.id);
				runtime = full.runtime ?? null;
			} else {
				const full = await getTVFullDetails(item.id);
				runtime = full.episode_run_time?.[0] ?? null;
			}
		} catch {
			runtime = null;
		}

		let providers: WatchProvidersResult = {};
		if (providersFilter && providersFilter.length > 0) {
			try {
				providers = await getWatchProviders(item.id, mediaType, region);
			} catch {
				providers = {};
			}
			if (!providersMatch(providers, providersFilter)) {
				return null;
			}
		}

		return {
			tmdb_id: item.id,
			media_type: mediaType,
			title: getTitle(item, mediaType),
			year: getYear(item),
			runtime,
			overview: item.overview,
			poster_path: item.poster_path,
			providers,
		};
	}
}

class WatchlistBackedRepository implements HouseholdRepository {
	async getHousehold(householdId: string): Promise<HouseholdStub | null> {
		const members = await models.HouseholdMember.findAll({
			where: { household_id: householdId },
		});
		if (members.length === 0) return null;
		return {
			household_id: householdId,
			member_ids: members.map(m => m.user_id),
		};
	}

	async getMemberTasteProfiles(
		memberIds: string[]
	): Promise<TasteProfileStub[]> {
		if (memberIds.length === 0) return [];
		const rows = await models.TasteProfile.findAll({
			where: { user_id: memberIds },
		});
		return rows.map(r => ({
			user_id: r.user_id,
			weights: r.weights as TasteProfileStub['weights'],
			embedding: r.embedding,
		}));
	}

	async getWatchedTogether(
		householdId: string
	): Promise<WatchedTogetherStub[]> {
		const rows = await models.WatchedTogether.findAll({
			where: { household_id: householdId },
		});
		return rows.map<WatchedTogetherStub>(r => ({
			household_id: r.household_id,
			tmdb_id: r.tmdb_id,
			media_type: r.media_type,
			watched_at: r.watched_at,
			enjoyed: r.enjoyed,
			mood_at_pick: (r.mood_at_pick ?? null) as Mood | null,
			minutes_budget_at_pick: r.minutes_budget_at_pick,
		}));
	}

	async getFinishedTmdbIdsForMembers(memberIds: string[]): Promise<number[]> {
		if (memberIds.length === 0) return [];
		const rows = await models.WatchlistEntry.findAll({
			where: { user_id: memberIds, status: 'finished' },
		});
		return rows.map(r => r.tmdb_id);
	}

	async recordWatchedTogether(
		row: Omit<WatchedTogetherStub, 'watched_at'> & { watched_at?: Date }
	): Promise<void> {
		await models.WatchedTogether.create({
			household_id: row.household_id,
			tmdb_id: row.tmdb_id,
			media_type: row.media_type,
			watched_at: row.watched_at ?? new Date(),
			enjoyed: row.enjoyed ?? null,
			mood_at_pick: row.mood_at_pick ?? null,
			minutes_budget_at_pick: row.minutes_budget_at_pick ?? null,
		});
	}

	async isMember(householdId: string, userId: string): Promise<boolean> {
		const m = await models.HouseholdMember.findOne({
			where: { household_id: householdId, user_id: userId },
		});
		return m !== null;
	}
}

export const defaultRecommendationService = new RecommendationService(
	new WatchlistBackedRepository()
);

export { MOOD_FILTERS };
