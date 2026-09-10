import {
	authTokens,
	createDb,
	households,
	pickUsage,
	rateLimitHits,
	sessions,
	users,
} from '@pairflix/db';
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { randomToken } from './id';
import { pruneExpiredData } from './retention';

const db = createDb(env.DB);

let seq = 0;

const makeUser = async (): Promise<string> => {
	seq += 1;
	const id = `user_ret_${seq}`;
	const now = new Date();
	await db.insert(users).values({
		id,
		username: `retuser_${seq}`,
		email: `ret_${seq}@example.com`,
		passwordHash: 'x',
		createdAt: now,
		updatedAt: now,
	});
	return id;
};

const makeHousehold = async (): Promise<string> => {
	seq += 1;
	const id = `hh_ret_${seq}`;
	const now = new Date();
	await db
		.insert(households)
		.values({ id, name: id, createdAt: now, updatedAt: now });
	return id;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

describe('pruneExpiredData', () => {
	it('deletes rate-limit hits past their retention window and keeps recent ones', async () => {
		const oldId = randomToken();
		const recentId = randomToken();
		await db.insert(rateLimitHits).values([
			{
				id: oldId,
				key: 'register:1.2.3.4',
				createdAt: new Date(Date.now() - 2 * MS_PER_DAY),
			},
			{
				id: recentId,
				key: 'register:1.2.3.4',
				createdAt: new Date(),
			},
		]);

		await pruneExpiredData(db);

		const remaining = await db.select().from(rateLimitHits);
		const remainingIds = remaining.map(row => row.id);
		expect(remainingIds).not.toContain(oldId);
		expect(remainingIds).toContain(recentId);
	});

	it('deletes expired sessions and keeps live ones', async () => {
		const userId = await makeUser();
		const expiredId = randomToken();
		const liveId = randomToken();
		await db.insert(sessions).values([
			{
				id: expiredId,
				userId,
				expiresAt: new Date(Date.now() - 60_000),
				createdAt: new Date(),
			},
			{
				id: liveId,
				userId,
				expiresAt: new Date(Date.now() + 60_000),
				createdAt: new Date(),
			},
		]);

		await pruneExpiredData(db);

		const remaining = await db.select().from(sessions);
		const remainingIds = remaining.map(row => row.id);
		expect(remainingIds).not.toContain(expiredId);
		expect(remainingIds).toContain(liveId);
	});

	it('deletes consumed and expired auth tokens, keeps unconsumed live ones', async () => {
		const userId = await makeUser();
		const consumedId = randomToken();
		const expiredId = randomToken();
		const liveId = randomToken();
		await db.insert(authTokens).values([
			{
				id: consumedId,
				userId,
				purpose: 'verify_email',
				expiresAt: new Date(Date.now() + 60_000),
				consumedAt: new Date(),
				createdAt: new Date(),
			},
			{
				id: expiredId,
				userId,
				purpose: 'verify_email',
				expiresAt: new Date(Date.now() - 60_000),
				createdAt: new Date(),
			},
			{
				id: liveId,
				userId,
				purpose: 'verify_email',
				expiresAt: new Date(Date.now() + 60_000),
				createdAt: new Date(),
			},
		]);

		await pruneExpiredData(db);

		const remaining = await db.select().from(authTokens);
		const remainingIds = remaining.map(row => row.id);
		expect(remainingIds).not.toContain(consumedId);
		expect(remainingIds).not.toContain(expiredId);
		expect(remainingIds).toContain(liveId);
	});

	it('deletes pick-usage rows past retention and keeps recent ones', async () => {
		const householdId = await makeHousehold();
		const oldId = `pu_ret_old_${seq}`;
		const recentId = `pu_ret_recent_${seq}`;
		await db.insert(pickUsage).values([
			{
				id: oldId,
				householdId,
				pickedAt: new Date(Date.now() - 3 * MS_PER_DAY),
			},
			{
				id: recentId,
				householdId,
				pickedAt: new Date(),
			},
		]);

		await pruneExpiredData(db);

		const remaining = await db.select().from(pickUsage);
		const remainingIds = remaining.map(row => row.id);
		expect(remainingIds).not.toContain(oldId);
		expect(remainingIds).toContain(recentId);
	});

	it('returns the count deleted per table', async () => {
		const userId = await makeUser();
		await db.insert(sessions).values({
			id: randomToken(),
			userId,
			expiresAt: new Date(Date.now() - 60_000),
			createdAt: new Date(),
		});

		const result = await pruneExpiredData(db);

		expect(result.sessions).toBeGreaterThanOrEqual(1);
	});
});
