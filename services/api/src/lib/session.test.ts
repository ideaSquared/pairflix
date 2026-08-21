import { createDb, sessions, users } from '@pairflix/db';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { randomToken } from './id';
import {
	FAILED_ATTEMPT_LIMIT,
	LOCKOUT_MS,
	revokeAllSessions,
	revokeOtherSessions,
} from './session';

const db = createDb(env.DB);

let seq = 0;
const makeUser = async (): Promise<string> => {
	seq += 1;
	const id = `user_sess_${seq}`;
	const now = new Date();
	await db.insert(users).values({
		id,
		username: `sessuser_${seq}`,
		email: `sess_${seq}@example.com`,
		passwordHash: 'x',
		createdAt: now,
		updatedAt: now,
	});
	return id;
};

const addSession = async (userId: string): Promise<string> => {
	const id = randomToken();
	const now = Date.now();
	await db.insert(sessions).values({
		id,
		userId,
		expiresAt: new Date(now + 60_000),
		createdAt: new Date(now),
	});
	return id;
};

describe('lockout constants', () => {
	it('exposes the shared lockout threshold and duration', () => {
		expect(FAILED_ATTEMPT_LIMIT).toBe(5);
		expect(LOCKOUT_MS).toBe(15 * 60 * 1000);
	});
});

describe('revokeOtherSessions', () => {
	it('deletes every session except the kept one and returns the count removed', async () => {
		const user = await makeUser();
		const keep = await addSession(user);
		await addSession(user);
		await addSession(user);
		const otherUser = await makeUser();
		const otherSession = await addSession(otherUser);

		const removed = await revokeOtherSessions(db, user, keep);
		expect(removed).toBe(2);

		const remaining = await db
			.select({ id: sessions.id })
			.from(sessions)
			.where(eq(sessions.userId, user));
		expect(remaining.map(r => r.id)).toEqual([keep]);

		const untouched = await db
			.select({ id: sessions.id })
			.from(sessions)
			.where(eq(sessions.id, otherSession))
			.get();
		expect(untouched?.id).toBe(otherSession);
	});
});

describe('revokeAllSessions', () => {
	it('deletes all sessions for the user and leaves other users untouched', async () => {
		const user = await makeUser();
		await addSession(user);
		await addSession(user);
		const otherUser = await makeUser();
		const otherSession = await addSession(otherUser);

		const removed = await revokeAllSessions(db, user);
		expect(removed).toBe(2);

		const remaining = await db
			.select({ id: sessions.id })
			.from(sessions)
			.where(eq(sessions.userId, user));
		expect(remaining).toHaveLength(0);

		const untouched = await db
			.select({ id: sessions.id })
			.from(sessions)
			.where(eq(sessions.id, otherSession))
			.get();
		expect(untouched?.id).toBe(otherSession);
	});
});
