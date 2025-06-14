import { Op, QueryTypes } from 'sequelize';
import { ActivityLog } from '../models/ActivityLog';
import Match from '../models/Match';
import type { ActivityContext, AuthenticatedRequest } from '../types';

/**
 * Activity types to ensure consistency across the application
 */
export enum ActivityType {
	// Watchlist related activities
	WATCHLIST_ADD = 'WATCHLIST_ADD',
	WATCHLIST_UPDATE = 'WATCHLIST_UPDATE',
	WATCHLIST_REMOVE = 'WATCHLIST_REMOVE',
	WATCHLIST_RATE = 'WATCHLIST_RATE',
	WATCHLIST_VIEWED = 'WATCHLIST_VIEWED',

	// User related activities
	USER_LOGIN = 'USER_LOGIN',
	USER_LOGOUT = 'USER_LOGOUT',
	USER_SIGNUP = 'USER_SIGNUP',
	USER_PROFILE_UPDATE = 'USER_PROFILE_UPDATE',
	USER_PREFERENCES_UPDATE = 'USER_PREFERENCES_UPDATE',
	USER_PASSWORD_CHANGE = 'USER_PASSWORD_CHANGE',

	// Match related activities
	MATCH_VIEW = 'MATCH_VIEW',
	MATCH_CREATE = 'MATCH_CREATE',
	MATCH_UPDATE = 'MATCH_UPDATE',
	MATCH_ACCEPTED = 'MATCH_ACCEPTED',
	MATCH_DECLINED = 'MATCH_DECLINED',

	// Media related activities
	MEDIA_SEARCH = 'MEDIA_SEARCH',
	MEDIA_VIEWED = 'MEDIA_VIEWED',
	MEDIA_DETAILS_VIEWED = 'MEDIA_DETAILS_VIEWED',

	// System related activities
	NOTIFICATION_CLICKED = 'NOTIFICATION_CLICKED',
	FEATURE_USED = 'FEATURE_USED',
	SYSTEM_CONFIG = 'SYSTEM_CONFIG',
	SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',

	// Content moderation activities
	CONTENT_MODERATION = 'CONTENT_MODERATION',

	// Group related activities
	GROUP_CREATE = 'GROUP_CREATE',
	GROUP_UPDATE = 'GROUP_UPDATE',
	GROUP_DELETE = 'GROUP_DELETE',
	GROUP_JOIN = 'GROUP_JOIN',
	GROUP_LEAVE = 'GROUP_LEAVE',
	GROUP_INVITE = 'GROUP_INVITE',
	GROUP_INVITE_ACCEPT = 'GROUP_INVITE_ACCEPT',
	GROUP_INVITE_DECLINE = 'GROUP_INVITE_DECLINE',
	GROUP_MEMBER_REMOVE = 'GROUP_MEMBER_REMOVE',
	GROUP_ROLE_UPDATE = 'GROUP_ROLE_UPDATE',
	GROUP_WATCHLIST_ADD = 'GROUP_WATCHLIST_ADD',
	GROUP_WATCHLIST_REMOVE = 'GROUP_WATCHLIST_REMOVE',
	GROUP_WATCHLIST_VOTE = 'GROUP_WATCHLIST_VOTE',
	GROUP_SCHEDULE_SET = 'GROUP_SCHEDULE_SET',
}

/**
 * Activity metadata interface for type safety
 */
interface ActivityMetadata {
	tmdbId?: number;
	mediaType?: 'movie' | 'tv';
	rating?: number;
	searchQuery?: string;
	matchId?: string;
	notificationId?: string;
	featureName?: string;
	configKey?: string;
	[key: string]: unknown;
}

/**
 * Query replacements interface for database queries
 */
interface QueryReplacements {
	date: Date;
	limit: number;
	userId?: string;
	dateFormat?: string;
	startDate?: Date;
	endDate?: Date;
	[key: string]: unknown;
}

/**
 * User pattern result with correct property names
 */
interface UserPatternResult {
	user_id: string;
	username: string;
	most_frequent_activity: string;
	most_active_time: string;
	activity_count: number;
}

/**
 * Get appropriate context based on activity type
 */
