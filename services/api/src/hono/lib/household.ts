import {
	households,
	householdInvites,
	householdMembers,
	type Database,
	type HouseholdInviteRow,
} from '@pairflix/db';
import { and, count, eq, gt, inArray, isNull } from 'drizzle-orm';
import { newId, randomToken } from './id';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const isMember = async (
	db: Database,
	householdId: string,
	userId: string
): Promise<boolean> => {
	const row = await db
		.select({ userId: householdMembers.userId })
		.from(householdMembers)
		.where(
			and(
				eq(householdMembers.householdId, householdId),
				eq(householdMembers.userId, userId)
			)
		)
		.get();
	return row !== undefined;
};

export const isOwner = async (
	db: Database,
	householdId: string,
	userId: string
): Promise<boolean> => {
	const row = await db
		.select({ userId: householdMembers.userId })
		.from(householdMembers)
		.where(
			and(
				eq(householdMembers.householdId, householdId),
				eq(householdMembers.userId, userId),
				eq(householdMembers.role, 'owner')
			)
		)
		.get();
	return row !== undefined;
};

export type HouseholdSummary = {
	id: string;
	name: string | null;
	role: 'owner' | 'member';
	joinedAt: Date;
	memberCount: number;
};

export const listForUser = async (
	db: Database,
	userId: string
): Promise<HouseholdSummary[]> => {
	const memberships = await db
		.select({
			householdId: householdMembers.householdId,
			role: householdMembers.role,
			joinedAt: householdMembers.joinedAt,
		})
		.from(householdMembers)
		.where(eq(householdMembers.userId, userId));
	if (memberships.length === 0) return [];

	const householdIds = memberships.map(m => m.householdId);
	const [rows, counts] = await Promise.all([
		db.select().from(households).where(inArray(households.id, householdIds)),
		db
			.select({ householdId: householdMembers.householdId, total: count() })
			.from(householdMembers)
			.where(inArray(householdMembers.householdId, householdIds))
			.groupBy(householdMembers.householdId),
	]);
	const householdById = new Map(rows.map(h => [h.id, h]));
	const countByHousehold = new Map(counts.map(c => [c.householdId, c.total]));

	return memberships.flatMap(m => {
		const household = householdById.get(m.householdId);
		if (!household) return [];
		return [
			{
				id: household.id,
				name: household.name,
				role: m.role,
				joinedAt: m.joinedAt,
				memberCount: countByHousehold.get(m.householdId) ?? 1,
			},
		];
	});
};

export const createForOwner = async (
	db: Database,
	ownerUserId: string,
	name: string | null
): Promise<HouseholdSummary> => {
	const householdId = newId('household');
	const now = new Date();
	await db.batch([
		db
			.insert(households)
			.values({ id: householdId, name, createdAt: now, updatedAt: now }),
		db.insert(householdMembers).values({
			householdId,
			userId: ownerUserId,
			role: 'owner',
			joinedAt: now,
		}),
	]);
	return {
		id: householdId,
		name,
		role: 'owner',
		joinedAt: now,
		memberCount: 1,
	};
};

export type InviteSummary = {
	id: string;
	token: string;
	invitedEmail: string | null;
	expiresAt: Date;
	acceptedAt: Date | null;
};

export const createInvite = async (
	db: Database,
	householdId: string,
	invitedBy: string,
	invitedEmail: string | null
): Promise<InviteSummary> => {
	const id = newId('invite');
	const token = randomToken();
	const now = new Date();
	const expiresAt = new Date(now.getTime() + INVITE_TTL_MS);
	await db.insert(householdInvites).values({
		id,
		householdId,
		token,
		invitedEmail,
		invitedBy,
		expiresAt,
		createdAt: now,
	});
	return { id, token, invitedEmail, expiresAt, acceptedAt: null };
};

export class InviteInvalidError extends Error {
	constructor() {
		super('invite_invalid_or_expired');
		this.name = 'InviteInvalidError';
	}
}

/** Idempotent -- accepting an invite for a household the user already belongs to just marks the
 * invite consumed without creating a duplicate membership. */
export const acceptInvite = async (
	db: Database,
	token: string,
	userId: string
): Promise<{ householdId: string }> => {
	const invite: HouseholdInviteRow | undefined = await db
		.select()
		.from(householdInvites)
		.where(
			and(
				eq(householdInvites.token, token),
				isNull(householdInvites.acceptedAt),
				gt(householdInvites.expiresAt, new Date())
			)
		)
		.get();
	if (!invite) throw new InviteInvalidError();

	if (!(await isMember(db, invite.householdId, userId))) {
		await db.insert(householdMembers).values({
			householdId: invite.householdId,
			userId,
			role: 'member',
			joinedAt: new Date(),
		});
	}

	await db
		.update(householdInvites)
		.set({ acceptedAt: new Date(), acceptedBy: userId })
		.where(eq(householdInvites.id, invite.id));

	return { householdId: invite.householdId };
};
