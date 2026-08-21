import {
	createDb,
	householdInvites,
	householdMembers,
	users,
} from '@pairflix/db';
import { env } from 'cloudflare:workers';
import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';
import {
	acceptInvite,
	createForOwner,
	createInvite,
	InviteInvalidError,
	isMember,
	isOwner,
	listForUser,
} from './household';
import { newId, randomToken } from './id';

const db = createDb(env.DB);

let seq = 0;
const makeUser = async (): Promise<string> => {
	seq += 1;
	const id = `user_hh_${seq}`;
	const now = new Date();
	await db.insert(users).values({
		id,
		username: `hhuser_${seq}`,
		email: `hh_${seq}@example.com`,
		passwordHash: 'x',
		createdAt: now,
		updatedAt: now,
	});
	return id;
};

describe('isMember / isOwner', () => {
	it('distinguishes owners, plain members, and outsiders', async () => {
		const owner = await makeUser();
		const member = await makeUser();
		const outsider = await makeUser();
		const { id: householdId } = await createForOwner(db, owner, 'Home');
		const invite = await createInvite(db, householdId, owner, null);
		await acceptInvite(db, invite.token, member);

		expect(await isMember(db, householdId, owner)).toBe(true);
		expect(await isOwner(db, householdId, owner)).toBe(true);
		expect(await isMember(db, householdId, member)).toBe(true);
		expect(await isOwner(db, householdId, member)).toBe(false);
		expect(await isMember(db, householdId, outsider)).toBe(false);
		expect(await isOwner(db, householdId, outsider)).toBe(false);
	});
});

describe('createForOwner', () => {
	it('creates the household with the caller as its sole owner', async () => {
		const owner = await makeUser();
		const summary = await createForOwner(db, owner, 'Movie Night');
		expect(summary).toMatchObject({
			name: 'Movie Night',
			role: 'owner',
			memberCount: 1,
		});
		expect(await isOwner(db, summary.id, owner)).toBe(true);
	});
});

describe('listForUser', () => {
	it('reflects each membership role and the household member count', async () => {
		const owner = await makeUser();
		const member = await makeUser();
		const loner = await makeUser();
		const { id: householdId } = await createForOwner(db, owner, 'Home');
		const invite = await createInvite(db, householdId, owner, null);
		await acceptInvite(db, invite.token, member);

		const ownerView = await listForUser(db, owner);
		expect(ownerView).toHaveLength(1);
		expect(ownerView[0]).toMatchObject({
			id: householdId,
			role: 'owner',
			memberCount: 2,
		});

		const memberView = await listForUser(db, member);
		expect(memberView[0]).toMatchObject({
			id: householdId,
			role: 'member',
			memberCount: 2,
		});

		expect(await listForUser(db, loner)).toEqual([]);
	});
});

describe('acceptInvite', () => {
	it('adds the user as a member and marks the invite consumed', async () => {
		const owner = await makeUser();
		const joiner = await makeUser();
		const { id: householdId } = await createForOwner(db, owner, null);
		const invite = await createInvite(db, householdId, owner, null);

		const result = await acceptInvite(db, invite.token, joiner);
		expect(result.householdId).toBe(householdId);
		expect(await isMember(db, householdId, joiner)).toBe(true);

		const row = await db
			.select()
			.from(householdInvites)
			.where(eq(householdInvites.id, invite.id))
			.get();
		expect(row?.acceptedAt).not.toBeNull();
		expect(row?.acceptedBy).toBe(joiner);
	});

	it('is idempotent for a user who already belongs to the household', async () => {
		const owner = await makeUser();
		const { id: householdId } = await createForOwner(db, owner, null);
		const invite = await createInvite(db, householdId, owner, null);

		await acceptInvite(db, invite.token, owner);

		const memberships = await db
			.select()
			.from(householdMembers)
			.where(
				and(
					eq(householdMembers.householdId, householdId),
					eq(householdMembers.userId, owner)
				)
			);
		expect(memberships).toHaveLength(1);
		// onConflictDoNothing must not downgrade the existing owner row to a plain member.
		expect(await isOwner(db, householdId, owner)).toBe(true);
	});

	it('throws InviteInvalidError for unknown and expired tokens', async () => {
		const owner = await makeUser();
		const joiner = await makeUser();
		const { id: householdId } = await createForOwner(db, owner, null);

		await expect(
			acceptInvite(db, 'nonexistent-token', joiner)
		).rejects.toBeInstanceOf(InviteInvalidError);

		const token = randomToken();
		const now = new Date();
		await db.insert(householdInvites).values({
			id: newId('invite'),
			householdId,
			token,
			invitedEmail: null,
			invitedBy: owner,
			expiresAt: new Date(now.getTime() - 60_000),
			createdAt: now,
		});
		await expect(acceptInvite(db, token, joiner)).rejects.toBeInstanceOf(
			InviteInvalidError
		);
	});
});
