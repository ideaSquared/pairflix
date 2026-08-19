import { env } from 'cloudflare:workers';
import { auditLogs, createDb } from '@pairflix/db';
import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { newId } from './id';
import { rotateAuditLogsOnSchedule } from './adminAuditLogs';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const seedLog = async (
	level: 'info' | 'warn' | 'error' | 'debug',
	ageDays: number
): Promise<string> => {
	const db = createDb(env.DB);
	const id = newId('audit');
	await db.insert(auditLogs).values({
		id,
		level,
		message: 'test log',
		source: 'test',
		context: {},
		createdAt: new Date(Date.now() - ageDays * MS_PER_DAY),
	});
	return id;
};

describe('rotateAuditLogsOnSchedule', () => {
	it('deletes rows past the default retention window and leaves recent rows', async () => {
		const db = createDb(env.DB);
		const oldInfo = await seedLog('info', 40); // default: 30 days
		const recentInfo = await seedLog('info', 1);
		const oldWarn = await seedLog('warn', 100); // default: 90 days
		const recentWarn = await seedLog('warn', 1);

		await rotateAuditLogsOnSchedule(db);

		const remaining = await db
			.select({ id: auditLogs.id })
			.from(auditLogs)
			.where(eq(auditLogs.source, 'test'));
		const remainingIds = remaining.map(row => row.id);

		expect(remainingIds).not.toContain(oldInfo);
		expect(remainingIds).not.toContain(oldWarn);
		expect(remainingIds).toContain(recentInfo);
		expect(remainingIds).toContain(recentWarn);
	});

	it("records the run under the 'cron' source with the deleted counts", async () => {
		const db = createDb(env.DB);
		// Storage isn't reset between `it()` blocks in this file (see the first test, which also
		// triggers a rotation), so this test's own run isn't necessarily the only cron-sourced row
		// -- clear any that exist first, scoping the assertion below to this test's own call.
		await db.delete(auditLogs).where(eq(auditLogs.source, 'cron'));
		await seedLog('info', 40);

		await rotateAuditLogsOnSchedule(db);

		const cronLogs = await db
			.select()
			.from(auditLogs)
			.where(
				and(
					eq(auditLogs.source, 'cron'),
					eq(auditLogs.message, 'Cron ran audit log rotation')
				)
			);

		expect(cronLogs).toHaveLength(1);
		expect(cronLogs[0]?.context).toEqual({
			info: 1,
			warn: 0,
			error: 0,
			debug: 0,
		});
	});
});
