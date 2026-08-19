import {
	watchedTogether,
	content,
	type ContentProviders,
	type Database,
	type ProviderRegion,
} from '@pairflix/db';
import { and, count, desc, eq } from 'drizzle-orm';

/**
 * Ported from the current Express `history.service.ts`/`history.controller.ts`, with two
 * deliberate departures:
 *
 * - The `content` join matches on both `tmdbId` and `mediaType`, not `tmdbId` alone -- a movie and
 *   a TV show can share the same numeric TMDb id, so a single-column join risks attaching the
 *   wrong title/poster to a watched-together row.
 * - `setEnjoyed` does not port the Express controller's fire-and-forget taste-profile recompute:
 *   that recompute is built entirely on the `WatchlistEntry` table, which has no D1 equivalent and
 *   is being deleted, not preserved, per the product pivot. Reintroducing it in any form here is an
 *   out-of-scope, already-tracked decision for a later pass.
 */

export type HistoryEntry = {
	id: string;
	tmdbId: number;
	mediaType: 'movie' | 'tv';
	watchedAt: Date;
	enjoyed: boolean | null;
	moodAtPick: string | null;
	minutesBudgetAtPick: number | null;
	title: string | null;
	year: number | null;
	runtime: number | null;
	posterPath: string | null;
	providers: ProviderRegion;
};

export type PaginatedHistory = {
	data: HistoryEntry[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
};

type JoinedHistoryRow = {
	id: string;
	tmdbId: number;
	mediaType: 'movie' | 'tv';
	watchedAt: Date;
	enjoyed: boolean | null;
	moodAtPick: string | null;
	minutesBudgetAtPick: number | null;
	title: string | null;
	year: number | null;
	runtime: number | null;
	posterPath: string | null;
	providers: ContentProviders | null;
};

const historyColumns = {
	id: watchedTogether.id,
	tmdbId: watchedTogether.tmdbId,
	mediaType: watchedTogether.mediaType,
	watchedAt: watchedTogether.watchedAt,
	enjoyed: watchedTogether.enjoyed,
	moodAtPick: watchedTogether.moodAtPick,
	minutesBudgetAtPick: watchedTogether.minutesBudgetAtPick,
	title: content.title,
	year: content.year,
	runtime: content.runtime,
	posterPath: content.posterPath,
	providers: content.providers,
};

const historyContentJoin = and(
	eq(content.tmdbId, watchedTogether.tmdbId),
	eq(content.mediaType, watchedTogether.mediaType)
);

const readRegion = (
	providers: ContentProviders | null,
	region: string
): ProviderRegion => {
	const value = providers?.[region];
	return value && typeof value === 'object' ? value : {};
};

const toHistoryEntry = (
	row: JoinedHistoryRow,
	region: string
): HistoryEntry => ({
	id: row.id,
	tmdbId: row.tmdbId,
	mediaType: row.mediaType,
	watchedAt: row.watchedAt,
	enjoyed: row.enjoyed,
	moodAtPick: row.moodAtPick,
	minutesBudgetAtPick: row.minutesBudgetAtPick,
	title: row.title,
	year: row.year,
	runtime: row.runtime,
	posterPath: row.posterPath,
	providers: readRegion(row.providers, region),
});

export const listHistory = async (
	db: Database,
	householdId: string,
	page: number,
	limit: number,
	region: string = 'GB'
): Promise<PaginatedHistory> => {
	const where = eq(watchedTogether.householdId, householdId);

	const [rows, totalRow] = await Promise.all([
		db
			.select(historyColumns)
			.from(watchedTogether)
			.leftJoin(content, historyContentJoin)
			.where(where)
			.orderBy(desc(watchedTogether.watchedAt))
			.limit(limit)
			.offset((page - 1) * limit),
		db.select({ total: count() }).from(watchedTogether).where(where).get(),
	]);

	const total = totalRow?.total ?? 0;
	return {
		data: rows.map(row => toHistoryEntry(row, region)),
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
};

export const setEnjoyed = async (
	db: Database,
	householdId: string,
	watchedId: string,
	enjoyed: boolean | null,
	region: string = 'GB'
): Promise<HistoryEntry | null> => {
	const scope = and(
		eq(watchedTogether.id, watchedId),
		eq(watchedTogether.householdId, householdId)
	);

	const updated = await db
		.update(watchedTogether)
		.set({ enjoyed })
		.where(scope)
		.returning({ id: watchedTogether.id })
		.get();
	if (!updated) return null;

	const row = await db
		.select(historyColumns)
		.from(watchedTogether)
		.leftJoin(content, historyContentJoin)
		.where(scope)
		.get();

	return row ? toHistoryEntry(row, region) : null;
};
