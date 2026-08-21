import { createDb, households, subscriptions } from '@pairflix/db';
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { getEntitlements, recordPick } from './entitlements';

const db = createDb(env.DB);

let seq = 0;
/** A fresh household row -- entitlements read/insert against real foreign keys. */
const makeHousehold = async (): Promise<string> => {
	seq += 1;
	const id = `hh_ent_${seq}`;
	const now = new Date();
	await db
		.insert(households)
		.values({ id, name: id, createdAt: now, updatedAt: now });
	return id;
};

const givePremium = async (
	householdId: string,
	status: 'active' | 'past_due' | 'canceled',
	periodEnd: Date | null
): Promise<void> => {
	const now = new Date();
	await db.insert(subscriptions).values({
		id: `sub_${householdId}`,
		householdId,
		tier: 'premium',
		status,
		currentPeriodEnd: periodEnd,
		createdAt: now,
		updatedAt: now,
	});
};

describe('getEntitlements', () => {
	it('defaults an unknown household to the free tier with a GB region lock', async () => {
		const id = await makeHousehold();
		const ent = await getEntitlements(db, id);
		expect(ent).toMatchObject({
			tier: 'free',
			dailyPickLimit: 3,
			picksUsedToday: 0,
			picksRemaining: 3,
			canUseLlmRerank: false,
			canUseMultiRegion: false,
			regionLock: 'GB',
		});
	});

	it("counts today's picks and clamps remaining at zero", async () => {
		const id = await makeHousehold();
		await recordPick(db, id);
		await recordPick(db, id);
		await recordPick(db, id);
		await recordPick(db, id); // one over the free limit of 3
		const ent = await getEntitlements(db, id);
		expect(ent.picksUsedToday).toBe(4);
		expect(ent.picksRemaining).toBe(0);
	});

	it('unlocks premium for an active subscription within its period', async () => {
		const id = await makeHousehold();
		await givePremium(id, 'active', new Date(Date.now() + 60_000));
		const ent = await getEntitlements(db, id);
		expect(ent.tier).toBe('premium');
		expect(ent.canUseLlmRerank).toBe(true);
		expect(ent.canUseMultiRegion).toBe(true);
		expect(ent.regionLock).toBeNull();
		expect(ent.dailyPickLimit).toBeGreaterThan(1000);
	});

	it('treats an expired premium period as free', async () => {
		const id = await makeHousehold();
		await givePremium(id, 'active', new Date(Date.now() - 60_000));
		const ent = await getEntitlements(db, id);
		expect(ent.tier).toBe('free');
		expect(ent.regionLock).toBe('GB');
	});

	it('treats a canceled premium subscription as free', async () => {
		const id = await makeHousehold();
		await givePremium(id, 'canceled', new Date(Date.now() + 60_000));
		const ent = await getEntitlements(db, id);
		expect(ent.tier).toBe('free');
	});
});

describe('recordPick', () => {
	it("increments the household's pick count for today", async () => {
		const id = await makeHousehold();
		expect((await getEntitlements(db, id)).picksUsedToday).toBe(0);
		await recordPick(db, id);
		expect((await getEntitlements(db, id)).picksUsedToday).toBe(1);
	});
});
