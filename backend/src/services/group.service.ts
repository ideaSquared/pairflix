import { Op } from 'sequelize';
import models from '../models';
import { ActivityType, activityService } from './activity.service';

const { Group, GroupMember, GroupWatchlist, User, WatchlistEntry } = models;

interface AuthenticatedUser {
	user_id: string;
	email: string;
	username: string;
	role?: string;
	status?: string;
	email_verified?: boolean;
	preferences?: Record<string, unknown>;
}

interface CreateGroupBody {
	name: string;
	description?: string;
	type: 'couple' | 'friends' | 'watch_party';
	max_members?: number;
	settings?: {
		isPublic?: boolean;
		requireApproval?: boolean;
		allowInvites?: boolean;
		scheduleSettings?: {
			recurringDay?: string;
			recurringTime?: string;
		};
	};
}

interface InviteToGroupBody {
	user_ids: string[];
	group_id: string;
}

interface CreateRelationshipBody {
	partner_email: string;
	group_name?: string;
	description?: string;
}

// Create a new group
export const createGroupService = async (
	user: AuthenticatedUser,
	body: CreateGroupBody
) => {
	const { name, description, type, max_members, settings } = body;

	// Create the group
	const group = await Group.create({
		name,
		description,
		type,
		created_by: user.user_id,
		max_members,
		settings: {
			isPublic: false,
			requireApproval: true,
			allowInvites: true,
			...settings,
		},
	});

	// Add creator as owner
	await GroupMember.create({
		group_id: group.group_id,
		user_id: user.user_id,
		role: 'owner',
		status: 'active',
	});

	// Log activity
	await activityService.logActivity(user.user_id, ActivityType.GROUP_CREATE, {
		group_id: group.group_id,
		group_name: group.name,
		group_type: group.type,
		timestamp: new Date(),
	});

	return group;
};

// Create a couple relationship (replaces match creation)
export const createRelationshipService = async (
	user: AuthenticatedUser,
	body: CreateRelationshipBody
) => {
	const { partner_email, group_name, description } = body;

	// Find the partner user
	const partner = await User.findOne({ where: { email: partner_email } });
	if (!partner) {
		throw new Error('User not found with that email');
	}

	// Check if users are trying to create relationship with themselves
	if (user.user_id === partner.user_id) {
		throw new Error('Cannot create relationship with yourself');
	}

	// Check if relationship already exists between these users
	const existingRelationship = await GroupMember.findOne({
		where: {
			user_id: user.user_id,
		},
		include: [
			{
				model: Group,
				as: 'group',
				where: { type: 'couple' },
				include: [
					{
						model: GroupMember,
						as: 'members',
						where: { user_id: partner.user_id, status: 'active' },
						required: true,
					},
				],
			},
		],
	});

	if (existingRelationship) {
		throw new Error('Relationship already exists with this user');
	}

	// Create couple group
	const defaultName = group_name || `${user.username} & ${partner.username}`;
	const group = await createGroupService(user, {
		name: defaultName,
		description,
		type: 'couple',
		max_members: 2,
		settings: {
			isPublic: false,
			requireApproval: false, // Couples don't need approval
			allowInvites: false, // Start closed, can be changed later
		},
	});

	// Invite the partner (they'll need to accept)
	await GroupMember.create({
		group_id: group.group_id,
		user_id: partner.user_id,
		role: 'member',
		status: 'pending',
		invited_by: user.user_id,
	});

	// Log activity
	await activityService.logActivity(user.user_id, ActivityType.GROUP_INVITE, {
		group_id: group.group_id,
		group_name: group.name,
		invited_user_id: partner.user_id,
		timestamp: new Date(),
	});

	return group;
};

// Get user's primary relationship (for frontend that supports one relationship)
export const getPrimaryRelationshipService = async (
	user: AuthenticatedUser
) => {
	const groupMembership = await GroupMember.findOne({
		where: {
			user_id: user.user_id,
			status: 'active',
		},
		include: [
			{
				model: Group,
				as: 'group',
				include: [
					{
						model: User,
						as: 'creator',
						attributes: ['user_id', 'username', 'email'],
					},
					{
						model: GroupMember,
						as: 'members',
						where: { status: 'active' },
						include: [
							{
								model: User,
								as: 'user',
								attributes: ['user_id', 'username', 'email'],
							},
						],
					},
				],
			},
		],
		order: [['created_at', 'ASC']], // Get the first/primary relationship
	});

	if (!groupMembership) {
		return null;
	}

	return {
		...groupMembership.group?.toJSON(),
		user_role: groupMembership.role,
		member_count: groupMembership.group?.members?.length || 0,
	};
};

