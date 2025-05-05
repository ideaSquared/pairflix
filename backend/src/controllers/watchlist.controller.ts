import { Response } from 'express';
import { Op } from 'sequelize';
import WatchlistEntry from '../models/WatchlistEntry';
import {
	getMovieDetails,
	getTVDetails,
	TMDbDetails,
	TMDbMovie,
} from '../services/tmdb.service';
import { AuthenticatedRequest } from '../types';

function isMovie(details: TMDbDetails): details is TMDbMovie {
	return (details as TMDbMovie).title !== undefined;
}

export const addToWatchlist = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const { tmdb_id, media_type, status, notes } = req.body;
	const user_id = req.user?.user_id;

	if (!user_id) {
		console.error('Add to watchlist error: No user_id in request');
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const entry = await WatchlistEntry.create({
			user_id,
			tmdb_id,
			media_type,
			status,
			notes,
		});

		res.status(201).json(entry);
	} catch (error) {
		console.error('Add to watchlist error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

async function enrichWatchlistEntry(entry: WatchlistEntry) {
	try {
		const details = await (entry.media_type === 'movie'
			? getMovieDetails(entry.tmdb_id)
			: getTVDetails(entry.tmdb_id));

		const movieOrTvTitle = isMovie(details) ? details.title : details.name;

		return {
			...entry.toJSON(),
			title: movieOrTvTitle,
			poster_path: details.poster_path,
			overview: details.overview,
		};
	} catch (error) {
		console.error(
			`Failed to fetch details for ${entry.media_type} ${entry.tmdb_id}:`,
			error
		);
		return entry;
	}
}

export const getWatchlist = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const user_id = req.user?.user_id;

	if (!user_id) {
		console.error('Get watchlist error: No user_id in request');
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		console.log('Fetching watchlist for user:', user_id);
		const entries = await WatchlistEntry.findAll({
			where: { user_id },
			order: [['created_at', 'DESC']],
		});

		// Enrich entries with TMDb data
		const enrichedEntries = await Promise.all(
			entries.map(enrichWatchlistEntry)
		);

		res.json(enrichedEntries);
	} catch (error) {
		console.error('Get watchlist error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const updateWatchlistEntry = async (
	req: AuthenticatedRequest,
	res: Response
) => {
	const { entry_id } = req.params;
	const { status, rating, notes } = req.body;
	const user_id = req.user?.user_id;

	if (!user_id) {
		console.error('Update watchlist error: No user_id in request');
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const [updated] = await WatchlistEntry.update(
			{
				...(status && { status }),
				...(rating !== undefined && { rating }),
				...(notes !== undefined && { notes }),
			},
			{
				where: {
					entry_id,
					user_id,
				},
				returning: true,
			}
		);

		if (!updated) {
			return res.status(404).json({ error: 'Entry not found' });
		}

		const entry = await WatchlistEntry.findByPk(entry_id);
		if (!entry) {
			return res.status(404).json({ error: 'Entry not found' });
		}

		const enrichedEntry = await enrichWatchlistEntry(entry);
		res.json(enrichedEntry);
	} catch (error) {
		console.error('Update watchlist entry error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getMatches = async (req: AuthenticatedRequest, res: Response) => {
	const user_id = req.user?.user_id;

	if (!user_id) {
		console.error('Get matches error: No user_id in request');
		return res.status(401).json({ error: 'Authentication required' });
	}

	try {
		const userEntries = await WatchlistEntry.findAll({
			where: { user_id },
		});

		const tmdbIds = userEntries.map((entry) => entry.tmdb_id);

		const matches = await WatchlistEntry.findAll({
			where: {
				tmdb_id: { [Op.in]: tmdbIds },
				user_id: { [Op.ne]: user_id },
			},
		});

		// Enrich matched entries with TMDb data
		const enrichedUserEntries = await Promise.all(
			userEntries.map(enrichWatchlistEntry)
		);

		const matchedResults = await Promise.all(
			enrichedUserEntries.map(async (userEntry) => {
				const matchEntry = matches.find((m) => m.tmdb_id === userEntry.tmdb_id);
				if (!matchEntry) return null;

				const enrichedMatchEntry = await enrichWatchlistEntry(matchEntry);
				return {
					tmdb_id: userEntry.tmdb_id,
					media_type: userEntry.media_type,
					title: userEntry.title,
					poster_path: userEntry.poster_path,
					overview: userEntry.overview,
					user1_status: userEntry.status,
					user2_status: enrichedMatchEntry.status,
				};
			})
		);

		res.json(matchedResults.filter(Boolean));
	} catch (error) {
		console.error('Get matches error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
