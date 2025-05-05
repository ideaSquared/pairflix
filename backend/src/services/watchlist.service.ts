import WatchlistEntry from '../models/WatchlistEntry';
import { getMovieDetails } from './tmdb.service';

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
			const details = await getMovieDetails(entry.tmdb_id);
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
	// Logic for fetching matches from the watchlist
};
