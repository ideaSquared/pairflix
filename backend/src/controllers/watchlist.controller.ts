import { Response } from 'express';
import { Op } from 'sequelize';
import WatchlistEntry from '../models/WatchlistEntry';
import { AuthenticatedRequest } from '../types';

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

		res.json(entries);
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
		res.json(entry);
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

		const matchedResults = userEntries
			.map((userEntry) => {
				const matchEntry = matches.find(
					(m) => m.tmdb_id === userEntry.tmdb_id
				);
				return matchEntry
					? {
							tmdb_id: userEntry.tmdb_id,
							media_type: userEntry.media_type,
							user1_status: userEntry.status,
							user2_status: matchEntry.status,
					  }
					: null;
			})
			.filter(Boolean);

		res.json(matchedResults);
	} catch (error) {
		console.error('Get matches error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