export const getContextFromActivityType = (
	actionType: ActivityType
): ActivityContext => {
	const actionString = String(actionType);
	if (actionString.startsWith('WATCHLIST_')) {
		return 'watchlist';
	}
	if (actionString.startsWith('USER_')) {
		return 'user';
	}
	if (actionString.startsWith('MATCH_')) {
		return 'match';
	}
	if (actionString.startsWith('GROUP_')) {
		return 'group';
	}
	if (actionString.startsWith('MEDIA_')) {
		return 'media';
	}
	if (
		actionType === ActivityType.NOTIFICATION_CLICKED ||
		actionType === ActivityType.FEATURE_USED
	) {
		return 'system';
	}
	return 'system'; // Default context
};

/**
 * Log a user activity
 * @param userId - ID of the user performing the action
 * @param action - Type of activity from ActivityType enum
 * @param metadata - Additional data about the activity (optional)
 * @param req - Request object to extract IP and user agent (optional)
 * @param context - Explicitly set context category (optional)
 * @returns The created activity log entry or undefined if creation fails
 */
export const logActivity = async (
	userId: string,
	action: ActivityType,
	metadata?: ActivityMetadata,
	req?: AuthenticatedRequest,
	context?: ActivityContext
): Promise<ActivityLog | undefined> => {
	try {
		// Determine context if not explicitly provided
		const activityContext = context ?? getContextFromActivityType(action);

		return await ActivityLog.create({
			user_id: userId,
			action,
			context: activityContext,
			metadata: metadata ?? {},
			ip_address: req?.ip ?? null,
			user_agent: req?.get('user-agent') ?? null,
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
): Promise<ActivityLog[]> =>
	ActivityLog.findAll({
		where: { user_id: userId },
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

/**
 * Get the count of activity log entries for a specific user
 * @param userId - ID of the user whose activities to count
 * @returns Total number of activity entries
 */
export const getUserActivitiesCount = async (userId: string): Promise<number> =>
	ActivityLog.count({
		where: { user_id: userId },
	});

/**
 * Get activities from the user's matched partners only
 * @param userId - Current user's ID
 * @param limit - Maximum number of activities to return (default: 20)
 * @param offset - Number of activities to skip (for pagination)
 * @returns Array of activity log entries from matched partners
 */
export const getPartnerActivities = async (
	userId: string,
	limit = 20,
	offset = 0
): Promise<ActivityLog[]> => {
	// First, get all accepted matches for the user
	const matches = await Match.findAll({
		where: {
			[Op.or]: [
				{ user1_id: userId, status: 'accepted' },
				{ user2_id: userId, status: 'accepted' },
			],
		},
	});

	// If no matches, return empty array
	if (!matches || matches.length === 0) {
		return [];
	}

	// Get the partner user IDs
	const partnerUserIds = matches.map(match =>
		match.user1_id === userId ? match.user2_id : match.user1_id
	);

	// Define socially relevant activities that partners would want to see
	const sociallyRelevantActivities = [
		'WATCHLIST_ADD',
		'WATCHLIST_UPDATE',
		'WATCHLIST_REMOVE',
		'WATCHLIST_RATE',
		'MATCH_ACCEPTED',
		'MATCH_CREATE',
	];

	// Get activities only from partners and only socially relevant ones
	const activities = await ActivityLog.findAll({
		where: {
			user_id: {
				[Op.in]: partnerUserIds,
			},
			action: {
				[Op.in]: sociallyRelevantActivities,
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

	return activities;
};

/**
 * Get all recent activities (for partner's activities) - DEPRECATED
 * Use getPartnerActivities instead for proper partner filtering
 * @param excludeUserId - User ID to exclude from results (typically the current user)
 * @param limit - Maximum number of activities to return (default: 20)
 * @param offset - Number of activities to skip (for pagination)
 * @returns Array of activity log entries
 */
export const getRecentActivities = async (
	excludeUserId: string,
	limit = 20,
	offset = 0
): Promise<ActivityLog[]> =>
	ActivityLog.findAll({
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

/**
 * Get most popular activities within a specific time period
 * @param days - Number of days to look back
 * @param limit - Maximum number of activities to return
 * @returns Array of activity types with their counts
 */
export const getMostPopularActivities = async (
	days = 7,
	limit = 10
): Promise<{ action: string; count: number }[]> => {
	const date = new Date();
	date.setDate(date.getDate() - days);

	const { sequelize } = ActivityLog;
	if (!sequelize) {
		throw new Error('Database connection not available');
	}

	const results = await sequelize.query(
		`SELECT action, COUNT(*) as count 
         FROM activity_log 
         WHERE created_at >= :date
         GROUP BY action 
         ORDER BY count DESC 
         LIMIT :limit`,
		{
			replacements: { date, limit },
			type: QueryTypes.SELECT,
		}
	);

	return results as { action: string; count: number }[];
};

/**
 * Get activity timeline for visualizing activity over time
 * @param startDate - Start date for the timeline
 * @param endDate - End date for the timeline
 * @param groupBy - How to group the data (day, week, month)
 * @returns Array of dates with activity counts
 */
export const getActivityTimeline = async (
	startDate: Date,
	endDate: Date,
	groupBy: 'day' | 'week' | 'month' = 'day'
): Promise<{ date: string; count: number }[]> => {
	const { sequelize } = ActivityLog;
	if (!sequelize) {
		throw new Error('Database connection not available');
	}

	let dateFormat: string;
	let groupByClause: string;

	// Set SQL date formatting based on grouping preference
	switch (groupBy) {
		case 'week':
			// Format for grouping by week (may need adjustment based on DB)
			dateFormat = 'YYYY-WW';
			groupByClause = "DATE_TRUNC('week', created_at)";
			break;
		case 'month':
			// Format for grouping by month
			dateFormat = 'YYYY-MM';
			groupByClause = "DATE_TRUNC('month', created_at)";
			break;
		case 'day':
		default:
			// Format for grouping by day
			dateFormat = 'YYYY-MM-DD';
			groupByClause = "DATE_TRUNC('day', created_at)";
			break;
	}

	const results = await sequelize.query(
		`SELECT TO_CHAR(${groupByClause}, :dateFormat) as date, COUNT(*) as count 
         FROM activity_log 
         WHERE created_at BETWEEN :startDate AND :endDate
         GROUP BY date 
         ORDER BY date ASC`,
		{
			replacements: { dateFormat, startDate, endDate },
			type: QueryTypes.SELECT,
		}
	);

	return results as { date: string; count: number }[];
};

/**
 * Get activity statistics by context or action type
 * @param days - Number of days to include in statistics
 * @param groupBy - Group by context or action
 * @returns Object with activity statistics
 */
export const getActivityStats = async (
	days = 30,
	groupBy: 'context' | 'action' = 'context'
): Promise<{ label: string; count: number }[]> => {
	const date = new Date();
	date.setDate(date.getDate() - days);

	const { sequelize } = ActivityLog;
	if (!sequelize) {
		throw new Error('Database connection not available');
	}

	const results = await sequelize.query(
		`SELECT ${groupBy} as label, COUNT(*) as count 
         FROM activity_log 
         WHERE created_at >= :date
         GROUP BY ${groupBy} 
         ORDER BY count DESC`,
		{
			replacements: { date },
			type: QueryTypes.SELECT,
		}
	);

	return results as { label: string; count: number }[];
};

/**
 * Get activity patterns for specific users
 * @param userId - ID of the user to analyze (optional, if not provided will get top users)
 * @param days - Number of days to include
 * @param limit - Maximum number of records to return
 * @returns Activity patterns by user
 */
export const getUserActivityPatterns = async (
	userId?: string,
	days = 30,
	limit = 10
): Promise<
	{
		user_id: string;
		username: string;
		mostFrequentActivity: string;
		mostActiveTime: string;
		activityCount: number;
	}[]
> => {
	const date = new Date();
	date.setDate(date.getDate() - days);

	const { sequelize } = ActivityLog;
	if (!sequelize) {
		throw new Error('Database connection not available');
	}

	// This is a complex query that would need to be adjusted based on
	// the specific database being used (PostgreSQL, MySQL, etc.)
	const query = `
        WITH user_activities AS (
            SELECT 
                a.user_id,
                u.username,
                a.action,
                to_char(a.created_at, 'HH24') as hour_of_day,
                COUNT(*) as activity_count,
                RANK() OVER (PARTITION BY a.user_id ORDER BY COUNT(*) DESC) as action_rank,
                RANK() OVER (PARTITION BY a.user_id ORDER BY COUNT(to_char(a.created_at, 'HH24')) DESC) as hour_rank
            FROM 
                activity_log a
            JOIN
                users u ON a.user_id = u.user_id
            WHERE 
                a.created_at >= :date
                ${userId ? 'AND a.user_id = :userId' : ''}
            GROUP BY 
                a.user_id, u.username, a.action, hour_of_day
        )
        SELECT 
            ua1.user_id,
            ua1.username,
            ua1.action as most_frequent_activity,
            ua2.hour_of_day as most_active_time,
            (SELECT COUNT(*) FROM activity_log WHERE user_id = ua1.user_id AND created_at >= :date) as activity_count
        FROM 
            user_activities ua1
        JOIN
            user_activities ua2 ON ua1.user_id = ua2.user_id AND ua2.hour_rank = 1
        WHERE 
            ua1.action_rank = 1
        ORDER BY 
            activity_count DESC
        LIMIT :limit
    `;

	const replacements: QueryReplacements = { date, limit };
	if (userId) {
		replacements.userId = userId;
	}

	const results = (await sequelize.query(query, {
		replacements,
		type: QueryTypes.SELECT,
	})) as unknown;

	// Transform the results to match the expected return type
	const transformedResults = (results as UserPatternResult[]).map(result => ({
		user_id: result.user_id,
		username: result.username,
		mostFrequentActivity: result.most_frequent_activity,
		mostActiveTime: result.most_active_time,
		activityCount: Number(result.activity_count),
	}));

	return transformedResults;
};

/**
 * Get activities filtered by context and action type
 * @param context - Activity context to filter by
 * @param action - Specific action to filter by (optional)
 * @param limit - Maximum number of records to return
 * @param offset - Number of records to skip (for pagination)
 * @returns Filtered activities with pagination info
 */
export const getActivitiesByContext = async (
	context: ActivityContext,
	action?: string,
	limit = 20,
	offset = 0
): Promise<{
	activities: ActivityLog[];
	pagination: {
		total: number;
		limit: number;
		offset: number;
		hasMore: boolean;
	};
}> => {
	// Use proper Sequelize where clause typing
	const where: Record<string, unknown> = { context };

	// Add action filter if provided
	if (action) {
		where.action = action;
	}

	// Get activities
	const activities = await ActivityLog.findAll({
		where,
		order: [['created_at', 'DESC']],
		limit,
		offset,
		include: [
			{
				association: 'user',
				attributes: ['user_id', 'username', 'email'],
			},
		],
	});

	// Get total count for pagination
	const total = await ActivityLog.count({ where });

	return {
		activities,
		pagination: {
			total,
			limit,
			offset,
			hasMore: offset + activities.length < total,
		},
	};
};

/**
 * Get filtered user activities for social feed (excludes system activities)
 * @param userId - ID of the user whose activities to fetch
 * @param limit - Maximum number of activities to return (default: 20)
 * @param offset - Number of activities to skip (for pagination)
 * @returns Array of socially relevant activity log entries
 */
export const getUserSocialActivities = async (
	userId: string,
	limit = 20,
	offset = 0
): Promise<ActivityLog[]> => {
	// Define socially relevant activities that partners would want to see
	const sociallyRelevantActivities = [
		'WATCHLIST_ADD',
		'WATCHLIST_UPDATE',
		'WATCHLIST_REMOVE',
		'WATCHLIST_RATE',
		'MATCH_ACCEPTED',
		'MATCH_CREATE',
	];

	return ActivityLog.findAll({
		where: {
			user_id: userId,
			action: {
				[Op.in]: sociallyRelevantActivities,
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
	getPartnerActivities,
	getRecentActivities, // Keep for backward compatibility
	getUserActivitiesCount,
	getMostPopularActivities,
	getActivityTimeline,
	getActivityStats,
	getUserActivityPatterns,
	getActivitiesByContext,
	getUserSocialActivities,
};
