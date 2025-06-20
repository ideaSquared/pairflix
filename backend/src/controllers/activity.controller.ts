import type { Response } from 'express';
import { activityService } from '../services/activity.service';
import type { AuthenticatedRequest } from '../types';

/**
 * Get the current user's activity log
 */
export const getUserActivities = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const userId = req.user.user_id;
		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		const activities = await activityService.getUserActivities(
			userId,
			limit,
			offset
		);

		return res.status(200).json({ activities });
	} catch (error) {
		console.error('Error fetching user activities:', error);
		return res.status(500).json({ error: 'Failed to fetch activities' });
	}
};

/**
 * Get activities from the user's partner
 */
export const getPartnerActivities = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const userId = req.user.user_id;
		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		// Get activities only from matched partners
		const activities = await activityService.getPartnerActivities(
			userId,
			limit,
			offset
		);

		return res.status(200).json({ activities });
	} catch (error) {
		console.error('Error fetching partner activities:', error);
		return res.status(500).json({ error: 'Failed to fetch activities' });
	}
};

/**
 * Get a combined feed of both users' activities
 */
export const getFeed = async (req: AuthenticatedRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const userId = req.user.user_id;
		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		// Get both user's and partner's activities (filtered for social relevance)
		const [userActivities, partnerActivities] = await Promise.all([
			activityService.getUserSocialActivities(userId, limit, offset),
			activityService.getPartnerActivities(userId, limit, offset),
		]);

		// Combine and sort by creation date (newest first)
		const allActivities = [...userActivities, ...partnerActivities].sort(
			(a, b) =>
				new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
		);

		// Respect the original limit
		const activities = allActivities.slice(0, limit);

		return res.status(200).json({ activities });
	} catch (error) {
		console.error('Error fetching activity feed:', error);
		return res.status(500).json({ error: 'Failed to fetch activity feed' });
	}
};

/**
 * Get activities for a specific user (Admin only)
 */
export const getAdminUserActivities = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		// Check if user has admin privileges
		if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
			return res.status(403).json({ error: 'Admin privileges required' });
		}

		const { userId } = req.params;
		// Ensure userId is provided and is not the string "undefined"
		if (!userId || userId === 'undefined') {
			return res.status(400).json({ error: 'Valid User ID is required' });
		}

		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		// Get activities for the specified user
		const activities = await activityService.getUserActivities(
			userId,
			limit,
			offset
		);

		// Calculate total for pagination
		const total = await activityService.getUserActivitiesCount(userId);

		return res.status(200).json({
			activities,
			pagination: {
				total,
				limit,
				offset,
				hasMore: offset + limit < total,
			},
		});
	} catch (error) {
		console.error('Error fetching user activities:', error);
		return res.status(500).json({ error: 'Failed to fetch activities' });
	}
};

// Export controller functions with an object for backward compatibility
export const activityController = {
	getUserActivities,
	getPartnerActivities,
	getFeed,
	getAdminUserActivities, // Make sure this is included
};
