import {
	users,
	households,
	subscriptions,
	auditLogs,
	type Database,
} from '@pairflix/db';
import { and, count, eq, gte } from 'drizzle-orm';

export type DashboardStats = {
	totalUsers: number;
	activeUsers: number;
	totalHouseholds: number;
	premiumHouseholds: number;
	recentErrorCount: number;
};

export const getDashboardStats = async (
	db: Database
): Promise<DashboardStats> => {
	const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

	const [usersRow, activeRow, householdsRow, premiumRow, errorsRow] =
		await Promise.all([
			db.select({ total: count() }).from(users).get(),
			db
				.select({ total: count() })
				.from(users)
				.where(gte(users.lastLogin, since))
				.get(),
			db.select({ total: count() }).from(households).get(),
			db
				.select({ total: count() })
				.from(subscriptions)
				.where(
					and(
						eq(subscriptions.tier, 'premium'),
						eq(subscriptions.status, 'active')
					)
				)
				.get(),
			db
				.select({ total: count() })
				.from(auditLogs)
				.where(
					and(eq(auditLogs.level, 'error'), gte(auditLogs.createdAt, since))
				)
				.get(),
		]);

	return {
		totalUsers: usersRow?.total ?? 0,
		activeUsers: activeRow?.total ?? 0,
		totalHouseholds: householdsRow?.total ?? 0,
		premiumHouseholds: premiumRow?.total ?? 0,
		recentErrorCount: errorsRow?.total ?? 0,
	};
};
