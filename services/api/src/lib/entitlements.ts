import { pickUsage, subscriptions, type Database } from '@pairflix/db';
import { and, count, eq, gte } from 'drizzle-orm';
import { newId } from './id';

const FREE_DAILY_PICK_LIMIT = 3;
const FREE_REGION_LOCK = 'GB';

export type Entitlements = {
	tier: 'free' | 'premium';
	dailyPickLimit: number;
	picksUsedToday: number;
	picksRemaining: number;
	canUseLlmRerank: boolean;
	canUseMultiRegion: boolean;
	regionLock: string | null;
};

const startOfTodayUtc = (): Date => {
	const now = new Date();
	return new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
	);
};

const isEffectivelyPremium = (
	tier: 'free' | 'premium',
	status: 'active' | 'past_due' | 'canceled',
	periodEnd: Date | null
): boolean =>
	tier === 'premium' &&
	status === 'active' &&
	periodEnd !== null &&
	periodEnd.getTime() > Date.now();

export const getEntitlements = async (
	db: Database,
	householdId: string
): Promise<Entitlements> => {
	const sub = await db
		.select()
		.from(subscriptions)
		.where(eq(subscriptions.householdId, householdId))
		.get();
	const premium = isEffectivelyPremium(
		sub?.tier ?? 'free',
		sub?.status ?? 'active',
		sub?.currentPeriodEnd ?? null
	);

	const picksToday = await db
		.select({ total: count() })
		.from(pickUsage)
		.where(
			and(
				eq(pickUsage.householdId, householdId),
				gte(pickUsage.pickedAt, startOfTodayUtc())
			)
		)
		.get();
	const picksUsedToday = picksToday?.total ?? 0;

	const dailyPickLimit = premium
		? Number.MAX_SAFE_INTEGER
		: FREE_DAILY_PICK_LIMIT;

	return {
		tier: premium ? 'premium' : 'free',
		dailyPickLimit,
		picksUsedToday,
		picksRemaining: Math.max(0, dailyPickLimit - picksUsedToday),
		canUseLlmRerank: premium,
		canUseMultiRegion: premium,
		regionLock: premium ? null : FREE_REGION_LOCK,
	};
};

export const recordPick = async (
	db: Database,
	householdId: string
): Promise<void> => {
	await db
		.insert(pickUsage)
		.values({ id: newId('pickusage'), householdId, pickedAt: new Date() });
};
