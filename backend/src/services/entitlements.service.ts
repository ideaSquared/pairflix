import { Op } from 'sequelize';
import PickUsage from '../models/PickUsage';
import Subscription, {
	type SubscriptionStatus,
	type SubscriptionTier,
} from '../models/Subscription';

export interface Entitlements {
	tier: SubscriptionTier;
	daily_pick_limit: number;
	picks_used_today: number;
	picks_remaining: number;
	can_use_llm_rerank: boolean;
	can_use_multi_region: boolean;
	region_lock: string | null;
}

interface TierFlagsCacheEntry {
	tier: SubscriptionTier;
	status: SubscriptionStatus;
	current_period_end: Date | null;
	expires_at: number;
}

const TIER_CACHE_TTL_MS = 30 * 1000;
const tierCache = new Map<string, TierFlagsCacheEntry>();

const FREE_DAILY_PICK_LIMIT = 3;
const FREE_REGION_LOCK = 'GB';

function startOfTodayUtc(): Date {
	const now = new Date();
	return new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
	);
}

async function loadTierFlags(householdId: string): Promise<{
	tier: SubscriptionTier;
	status: SubscriptionStatus;
	current_period_end: Date | null;
}> {
	const cached = tierCache.get(householdId);
	const now = Date.now();
	if (cached && cached.expires_at > now) {
		return {
			tier: cached.tier,
			status: cached.status,
			current_period_end: cached.current_period_end,
		};
	}

	const sub = await Subscription.findOne({
		where: { household_id: householdId },
	});

	const tier: SubscriptionTier = sub?.tier ?? 'free';
	const status: SubscriptionStatus = sub?.status ?? 'active';
	const current_period_end = sub?.current_period_end ?? null;

	tierCache.set(householdId, {
		tier,
		status,
		current_period_end,
		expires_at: now + TIER_CACHE_TTL_MS,
	});

	return { tier, status, current_period_end };
}

export function invalidateEntitlementsCache(householdId?: string): void {
	if (householdId) {
		tierCache.delete(householdId);
	} else {
		tierCache.clear();
	}
}

function isEffectivelyPremium(
	tier: SubscriptionTier,
	status: SubscriptionStatus,
	periodEnd: Date | null
): boolean {
	return (
		tier === 'premium' &&
		status === 'active' &&
		periodEnd !== null &&
		periodEnd.getTime() > Date.now()
	);
}

export async function getEntitlements(
	householdId: string
): Promise<Entitlements> {
	const { tier, status, current_period_end } = await loadTierFlags(householdId);
	const premium = isEffectivelyPremium(tier, status, current_period_end);

	const picksUsedToday = await PickUsage.count({
		where: {
			household_id: householdId,
			picked_at: { [Op.gte]: startOfTodayUtc() },
		},
	});

	const dailyLimit = premium ? Number.MAX_SAFE_INTEGER : FREE_DAILY_PICK_LIMIT;

	const remaining = Math.max(0, dailyLimit - picksUsedToday);

	return {
		tier: premium ? 'premium' : 'free',
		daily_pick_limit: dailyLimit,
		picks_used_today: picksUsedToday,
		picks_remaining: remaining,
		can_use_llm_rerank: premium,
		can_use_multi_region: premium,
		region_lock: premium ? null : FREE_REGION_LOCK,
	};
}

export async function recordPick(householdId: string): Promise<void> {
	await PickUsage.create({ household_id: householdId });
}
