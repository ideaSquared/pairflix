import { Op } from 'sequelize';
import Match from '../models/Match';
import WatchlistEntry from '../models/WatchlistEntry';
import {
	getMovieDetails,
	getTVDetails,
	type TMDbMovie,
	type TMDbTV,
} from './tmdb.service';

// Define valid status type based on WatchlistEntry model
type WatchlistEntryStatus =
	| 'to_watch'
	| 'watch_together_focused'
	| 'watch_together_background'
	| 'watching'
	| 'finished'
	| 'flagged'
	| 'removed'
	| 'active';

interface AuthenticatedUser {
	user_id: string;
	email: string;
	username: string;
	role?: string;
	status?: string;
	preferences?: Record<string, unknown>;
}

interface WatchlistBody {
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	status: WatchlistEntryStatus;
	notes?: string;
}

/**
 * Add a new entry to a user's watchlist
 */
export const addToWatchlist = async (
	user: AuthenticatedUser,
	body: WatchlistBody
) => {
	const { tmdb_id, media_type, status, notes } = body;

	// Create a properly typed create object
	const createData: {
		user_id: string;
		tmdb_id: number;
		media_type: 'movie' | 'tv';
		status: WatchlistEntryStatus;
		notes?: string;
	} = {
		user_id: user.user_id,
		tmdb_id,
		media_type,
		status,
	};

	// Only add notes if it's defined
	if (notes !== undefined) {
		createData.notes = notes;
	}

	return WatchlistEntry.create(createData);
};

/**
 * Get all entries in a user's watchlist with TMDb details
 */
export const getWatchlist = async (user: AuthenticatedUser) => {
	const entries = await WatchlistEntry.findAll({
		where: { user_id: user.user_id },
		order: [['created_at', 'DESC']],
	});
	return Promise.all(
		entries.map(async entry => {
			const details =
				entry.media_type === 'tv'
					? await getTVDetails(entry.tmdb_id)
					: await getMovieDetails(entry.tmdb_id);

			// Exclude TMDb status and create a clean details object
			const { status: tmdbStatus, ...cleanDetails } = details;
			const entryJson = entry.toJSON();

			// Use correct title field based on media type
			const title =
				entry.media_type === 'tv'
					? (details as TMDbTV).name
					: (details as TMDbMovie).title;

			return {
				...entryJson,
				...cleanDetails,
				title, // Override with correct title
				tmdb_status: tmdbStatus,
			};
		})
	);
};

/**
 * Update an existing watchlist entry
 */
export const updateWatchlistEntry = async (
	entry_id: string,
	body: Partial<WatchlistBody>,
	user: AuthenticatedUser
) => {
	console.warn('Updating watchlist entry:', {
		entry_id,
		body,
		userId: user.user_id,
	});

	// Create a properly typed update object
	const updateData: Partial<{
		tmdb_id: number;
		media_type: 'movie' | 'tv';
		status: WatchlistEntryStatus;
		notes?: string;
	}> = {};

	// Only add properties that exist in body
	if (body.tmdb_id !== undefined) updateData.tmdb_id = body.tmdb_id;
	if (body.media_type !== undefined) updateData.media_type = body.media_type;
	if (body.status !== undefined) updateData.status = body.status;
	if (body.notes !== undefined) updateData.notes = body.notes;

	// First, update the entry and check if it was successful
	const [updated] = await WatchlistEntry.update(updateData, {
		where: { entry_id, user_id: user.user_id },
	});

	if (!updated) {
		console.error(`Entry not found: ${entry_id} for user: ${user.user_id}`);
		throw new Error('Entry not found');
	}

	// Retrieve the updated entry
	const entry = await WatchlistEntry.findByPk(entry_id);

	if (!entry) {
		console.error(`Entry not found after update: ${entry_id}`);
		throw new Error('Entry not found after update');
	}

	const details =
		entry.media_type === 'tv'
			? await getTVDetails(entry.tmdb_id)
			: await getMovieDetails(entry.tmdb_id);

	// Exclude TMDb status and create a clean details object
	const { status: tmdbStatus, ...cleanDetails } = details;
	const entryJson = entry.toJSON();

	// Use correct title field based on media type
	const title =
		entry.media_type === 'tv'
			? (details as TMDbTV).name
			: (details as TMDbMovie).title;

	return {
		...entryJson,
		...cleanDetails,
		title, // Override with correct title
		tmdb_status: tmdbStatus,
	};
};

