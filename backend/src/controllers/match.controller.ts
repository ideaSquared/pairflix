import type { Request, Response } from 'express';
import models from '../models';
import { ActivityType, activityService } from '../services/activity.service';
import { getMatchesService } from '../services/match.service';

const { Match } = models;

// Type definition for create match request body
interface CreateMatchBody {
	user2_id: string;
}

export const createMatch = async (req: Request, res: Response) => {
	console.warn('Creating new match...');
	try {
		const { user2_id } = req.body as CreateMatchBody;
		const user1_id = req.user?.user_id;

		if (!user1_id) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		// Check if users are trying to match with themselves
		if (user1_id === user2_id) {
			return res.status(400).json({ error: 'Cannot match with yourself' });
		}

		// Check if match already exists
		const existingMatch = await Match.findOne({
			where: {
				user1_id,
				user2_id,
			},
		});

		if (existingMatch) {
			return res.status(409).json({
				error: 'Match already exists',
				match: existingMatch,
			});
		}

		// Create the match request
		const match = await Match.create({
			user1_id,
			user2_id,
			status: 'pending',
		});

		// Log activity
		await activityService.logActivity(user1_id, ActivityType.MATCH_CREATE, {
			match_id: match.match_id,
			recipient_id: user2_id,
			timestamp: new Date(),
		});

		res.status(201).json(match);
	} catch (error) {
		console.error('Error creating match:', error);
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const getMatches = async (req: Request, res: Response) => {
	try {
		console.warn('Getting matches for user:', req.user?.user_id);

		// Check if user is authenticated
		if (!req.user) {
			return res.status(401).json({ error: 'User not authenticated' });
		}

		const matches = await getMatchesService(req.user);

		// Just viewing matches isn't an activity others need to see
		// This would clutter the activity feed without providing value

		res.json(matches);
	} catch (error) {
		console.error('Error getting matches:', error);
		if (error instanceof Error) {
			res.status(500).json({ error: 'Internal server error' });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updateMatchStatus = async (req: Request, res: Response) => {
	const { match_id } = req.params;
	const { status } = req.body as { status: 'accepted' | 'rejected' };
	const currentUserId = req.user?.user_id;

	if (!currentUserId) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		// Find the match
		const match = await Match.findByPk(match_id);

		if (!match) {
			return res.status(404).json({ error: 'Match not found' });
		}

		// Verify the current user is the recipient of the match request
		if (match.user2_id !== currentUserId) {
			return res.status(403).json({
				error: 'Only the recipient can accept/reject a match request',
			});
		}

		// Update the status
		console.warn(`Updating match ${match_id} status to ${status}`);
		match.status = status;
		await match.save();

		// Log activity
		if (status === 'accepted') {
			// Log for user1 (original requester)
			await activityService.logActivity(
				match.user1_id,
				ActivityType.MATCH_UPDATE,
				{
					match_id: match.match_id,
					recipient_id: match.user2_id,
					status,
					timestamp: new Date(),
				}
			);

			// Log for user2 (current user)
			await activityService.logActivity(
				currentUserId,
				ActivityType.MATCH_ACCEPTED,
				{
					match_id: match.match_id,
					requester_id: match.user1_id,
					timestamp: new Date(),
				}
			);
		} else if (status === 'rejected') {
			// Only log for the requester, not for the rejector
			await activityService.logActivity(
				match.user1_id,
				ActivityType.MATCH_DECLINED,
				{
					match_id: match.match_id,
					recipient_id: match.user2_id,
					timestamp: new Date(),
				}
			);
		}

		res.json(match);
	} catch (error) {
		console.error('Error updating match status:', error);
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const getUserMatches = async (req: Request, res: Response) => {
	console.warn('Getting user matches...');
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const matches = await getMatchesService(req.user);
		res.json(matches);
	} catch (error) {
		console.error('Error getting user matches:', error);
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
