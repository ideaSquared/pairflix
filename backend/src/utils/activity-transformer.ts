import { ActivityType } from '../services/activity.service';

// Define a simplified interface for ActivityLog data without Sequelize model methods
interface ActivityLogData {
	log_id: string;
	user_id: string;
	action: string;
	context: string;
	metadata: unknown;
	ip_address: string | null;
	user_agent: string | null;
	created_at: Date;
	user?: {
		username: string;
	};
}

// Define specific metadata interfaces for type safety
interface WatchlistMetadata {
	title?: string;
	tmdb_id?: number;
	media_type?: string;
	status?: string;
	rating?: number;
}

interface UserProfileMetadata {
	field?: string;
	newUsername?: string;
	genres?: string[];
}

interface MatchMetadata {
	matchId?: string;
	contentIds?: number[];
	newStatus?: string;
}

type ActivityMetadata =
	| WatchlistMetadata
	| UserProfileMetadata
	| MatchMetadata
	| Record<string, unknown>;

/**
 * Transform activity log data into user-friendly messages
 */
export interface TransformedActivity {
	id: string;
	userId: string;
	username?: string | undefined;
	message: string;
	type: string;
	timestamp: Date;
	metadata: ActivityMetadata;
}

/**
 * Transform an activity log entry into a user-friendly format
 */
export function transformActivity(
	activity: ActivityLogData
): TransformedActivity {
	const { log_id } = activity;
	const { user_id } = activity;
	const { action } = activity;
	const metadata = activity.metadata as ActivityMetadata;
	const { created_at } = activity;
	const { user } = activity;
	const username = user?.username;

	let message = '';

	// Type-safe metadata access
	const typedMetadata = metadata;

	switch (action as ActivityType) {
		case ActivityType.WATCHLIST_ADD:
			message = `added "${(typedMetadata as WatchlistMetadata).title ?? 'a title'}" to their watchlist`;
			break;

		case ActivityType.WATCHLIST_UPDATE: {
			const watchlistMeta = typedMetadata as WatchlistMetadata;
			message = `updated "${watchlistMeta.title ?? 'a title'}" in their watchlist`;
			if (watchlistMeta.status) {
				message = `marked "${watchlistMeta.title ?? 'a title'}" as ${watchlistMeta.status}`;
			}
			break;
		}

		case ActivityType.WATCHLIST_REMOVE:
			message = `removed "${(typedMetadata as WatchlistMetadata).title ?? 'a title'}" from their watchlist`;
			break;

		case ActivityType.WATCHLIST_RATE: {
			const watchlistMeta = typedMetadata as WatchlistMetadata;
			message = `rated "${watchlistMeta.title ?? 'a title'}" ${watchlistMeta.rating ?? 'unknown'}/10`;
			break;
		}

		case ActivityType.USER_PROFILE_UPDATE: {
			const profileMeta = typedMetadata as UserProfileMetadata;
			if (profileMeta.field === 'username') {
				message = `changed their username to ${profileMeta.newUsername ?? 'unknown'}`;
			} else if (profileMeta.field === 'favoriteGenres') {
				message = `updated their favorite genres to ${profileMeta.genres?.join(', ') ?? 'unknown genres'}`;
			} else {
				message = 'updated their profile';
			}
			break;
		}

		case ActivityType.MATCH_CREATE:
			message = 'created a new match';
			break;

		case ActivityType.MATCH_UPDATE: {
			const matchMeta = typedMetadata as MatchMetadata;
			message = `updated a match status to ${matchMeta.newStatus ?? 'a new status'}`;
			break;
		}

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
		metadata: typedMetadata,
	};
}
