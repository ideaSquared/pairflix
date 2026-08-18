import { auditLogs, type Database } from '@pairflix/db';
import { and, asc, count, desc, eq, lt, max, min } from 'drizzle-orm';

export type AuditLogEntry = {
	id: string;
	level: 'info' | 'warn' | 'error' | 'debug';
	message: string;
	context: Record<string, unknown> | null;
	source: string;
	createdAt: Date;
};

export const listAuditLogs = async (
	db: Database,
	opts: { level?: AuditLogEntry['level']; page?: number; limit?: number }
): Promise<{
	data: AuditLogEntry[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}> => {
	const page = opts.page ?? 1;
	const limit = opts.limit ?? 100;
	const where = opts.level ? eq(auditLogs.level, opts.level) : undefined;

	const [data, totalRow] = await Promise.all([
		db
			.select()
			.from(auditLogs)
			.where(where)
			.orderBy(desc(auditLogs.createdAt))
			.limit(limit)
			.offset((page - 1) * limit),
		db.select({ total: count() }).from(auditLogs).where(where).get(),
	]);

	const total = totalRow?.total ?? 0;
	return {
		data,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
};

export const getLogSources = async (db: Database): Promise<string[]> => {
	const rows = await db
		.selectDistinct({ source: auditLogs.source })
		.from(auditLogs)
		.orderBy(asc(auditLogs.source));
	return rows.map(row => row.source);
};

export type AuditLogStats = {
	total: number;
	byLevel: Record<'info' | 'warn' | 'error' | 'debug', number>;
	oldestAt: Date | null;
	newestAt: Date | null;
};

export const getAuditLogStats = async (
	db: Database
): Promise<AuditLogStats> => {
	const [totalRow, levelRows, rangeRow] = await Promise.all([
		db.select({ total: count() }).from(auditLogs).get(),
		db
			.select({ level: auditLogs.level, total: count() })
			.from(auditLogs)
			.groupBy(auditLogs.level),
		db
			.select({
				oldest: min(auditLogs.createdAt),
				newest: max(auditLogs.createdAt),
			})
			.from(auditLogs)
			.get(),
	]);

	const byLevel: AuditLogStats['byLevel'] = {
		info: 0,
		warn: 0,
		error: 0,
		debug: 0,
	};
	for (const row of levelRows) {
		byLevel[row.level] = row.total;
	}

	return {
		total: totalRow?.total ?? 0,
		byLevel,
		oldestAt: rangeRow?.oldest ?? null,
		newestAt: rangeRow?.newest ?? null,
	};
};

const DEFAULT_RETENTION_DAYS: Record<AuditLogEntry['level'], number> = {
	info: 30,
	debug: 7,
	warn: 90,
	error: 365,
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const LEVELS: AuditLogEntry['level'][] = ['info', 'warn', 'error', 'debug'];

export const cleanupOldLogs = async (
	db: Database,
	retentionDaysOverride?: Partial<Record<AuditLogEntry['level'], number>>
): Promise<Record<AuditLogEntry['level'], number>> => {
	const deleted: Record<AuditLogEntry['level'], number> = {
		info: 0,
		warn: 0,
		error: 0,
		debug: 0,
	};

	for (const level of LEVELS) {
		const retentionDays =
			retentionDaysOverride?.[level] ?? DEFAULT_RETENTION_DAYS[level];
		const cutoff = new Date(Date.now() - retentionDays * MS_PER_DAY);
		const rows = await db
			.delete(auditLogs)
			.where(and(eq(auditLogs.level, level), lt(auditLogs.createdAt, cutoff)))
			.returning({ id: auditLogs.id });
		deleted[level] = rows.length;
	}

	return deleted;
};
