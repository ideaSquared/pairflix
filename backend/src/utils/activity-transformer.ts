import { ActivityLog } from '../models/ActivityLog';
import { ActivityType } from '../services/activity.service';

/**
 * Transform activity log data into user-friendly messages
 */
export interface TransformedActivity {
	id: string;
	userId: string;
	username?: string;
	message: string;
	type: string;
	timestamp: Date;
	metadata: any;
}

/**
 * Transform an activity log entry into a user-friendly format
 */
export function transformActivity(activity: ActivityLog): TransformedActivity {
	const { log_id, user_id, action, metadata, created_at } = activity;
	// Access the user property safely using any type assertion since it's added via association
	const user = (activity as any).user;
	const username = user?.username;

	let message = '';

	switch (action) {
		case ActivityType.WATCHLIST_ADD:
			message = `added "${metadata?.title || 'a title'}" to their watchlist`;
			break;

		case ActivityType.WATCHLIST_UPDATE:
			message = `updated "${metadata?.title || 'a title'}" in their watchlist`;
			if (metadata?.status) {
				message = `marked "${metadata.title || 'a title'}" as ${metadata.status}`;
			}
			break;

		case ActivityType.WATCHLIST_REMOVE:
			message = `removed "${metadata?.title || 'a title'}" from their watchlist`;
			break;

		case ActivityType.WATCHLIST_RATE:
			message = `rated "${metadata?.title || 'a title'}" ${metadata?.rating}/10`;
			break;

		case ActivityType.USER_PROFILE_UPDATE:
			if (metadata?.field === 'username') {
				message = `changed their username to ${metadata.newUsername}`;
			} else if (metadata?.field === 'favoriteGenres') {
				message = `updated their favorite genres to ${metadata.genres?.join(', ') || 'unknown genres'}`;
			} else {
				message = 'updated their profile';
			}
			break;

		case ActivityType.MATCH_CREATE:
			message = 'created a new match';
			break;

		case ActivityType.MATCH_UPDATE:
			message = `updated a match status to ${metadata?.newStatus || 'a new status'}`;
			break;

		default:
			message = 'performed an action';
	}

	return {
		id: log_id,
		userId: user_id,
		username,
		message,
		type: action,
		timestamp: created_at,
		metadata,
	};
}