// Get user's groups (for users who want multiple groups later)
export const getUserGroupsService = async (user: AuthenticatedUser) => {
	const groupMemberships = await GroupMember.findAll({
		where: {
			user_id: user.user_id,
			status: 'active',
		},
		include: [
			{
				model: Group,
				as: 'group',
				include: [
					{
						model: User,
						as: 'creator',
						attributes: ['user_id', 'username', 'email'],
					},
					{
						model: GroupMember,
						as: 'members',
						where: { status: 'active' },
						include: [
							{
								model: User,
								as: 'user',
								attributes: ['user_id', 'username', 'email'],
							},
						],
					},
				],
			},
		],
	});

	return groupMemberships.map(membership => ({
		...membership.group?.toJSON(),
		user_role: membership.role,
		member_count: membership.group?.members?.length || 0,
	}));
};

// Expand relationship (e.g., couple → friends group)
export const expandRelationshipService = async (
	user: AuthenticatedUser,
	group_id: string,
	new_type: 'friends' | 'watch_party',
	new_max_members?: number,
	new_name?: string
) => {
	// Check if user has permission to modify (must be owner or admin)
	const membership = await GroupMember.findOne({
		where: {
			group_id,
			user_id: user.user_id,
			status: 'active',
			role: ['owner', 'admin'],
		},
	});

	if (!membership) {
		throw new Error('You do not have permission to modify this group');
	}

	// Get the group
	const group = await Group.findByPk(group_id);
	if (!group) {
		throw new Error('Group not found');
	}

	// Update group settings for expansion
	group.type = new_type;
	group.max_members = new_max_members || (new_type === 'friends' ? 15 : 50);
	if (new_name) {
		group.name = new_name;
	}
	group.settings = {
		...group.settings,
		allowInvites: true, // Enable invites for expanded groups
		requireApproval: new_type === 'watch_party' ? false : true,
		isPublic: new_type === 'watch_party' ? true : false,
	};

	await group.save();

	// Log activity
	await activityService.logActivity(user.user_id, ActivityType.GROUP_UPDATE, {
		group_id,
		group_name: group.name,
		old_type: 'couple',
		new_type,
		timestamp: new Date(),
	});

	return group;
};

// Invite users to group
export const inviteToGroupService = async (
	user: AuthenticatedUser,
	body: InviteToGroupBody
) => {
	const { user_ids, group_id } = body;

	// Check if user has permission to invite (must be owner or admin)
	const membership = await GroupMember.findOne({
		where: {
			group_id,
			user_id: user.user_id,
			status: 'active',
			role: ['owner', 'admin'],
		},
	});

	if (!membership) {
		throw new Error('You do not have permission to invite users to this group');
	}

	// Get group details
	const group = await Group.findByPk(group_id);
	if (!group) {
		throw new Error('Group not found');
	}

	// Check if group allows invites
	if (!group.settings.allowInvites) {
		throw new Error('This group does not allow invitations');
	}

	// Check group member limit
	if (group.max_members) {
		const currentMemberCount = await GroupMember.count({
			where: { group_id, status: ['active', 'pending'] },
		});

		if (currentMemberCount + user_ids.length > group.max_members) {
			throw new Error('Adding these users would exceed the group member limit');
		}
	}

	// Create invitations
	const invitations = await Promise.all(
		user_ids.map(async user_id => {
			// Check if user is already a member
			const existingMembership = await GroupMember.findOne({
				where: { group_id, user_id },
			});

			if (existingMembership) {
				throw new Error(
					`User ${user_id} is already a member or has been invited`
				);
			}

			const invitation = await GroupMember.create({
				group_id,
				user_id,
				role: 'member',
				status: group.settings.requireApproval ? 'pending' : 'active',
				invited_by: user.user_id,
			});

			// Log activity
			await activityService.logActivity(
				user.user_id,
				ActivityType.GROUP_INVITE,
				{
					group_id,
					group_name: group.name,
					invited_user_id: user_id,
					timestamp: new Date(),
				}
			);

			return invitation;
		})
	);

	return invitations;
};

