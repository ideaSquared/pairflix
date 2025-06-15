import type { Request, Response } from 'express';
import { ActivityType, activityService } from '../services/activity.service';
import {
	acceptGroupInvitationService,
	addToGroupWatchlistService,
	createGroupService,
	createRelationshipService,
	expandRelationshipService,
	getGroupContentMatchesService,
	getPendingInvitationsService,
	getPrimaryRelationshipService,
	getUserGroupsService,
	inviteToGroupService,
} from '../services/group.service';

// Create a new relationship (replaces match creation)
export const createRelationship = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { partner_email, group_name, description } = req.body;

		if (!partner_email) {
			return res.status(400).json({ error: 'partner_email is required' });
		}

		const group = await createRelationshipService(req.user, {
			partner_email,
			group_name,
			description,
		});

		res.status(201).json(group);
	} catch (error) {
		console.error('Error creating relationship:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Get primary relationship (for frontend that supports one relationship)
export const getPrimaryRelationship = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const relationship = await getPrimaryRelationshipService(req.user);

		if (!relationship) {
			return res.json(null);
		}

		res.json(relationship);
	} catch (error) {
		console.error('Error getting primary relationship:', error);
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Create a new group (for advanced users wanting multiple groups)
export const createGroup = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { name, description, type, max_members, settings } = req.body;

		// Validate required fields
		if (!name || !type) {
			return res.status(400).json({ error: 'Name and type are required' });
		}

		// Validate group type
		if (!['couple', 'friends', 'watch_party'].includes(type)) {
			return res.status(400).json({ error: 'Invalid group type' });
		}

		const group = await createGroupService(req.user, {
			name,
			description,
			type,
			max_members,
			settings,
		});

		res.status(201).json(group);
	} catch (error) {
		console.error('Error creating group:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Get user's groups (for users who have multiple)
export const getUserGroups = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const groups = await getUserGroupsService(req.user);
		res.json(groups);
	} catch (error) {
		console.error('Error getting user groups:', error);
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Expand relationship (e.g., couple → friends → watch party)
export const expandRelationship = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { group_id } = req.params;
		const { new_type, new_max_members, new_name } = req.body;

		if (!group_id) {
			return res.status(400).json({ error: 'group_id is required' });
		}

		if (!new_type || !['friends', 'watch_party'].includes(new_type)) {
			return res
				.status(400)
				.json({ error: 'Invalid new_type. Must be friends or watch_party' });
		}

		const group = await expandRelationshipService(
			req.user,
			group_id,
			new_type,
			new_max_members,
			new_name
		);

		res.json(group);
	} catch (error) {
		console.error('Error expanding relationship:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Invite users to group
export const inviteToGroup = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { group_id } = req.params;
		const { user_ids } = req.body;

		if (!group_id) {
			return res.status(400).json({ error: 'group_id is required' });
		}

		if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
			return res.status(400).json({ error: 'user_ids array is required' });
		}

		const invitations = await inviteToGroupService(req.user, {
			group_id,
			user_ids,
		});

		res.status(201).json(invitations);
	} catch (error) {
		console.error('Error inviting to group:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Accept group invitation
export const acceptGroupInvitation = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { group_id } = req.params;

		if (!group_id) {
			return res.status(400).json({ error: 'group_id is required' });
		}

		const membership = await acceptGroupInvitationService(req.user, group_id);

		res.json(membership);
	} catch (error) {
		console.error('Error accepting group invitation:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Decline group invitation
export const declineGroupInvitation = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { group_id } = req.params;

		// This would be implemented in the service
		// For now, just return success
		await activityService.logActivity(
			req.user.user_id,
			ActivityType.GROUP_INVITE_DECLINE,
			{
				group_id,
				timestamp: new Date(),
			}
		);

		res.json({ message: 'Group invitation declined' });
	} catch (error) {
		console.error('Error declining group invitation:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Get group content matches
export const getGroupContentMatches = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { group_id } = req.params;

		if (!group_id) {
			return res.status(400).json({ error: 'group_id is required' });
		}

		const matches = await getGroupContentMatchesService(req.user, group_id);

		res.json(matches);
	} catch (error) {
		console.error('Error getting group content matches:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Add content to group watchlist
export const addToGroupWatchlist = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const { group_id } = req.params;
		const { tmdb_id, media_type, notes } = req.body;

		if (!group_id) {
			return res.status(400).json({ error: 'group_id is required' });
		}

		if (!tmdb_id || !media_type) {
			return res
				.status(400)
				.json({ error: 'tmdb_id and media_type are required' });
		}

		if (!['movie', 'tv'].includes(media_type)) {
			return res.status(400).json({ error: 'Invalid media_type' });
		}

		const groupEntry = await addToGroupWatchlistService(
			req.user,
			group_id,
			tmdb_id,
			media_type,
			notes
		);

		res.status(201).json(groupEntry);
	} catch (error) {
		console.error('Error adding to group watchlist:', error);
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

// Get group invitations (pending invitations for the user)
export const getGroupInvitations = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const invitations = await getPendingInvitationsService(req.user);
		res.json(invitations);
	} catch (error) {
		console.error('Error getting group invitations:', error);
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
