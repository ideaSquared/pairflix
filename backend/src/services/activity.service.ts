import { ActivityLog } from '../models/ActivityLog';

/**
 * Activity types to ensure consistency across the application
 */
export enum ActivityType {
	WATCHLIST_ADD = 'WATCHLIST_ADD',
	WATCHLIST_UPDATE = 'WATCHLIST_UPDATE',
	WATCHLIST_REMOVE = 'WATCHLIST_REMOVE',
	WATCHLIST_RATE = 'WATCHLIST_RATE',
	USER_LOGIN = 'USER_LOGIN',
	USER_PROFILE_UPDATE = 'USER_PROFILE_UPDATE',
	USER_PASSWORD_CHANGE = 'USER_PASSWORD_CHANGE',
	MATCH_VIEW = 'MATCH_VIEW',
	MATCH_CREATE = 'MATCH_CREATE',
	MATCH_UPDATE = 'MATCH_UPDATE',
	MEDIA_SEARCH = 'MEDIA_SEARCH',
}

/**
 * Log a user activity
 * @param userId - ID of the user performing the action
 * @param action - Type of activity from ActivityType enum
 * @param metadata - Additional data about the activity (optional)
 * @returns The created activity log entry or undefined if creation fails
 */
export const logActivity = async (
	userId: string,
	action: ActivityType,
	metadata?: any
): Promise<ActivityLog | undefined> => {
	try {
		return await ActivityLog.create({
			user_id: userId,
			action,
			metadata,
		});
	} catch (error) {
		console.error('Failed to log activity:', error);
		// We don't want to throw errors from activity logging
		// as it shouldn't interrupt the main application flow
		return undefined;
	}
};

/**
 * Get activity log entries for a specific user
 * @param userId - ID of the user whose activities to fetch
 * @param limit - Maximum number of activities to return (default: 20)
 * @param offset - Number of activities to skip (for pagination)
 * @returns Array of activity log entries
 */
export const getUserActivities = async (
	userId: string,
	limit = 20,
	offset = 0
): Promise<ActivityLog[]> => {
	return ActivityLog.findAll({
		where: { user_id: userId },
		order: [['created_at', 'DESC']],
		limit,
		offset,
	});
};

/**
 * Get all recent activities (for partner's activities)
 * @param excludeUserId - User ID to exclude from results (typically the current user)
 * @param limit - Maximum number of activities to return (default: 20)
 * @param offset - Number of activities to skip (for pagination)
 * @returns Array of activity log entries
 */
export const getRecentActivities = async (
	excludeUserId: string,
	limit = 20,
	offset = 0
): Promise<ActivityLog[]> => {
	return ActivityLog.findAll({
		where: {
			user_id: {
				[Symbol.for('ne')]: excludeUserId,
			},
		},
		order: [['created_at', 'DESC']],
		limit,
		offset,
		include: [
			{
				association: 'user',
				attributes: ['user_id', 'username'],
			},
		],
	});
};

// Export service functions with an object for backward compatibility
export const activityService = {
	logActivity,
	getUserActivities,
	getRecentActivities,
};
