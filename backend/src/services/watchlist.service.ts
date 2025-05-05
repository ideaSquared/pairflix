import { Op } from 'sequelize';
import Match from '../models/Match';
import WatchlistEntry from '../models/WatchlistEntry';
import {
	getMovieDetails,
	getTVDetails,
	TMDbMovie,
	TMDbTV,
} from './tmdb.service';

export const addToWatchlistService = async (user: any, body: any) => {
	const { tmdb_id, media_type, status, notes } = body;
	return WatchlistEntry.create({
		user_id: user.user_id,
		tmdb_id,
		media_type,
		status,
		notes,
	});
};

export const getWatchlistService = async (user: any) => {
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
			return { ...entry.toJSON(), ...details };
		})
	);
};

export const updateWatchlistEntryService = async (
	entry_id: string,
	body: any,
	user: any
) => {
	const [updated] = await WatchlistEntry.update(body, {
		where: { entry_id, user_id: user.user_id },
	});
	if (!updated) {
		throw new Error('Entry not found');
	}
	return WatchlistEntry.findByPk(entry_id);
};

export const getMatchesService = async (user: any) => {
	try {
		console.log('Getting matches for user:', user.user_id);

		// First, get all accepted matches for the user
		const matches = await Match.findAll({
			where: {
				[Op.or]: [
					{ user1_id: user.user_id, status: 'accepted' },
					{ user2_id: user.user_id, status: 'accepted' },
				],
			},
		});

		console.log('Found matches:', matches.length);

		if (!matches || matches.length === 0) {
			return [];
		}

		// Get the matched user's ID for each match
		const matchedUserIds = matches.map(match =>
			match.user1_id === user.user_id ? match.user2_id : match.user1_id
		);

		console.log('Matched user IDs:', matchedUserIds);

		// Get current user's watchlist
		const userEntries = await WatchlistEntry.findAll({
			where: { user_id: user.user_id },
		});

		console.log('Current user entries:', userEntries.length);

		// Get matched users' watchlist entries
		const matchedUserEntries = await WatchlistEntry.findAll({
			where: {
				user_id: { [Op.in]: matchedUserIds },
			},
		});

		console.log('Matched users entries:', matchedUserEntries.length);

		// Create a map of TMDb IDs to matched user entries for faster lookup
		const matchedEntriesMap = new Map();
		matchedUserEntries.forEach(entry => {
			matchedEntriesMap.set(entry.tmdb_id, entry);
		});

		// Find matches and enrich with TMDb details
		const contentMatches = await Promise.all(
			userEntries.map(async userEntry => {
				const matchedEntry = matchedEntriesMap.get(userEntry.tmdb_id);
				if (matchedEntry) {
					try {
						console.log('Found matching content:', userEntry.tmdb_id);
						const details =
							userEntry.media_type === 'tv'
								? ((await getTVDetails(userEntry.tmdb_id)) as TMDbTV)
								: ((await getMovieDetails(userEntry.tmdb_id)) as TMDbMovie);

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
							user2_status: matchedEntry.status,
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
		const validMatches = contentMatches.filter(match => match !== null);
		console.log('Returning valid content matches:', validMatches.length);
		return validMatches;
	} catch (error) {
		console.error('Error in getMatchesService:', error);
		return [];
	}
};