/**
 * Get content matches between a user and their matched users
 */
export const getMatches = async (user: AuthenticatedUser) => {
	try {
		console.warn('Getting matches for user:', user.user_id);

		// First, get all accepted matches for the user
		const matches = await Match.findAll({
			where: {
				[Op.or]: [
					{ user1_id: user.user_id, status: 'accepted' },
					{ user2_id: user.user_id, status: 'accepted' },
				],
			},
		});

		console.warn('Found matches:', matches.length);

		if (!matches?.length) {
			return [];
		}

		// Get the matched user's ID for each match
		const matchedUserIds = matches.map(match =>
			match.user1_id === user.user_id ? match.user2_id : match.user1_id
		);

		console.warn('Matched user IDs:', matchedUserIds);

		// Get current user's watchlist
		const userEntries = await WatchlistEntry.findAll({
			where: { user_id: user.user_id },
		});

		console.warn('Current user entries:', userEntries.length);

		// Get matched users' watchlist entries
		const matchedUserEntries = await WatchlistEntry.findAll({
			where: {
				user_id: { [Op.in]: matchedUserIds },
			},
		});

		console.warn('Matched users entries:', matchedUserEntries.length);

		// Create a map of TMDb IDs to matched user entries for faster lookup
		const matchedEntriesMap = new Map<number, (typeof matchedUserEntries)[0]>();
		matchedUserEntries.forEach(entry => {
			matchedEntriesMap.set(entry.tmdb_id, entry);
		});

		// Find matches and enrich with TMDb details
		const contentMatches = await Promise.all(
			userEntries.map(async userEntry => {
				const matchedEntry = matchedEntriesMap.get(userEntry.tmdb_id);
				if (matchedEntry) {
					try {
						console.warn('Found matching content:', userEntry.tmdb_id);
						const details =
							userEntry.media_type === 'tv'
								? await getTVDetails(userEntry.tmdb_id)
								: await getMovieDetails(userEntry.tmdb_id);

						return {
							tmdb_id: userEntry.tmdb_id,
							media_type: userEntry.media_type,
							title:
								userEntry.media_type === 'tv'
									? (details as TMDbTV).name
									: (details as TMDbMovie).title,
							poster_path: details.poster_path,
							overview: details.overview,
							user1_status: userEntry.status,
							user2_status: matchedEntry.status as WatchlistEntryStatus,
						};
					} catch (err) {
						console.error(
							`Failed to fetch details for ${userEntry.tmdb_id}:`,
							err
						);
						return null;
					}
				}
				return null;
			})
		);

		// Filter out null entries and return valid matches
		const validMatches = contentMatches.filter(
			(
				match
			): match is {
				tmdb_id: number;
				media_type: 'movie' | 'tv';
				title: string;
				poster_path: string | null;
				overview: string;
				user1_status: WatchlistEntryStatus;
				user2_status: WatchlistEntryStatus;
			} => match !== null
		);
		console.warn('Returning valid content matches:', validMatches.length);
		return validMatches;
	} catch (error) {
		console.error('Error in getMatches:', error);
		return [];
	}
};

// Export service functions with an object for backward compatibility
export const watchlistService = {
	addToWatchlist,
	getWatchlist,
	updateWatchlistEntry,
	getMatches,
};

// Keep the original function names for backward compatibility
export const addToWatchlistService = addToWatchlist;
export const getWatchlistService = getWatchlist;
export const updateWatchlistEntryService = updateWatchlistEntry;
export const getMatchesService = getMatches;
