import { Request, Response } from 'express';
import { activityService } from '../services/activity.service';

/**
 * Get the current user's activity log
 */
export const getUserActivities = async (req: Request, res: Response) => {
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
export const getPartnerActivities = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const userId = req.user.user_id;
		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		// In a two-user system, getting activities from everyone except the current user
		// will effectively get the partner's activities
		const activities = await activityService.getRecentActivities(
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
export const getFeed = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const userId = req.user.user_id;
		const limit = parseInt(req.query.limit as string, 10) || 20;
		const offset = parseInt(req.query.offset as string, 10) || 0;

		// Get both user's and partner's activities
		const [userActivities, partnerActivities] = await Promise.all([
			activityService.getUserActivities(userId, limit, offset),
			activityService.getRecentActivities(userId, limit, offset),
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

// Export controller functions with an object for backward compatibility
export const activityController = {
	getUserActivities,
	getPartnerActivities,
	getFeed,
};
