import { createDb, households, householdInvites, users } from '@pairflix/db';
import { env } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import { newId, randomToken } from './id';
import { deleteUser } from './adminUsers';

const db = createDb(env.DB);

let seq = 0;

const makeUser = async (): Promise<string> => {
	seq += 1;
	const id = `user_admin_${seq}`;
	const now = new Date();
	await db.insert(users).values({
		id,
		username: `adminuser_${seq}`,
		email: `admin_${seq}@example.com`,
		passwordHash: 'x',
		createdAt: now,
		updatedAt: now,
	});
	return id;
};

const makeHousehold = async (): Promise<string> => {
	seq += 1;
	const id = `hh_admin_${seq}`;
	const now = new Date();
	await db
		.insert(households)
		.values({ id, name: id, createdAt: now, updatedAt: now });
	return id;
};

describe('deleteUser', () => {
	it('deletes a user who sent a household invite, cascading the invite', async () => {
		const inviter = await makeUser();
		const householdId = await makeHousehold();
		const inviteId = newId('invite');
		const now = new Date();
		await db.insert(householdInvites).values({
			id: inviteId,
			householdId,
			token: randomToken(),
			invitedBy: inviter,
			expiresAt: new Date(now.getTime() + 60_000),
			createdAt: now,
		});

		const deleted = await deleteUser(db, inviter);

		expect(deleted).toBe(true);
		const remainingInvites = await db
			.select({ id: householdInvites.id })
			.from(householdInvites)
			.where(eq(householdInvites.id, inviteId));
		expect(remainingInvites).toHaveLength(0);
	});
});
