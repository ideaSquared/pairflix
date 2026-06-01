import Content from '../models/Content';
import { HouseholdMember } from '../models/Household';
import WatchedTogether from '../models/WatchedTogether';

export interface HistoryRow {
	id: string;
	household_id: string;
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	watched_at: Date;
	enjoyed: boolean | null;
	title: string | null;
	year: number | null;
	poster_path: string | null;
}

export const isHouseholdMember = async (
	userId: string,
	householdId: string
): Promise<boolean> => {
	const membership = await HouseholdMember.findOne({
		where: { user_id: userId, household_id: householdId },
	});
	return membership !== null;
};

export const getHouseholdHistory = async (
	householdId: string,
	limit: number = 50
): Promise<HistoryRow[]> => {
	const rows = await WatchedTogether.findAll({
		where: { household_id: householdId },
		order: [['watched_at', 'DESC']],
		limit,
	});

	const tmdbIds = Array.from(new Set(rows.map(r => r.tmdb_id)));
	const contents =
		tmdbIds.length > 0
			? await Content.findAll({ where: { tmdb_id: tmdbIds } })
			: [];
	const contentByTmdbId = new Map(contents.map(c => [c.tmdb_id, c]));

	return rows.map<HistoryRow>(row => {
		const content = contentByTmdbId.get(row.tmdb_id);
		return {
			id: row.id,
			household_id: row.household_id,
			tmdb_id: row.tmdb_id,
			media_type: row.media_type,
			watched_at: row.watched_at,
			enjoyed: row.enjoyed,
			title: content?.title ?? null,
			year: content?.year ?? null,
			poster_path: content?.poster_path ?? null,
		};
	});
};

export const setEnjoyed = async (
	watchedId: string,
	householdId: string,
	enjoyed: boolean
): Promise<WatchedTogether | null> => {
	const row = await WatchedTogether.findOne({
		where: { id: watchedId, household_id: householdId },
	});
	if (!row) {
		return null;
	}
	row.enjoyed = enjoyed;
	await row.save();
	return row;
};

export const getHouseholdMemberUserIds = async (
	householdId: string
): Promise<string[]> => {
	const members = await HouseholdMember.findAll({
		where: { household_id: householdId },
	});
	return members.map(m => m.user_id);
};
