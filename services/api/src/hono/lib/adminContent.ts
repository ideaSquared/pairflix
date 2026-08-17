import { content, contentReports, users, type Database } from '@pairflix/db';
import { and, asc, count, desc, eq, like, sql } from 'drizzle-orm';

/**
 * Admin content-moderation queries, ported from the current Express admin content controller.
 * `content` doubles as a TMDb provider-availability cache and this moderation registry (see
 * packages/db/src/schema.ts) -- every write here only ever touches the moderation columns
 * (title/type/status/reportedCount/removalReason), mirroring lib/providers.ts's own promise from
 * the other side never to touch these.
 *
 * Two deliberate departures from the Express version, both bug fixes:
 * - `listContent`'s `sortBy` is whitelisted against a fixed column lookup rather than spliced
 *   straight into `.orderBy()` -- the Express version passes the raw query-string value straight
 *   into the ORM's order clause with zero validation.
 * - `dismissReport` only decrements `content.reportedCount` when the report's status was still
 *   `pending` before the dismiss -- the Express version decrements unconditionally on every
 *   dismiss call, understating the count relative to actually-open reports on repeat calls.
 */

export type AdminContentSummary = {
	id: string;
	title: string;
	type: 'movie' | 'show' | 'episode';
	status: 'active' | 'pending' | 'flagged' | 'removed';
	reportedCount: number;
	removalReason: string | null;
	createdAt: Date;
	updatedAt: Date;
};

const contentSummaryColumns = {
	id: content.id,
	title: content.title,
	type: content.type,
	status: content.status,
	reportedCount: content.reportedCount,
	removalReason: content.removalReason,
	createdAt: content.createdAt,
	updatedAt: content.updatedAt,
};

const contentSortColumns = {
	reportedCount: content.reportedCount,
	createdAt: content.createdAt,
	title: content.title,
};

export const listContent = async (
	db: Database,
	opts: {
		page?: number;
		limit?: number;
		search?: string;
		type?: 'movie' | 'show' | 'episode';
		status?: AdminContentSummary['status'];
		sortBy?: 'reportedCount' | 'createdAt' | 'title';
		sortOrder?: 'asc' | 'desc';
	}
): Promise<{
	data: AdminContentSummary[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}> => {
	const page = opts.page ?? 1;
	const limit = opts.limit ?? 20;
	const sortColumn = contentSortColumns[opts.sortBy ?? 'reportedCount'];
	const orderFn = opts.sortOrder === 'asc' ? asc : desc;

	const where = and(
		opts.search ? like(content.title, `%${opts.search}%`) : undefined,
		opts.type ? eq(content.type, opts.type) : undefined,
		opts.status ? eq(content.status, opts.status) : undefined
	);

	const [rows, totalRow] = await Promise.all([
		db
			.select(contentSummaryColumns)
			.from(content)
			.where(where)
			.orderBy(orderFn(sortColumn))
			.limit(limit)
			.offset((page - 1) * limit),
		db.select({ total: count() }).from(content).where(where).get(),
	]);

	const total = totalRow?.total ?? 0;
	return {
		data: rows,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
};

export type ContentReportWithReporter = {
	id: string;
	reason: string;
	details: string | null;
	status: 'pending' | 'dismissed' | 'resolved';
	createdAt: Date;
	updatedAt: Date;
	reporterUsername: string;
};

export const getContentReports = async (
	db: Database,
	contentId: string
): Promise<ContentReportWithReporter[]> => {
	const rows = await db
		.select({
			id: contentReports.id,
			reason: contentReports.reason,
			details: contentReports.details,
			status: contentReports.status,
			createdAt: contentReports.createdAt,
			updatedAt: contentReports.updatedAt,
			reporterUsername: users.username,
		})
		.from(contentReports)
		.innerJoin(users, eq(contentReports.userId, users.id))
		.where(eq(contentReports.contentId, contentId))
		.orderBy(desc(contentReports.createdAt));
	return rows;
};

export const updateContent = async (
	db: Database,
	contentId: string,
	input: Partial<{ title: string; status: AdminContentSummary['status'] }>
): Promise<AdminContentSummary | null> => {
	const updated = await db
		.update(content)
		.set({ ...input, updatedAt: new Date() })
		.where(eq(content.id, contentId))
		.returning(contentSummaryColumns)
		.get();
	return updated ?? null;
};

export const flagContent = async (
	db: Database,
	contentId: string
): Promise<AdminContentSummary | null> => {
	const updated = await db
		.update(content)
		.set({ status: 'flagged', updatedAt: new Date() })
		.where(eq(content.id, contentId))
		.returning(contentSummaryColumns)
		.get();
	return updated ?? null;
};

export const approveContent = async (
	db: Database,
	contentId: string
): Promise<AdminContentSummary | null> => {
	const updated = await db
		.update(content)
		.set({ status: 'active', updatedAt: new Date() })
		.where(eq(content.id, contentId))
		.returning(contentSummaryColumns)
		.get();
	return updated ?? null;
};

export const removeContent = async (
	db: Database,
	contentId: string,
	reason?: string
): Promise<AdminContentSummary | null> => {
	const updated = await db
		.update(content)
		.set({
			status: 'removed',
			removalReason: reason ?? null,
			updatedAt: new Date(),
		})
		.where(eq(content.id, contentId))
		.returning(contentSummaryColumns)
		.get();
	return updated ?? null;
};

export const dismissReport = async (
	db: Database,
	reportId: string
): Promise<{ id: string; status: 'dismissed' } | null> => {
	const report = await db
		.select({
			contentId: contentReports.contentId,
			status: contentReports.status,
		})
		.from(contentReports)
		.where(eq(contentReports.id, reportId))
		.get();
	if (!report) return null;

	await db
		.update(contentReports)
		.set({ status: 'dismissed', updatedAt: new Date() })
		.where(eq(contentReports.id, reportId));

	if (report.status === 'pending') {
		await db
			.update(content)
			.set({ reportedCount: sql`max(${content.reportedCount} - 1, 0)` })
			.where(eq(content.id, report.contentId));
	}

	return { id: reportId, status: 'dismissed' };
};
