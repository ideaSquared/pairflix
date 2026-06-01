import crypto from 'crypto';
import { Op } from 'sequelize';
import sequelize from '../db/connection';
import Household from '../models/Household';
import HouseholdInvite from '../models/HouseholdInvite';
import HouseholdMember from '../models/HouseholdMember';

const INVITE_TTL_DAYS = 7;

export interface HouseholdSummary {
	id: string;
	name: string | null;
	role: 'owner' | 'member';
	joined_at: Date;
	member_count: number;
}

export async function listForUser(userId: string): Promise<HouseholdSummary[]> {
	const memberships = await HouseholdMember.findAll({
		where: { user_id: userId },
		order: [['joined_at', 'DESC']],
	});
	if (memberships.length === 0) return [];

	const householdIds = memberships.map(m => m.household_id);
	const households = await Household.findAll({
		where: { id: householdIds },
	});
	const householdById = new Map(households.map(h => [h.id, h]));

	const counts = (await HouseholdMember.findAll({
		attributes: [
			'household_id',
			[sequelize.fn('COUNT', sequelize.col('user_id')), 'count'],
		],
		where: { household_id: householdIds },
		group: ['household_id'],
		raw: true,
	})) as unknown as { household_id: string; count: string }[];
	const countByHousehold = new Map(
		counts.map(c => [c.household_id, parseInt(c.count, 10)])
	);

	return memberships.flatMap(m => {
		const h = householdById.get(m.household_id);
		if (!h) return [];
		return [
			{
				id: h.id,
				name: h.name,
				role: m.role,
				joined_at: m.joined_at,
				member_count: countByHousehold.get(m.household_id) ?? 1,
			},
		];
	});
}

export async function createForOwner(
	ownerUserId: string,
	name: string | null
): Promise<HouseholdSummary> {
	return sequelize.transaction(async transaction => {
		const household = await Household.create(
			{ name: name ?? null },
			{ transaction }
		);
		await HouseholdMember.create(
			{
				household_id: household.id,
				user_id: ownerUserId,
				role: 'owner',
				joined_at: new Date(),
			},
			{ transaction }
		);
		return {
			id: household.id,
			name: household.name,
			role: 'owner',
			joined_at: new Date(),
			member_count: 1,
		};
	});
}

export interface InviteSummary {
	id: string;
	token: string;
	invited_email: string | null;
	expires_at: Date;
	accepted_at: Date | null;
}

export async function createInvite(
	householdId: string,
	invitedBy: string,
	invitedEmail: string | null
): Promise<InviteSummary> {
	const token = crypto.randomBytes(24).toString('base64url');
	const expires_at = new Date(Date.now() + INVITE_TTL_DAYS * 86400 * 1000);
	const invite = await HouseholdInvite.create({
		household_id: householdId,
		token,
		invited_email: invitedEmail,
		invited_by: invitedBy,
		expires_at,
	});
	return {
		id: invite.id,
		token: invite.token,
		invited_email: invite.invited_email,
		expires_at: invite.expires_at,
		accepted_at: invite.accepted_at,
	};
}

export interface AcceptResult {
	household_id: string;
}

export async function acceptInvite(
	token: string,
	userId: string
): Promise<AcceptResult> {
	return sequelize.transaction(async transaction => {
		const invite = await HouseholdInvite.findOne({
			where: {
				token,
				accepted_at: null,
				expires_at: { [Op.gt]: new Date() },
			},
			transaction,
		});
		if (!invite) {
			const err = new Error('invite_invalid_or_expired');
			err.name = 'InviteInvalid';
			throw err;
		}

		const existing = await HouseholdMember.findOne({
			where: { household_id: invite.household_id, user_id: userId },
			transaction,
		});
		if (!existing) {
			await HouseholdMember.create(
				{
					household_id: invite.household_id,
					user_id: userId,
					role: 'member',
					joined_at: new Date(),
				},
				{ transaction }
			);
		}

		invite.accepted_at = new Date();
		invite.accepted_by = userId;
		await invite.save({ transaction });

		return { household_id: invite.household_id };
	});
}

export async function isOwner(
	householdId: string,
	userId: string
): Promise<boolean> {
	const m = await HouseholdMember.findOne({
		where: { household_id: householdId, user_id: userId, role: 'owner' },
	});
	return m !== null;
}