// Accept group invitation
export const acceptGroupInvitationService = async (
	user: AuthenticatedUser,
	group_id: string
) => {
	const membership = await GroupMember.findOne({
		where: {
			group_id,
			user_id: user.user_id,
			status: 'pending',
		},
	});

	if (!membership) {
		throw new Error('No pending invitation found for this group');
	}

	membership.status = 'active';
	membership.joined_at = new Date();
	await membership.save();

	// Log activity
	await activityService.logActivity(user.user_id, ActivityType.GROUP_JOIN, {
		group_id,
		timestamp: new Date(),
	});

	return membership;
};

// Get group content matches (works for any group size)
export const getGroupContentMatchesService = async (
	user: AuthenticatedUser,
	group_id: string
) => {
	// Verify user is a member of the group
	const membership = await GroupMember.findOne({
		where: {
			group_id,
			user_id: user.user_id,
			status: 'active',
		},
	});

	if (!membership) {
		throw new Error('You are not a member of this group');
	}

	// Get all active group members
	const groupMembers = await GroupMember.findAll({
		where: {
			group_id,
			status: 'active',
		},
	});

	const memberIds = groupMembers.map(member => member.user_id);

	// Get all watchlist entries from group members
	const memberWatchlistEntries = await WatchlistEntry.findAll({
		where: {
			user_id: { [Op.in]: memberIds },
		},
	});

	// Find content that appears in multiple members' watchlists
	const contentMap = new Map<
		number,
		{
			tmdb_id: number;
			media_type: string;
			users: { user_id: string; status: string; username?: string }[];
		}
	>();

	memberWatchlistEntries.forEach(entry => {
		if (!contentMap.has(entry.tmdb_id)) {
			contentMap.set(entry.tmdb_id, {
				tmdb_id: entry.tmdb_id,
				media_type: entry.media_type,
				users: [],
			});
		}
		contentMap.get(entry.tmdb_id)!.users.push({
			user_id: entry.user_id,
			status: entry.status,
		});
	});

	// Filter to only show content that 2+ members have
	const matches = Array.from(contentMap.values()).filter(
		content => content.users.length >= 2
	);

	return matches;
};

// Add content to group watchlist
export const addToGroupWatchlistService = async (
	user: AuthenticatedUser,
	group_id: string,
	tmdb_id: number,
	media_type: 'movie' | 'tv',
	notes?: string
) => {
	// Verify user is a member
	const membership = await GroupMember.findOne({
		where: {
			group_id,
			user_id: user.user_id,
			status: 'active',
		},
	});

	if (!membership) {
		throw new Error('You are not a member of this group');
	}

	// Check if content already exists in group watchlist
	const existingEntry = await GroupWatchlist.findOne({
		where: { group_id, tmdb_id },
	});

	if (existingEntry) {
		throw new Error('This content is already in the group watchlist');
	}

	// Add to group watchlist
	const groupEntry = await GroupWatchlist.create({
		group_id,
		tmdb_id,
		media_type,
		suggested_by: user.user_id,
		notes,
		status: 'suggested',
	});

	// Log activity
	await activityService.logActivity(
		user.user_id,
		ActivityType.GROUP_WATCHLIST_ADD,
		{
			group_id,
			tmdb_id,
			media_type,
			timestamp: new Date(),
		}
	);

	return groupEntry;
};

// Get pending invitations for user
export const getPendingInvitationsService = async (user: AuthenticatedUser) => {
	const pendingInvitations = await GroupMember.findAll({
		where: {
			user_id: user.user_id,
			status: 'pending',
		},
		include: [
			{
				model: Group,
				as: 'group',
				include: [
					{
						model: User,
						as: 'creator',
						attributes: ['user_id', 'username', 'email'],
					},
				],
			},
			{
				model: User,
				as: 'inviter',
				attributes: ['user_id', 'username', 'email'],
			},
		],
	});

	return pendingInvitations.map(invitation => ({
		...invitation.toJSON(),
		group: invitation.group?.toJSON(),
		inviter: invitation.inviter?.toJSON(),
	}));
};
