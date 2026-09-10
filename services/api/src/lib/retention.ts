import {
	authTokens,
	pickUsage,
	rateLimitHits,
	sessions,
	type Database,
} from '@pairflix/db';
import { isNotNull, lt, or } from 'drizzle-orm';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// rate_limit_hits is only ever read within its (short, per-route) rate-limit window -- a day of
// slack is generous.
const RATE_LIMIT_HITS_RETENTION_MS = 1 * MS_PER_DAY;
// pick_usage is only ever read for "today" (lib/entitlements.ts's startOfTodayUtc) -- two days
// covers that plus a full buffer past the UTC day boundary.
const PICK_USAGE_RETENTION_MS = 2 * MS_PER_DAY;

export type RetentionSweepResult = {
	rateLimitHits: number;
	sessions: number;
	authTokens: number;
	pickUsage: number;
};

/** Runs `sweep`, logging and reporting zero deletions on failure instead of throwing -- one bad
 * delete must not skip the others in the same cron run. */
const sweep = async (
	label: string,
	run: () => Promise<number>
): Promise<number> => {
	try {
		return await run();
	} catch (error) {
		console.error(`[cron] failed to prune ${label}`, error);
		return 0;
	}
};

/** Prunes the tables that grow without bound and are never read once past their retention
 * window: expired rate-limit hits, expired sessions, consumed/expired auth tokens, and stale
 * pick-usage rows. Each table's sweep is independently failure-isolated. */
export const pruneExpiredData = async (
	db: Database
): Promise<RetentionSweepResult> => {
	const now = new Date();

	const [
		rateLimitHitsDeleted,
		sessionsDeleted,
		authTokensDeleted,
		pickUsageDeleted,
	] = await Promise.all([
		sweep('rate_limit_hits', async () => {
			const result = await db
				.delete(rateLimitHits)
				.where(
					lt(
						rateLimitHits.createdAt,
						new Date(now.getTime() - RATE_LIMIT_HITS_RETENTION_MS)
					)
				);
			return result.meta.changes;
		}),
		sweep('sessions', async () => {
			const result = await db
				.delete(sessions)
				.where(lt(sessions.expiresAt, now));
			return result.meta.changes;
		}),
		sweep('auth_tokens', async () => {
			const result = await db
				.delete(authTokens)
				.where(
					or(isNotNull(authTokens.consumedAt), lt(authTokens.expiresAt, now))
				);
			return result.meta.changes;
		}),
		sweep('pick_usage', async () => {
			const result = await db
				.delete(pickUsage)
				.where(
					lt(
						pickUsage.pickedAt,
						new Date(now.getTime() - PICK_USAGE_RETENTION_MS)
					)
				);
			return result.meta.changes;
		}),
	]);

	return {
		rateLimitHits: rateLimitHitsDeleted,
		sessions: sessionsDeleted,
		authTokens: authTokensDeleted,
		pickUsage: pickUsageDeleted,
	};
};
