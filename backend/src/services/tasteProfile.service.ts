import Household from '../models/Household';
import HouseholdMember from '../models/HouseholdMember';
import TasteProfile, { type TasteWeights } from '../models/TasteProfile';
import WatchlistEntry from '../models/WatchlistEntry';
import { getMovieDetails, getTVDetails } from './tmdb.service';

const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

interface TitleDetails {
	genre_ids: number[];
	runtime: number | null;
}

async function fetchTitleDetails(
	tmdbId: number,
	mediaType: 'movie' | 'tv'
): Promise<TitleDetails | null> {
	try {
		if (mediaType === 'movie') {
			const movie = await getMovieDetails(tmdbId);
			return {
				genre_ids: (movie.genres ?? []).map(g => g.id),
				runtime: movie.runtime ?? null,
			};
		}
		const tv = await getTVDetails(tmdbId);
		const runtimes = tv.episode_run_time ?? [];
		return {
			genre_ids: (tv.genres ?? []).map(g => g.id),
			runtime: runtimes.length > 0 ? (runtimes[0] ?? null) : null,
		};
	} catch {
		return null;
	}
}

function median(values: number[]): number | null {
	if (values.length === 0) return null;
	const sorted = [...values].sort((a, b) => a - b);
	const mid = Math.floor(sorted.length / 2);
	if (sorted.length % 2 === 0) {
		return ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
	}
	return sorted[mid] ?? null;
}

export async function recomputeForUser(userId: string): Promise<TasteProfile> {
	const entries = await WatchlistEntry.findAll({ where: { user_id: userId } });

	const genreCounts: Record<string, number> = {};
	const ratedRuntimes: number[] = [];

	for (const entry of entries) {
		const details = await fetchTitleDetails(entry.tmdb_id, entry.media_type);
		if (!details) continue;

		for (const genreId of details.genre_ids) {
			const key = String(genreId);
			genreCounts[key] = (genreCounts[key] ?? 0) + 1;
		}

		if (
			entry.rating !== undefined &&
			entry.rating !== null &&
			entry.rating >= 7 &&
			details.runtime !== null
		) {
			ratedRuntimes.push(details.runtime);
		}
	}

	const total = Object.values(genreCounts).reduce((s, v) => s + v, 0);
	const genres: Record<string, number> = {};
	if (total > 0) {
		for (const [key, count] of Object.entries(genreCounts)) {
			genres[key] = count / total;
		}
	}

	const weights: TasteWeights = {
		genres,
		runtime_pref: median(ratedRuntimes),
		era: {},
		tone: {},
	};

	const [profile] = await TasteProfile.upsert({
		user_id: userId,
		weights,
	});

	return profile;
}

export interface HouseholdMemberProfile {
	user_id: string;
	weights: TasteWeights;
}

export async function recomputeForHousehold(
	householdId: string
): Promise<HouseholdMemberProfile[]> {
	const household = await Household.findByPk(householdId, {
		include: [{ model: HouseholdMember, as: 'memberships' }],
	});
	if (!household) return [];

	const memberships =
		(household.get('memberships') as HouseholdMember[] | undefined) ?? [];

	const results: HouseholdMemberProfile[] = [];
	const now = Date.now();

	for (const membership of memberships) {
		const existing = await TasteProfile.findByPk(membership.user_id);
		const isStale =
			!existing ||
			now - new Date(existing.updated_at).getTime() > STALE_AFTER_MS;
		const profile = isStale
			? await recomputeForUser(membership.user_id)
			: existing;
		results.push({ user_id: profile.user_id, weights: profile.weights });
	}

	return results;
}
