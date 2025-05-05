import { Request, Response } from 'express';
import { query } from '../db/connection';

export const addToWatchlist = async (req: Request, res: Response) => {
	const { tmdb_id, media_type, status, notes } = req.body;
	const user_id = req.user?.user_id;

	try {
		const result = await query(
			`INSERT INTO watchlist_entries 
       (user_id, tmdb_id, media_type, status, notes) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
			[user_id, tmdb_id, media_type, status, notes]
		);

		res.status(201).json(result.rows[0]);
	} catch (error) {
		console.error('Add to watchlist error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getWatchlist = async (req: Request, res: Response) => {
	const user_id = req.user?.user_id;

	try {
		const result = await query(
			'SELECT * FROM watchlist_entries WHERE user_id = $1 ORDER BY created_at DESC',
			[user_id]
		);

		res.json(result.rows);
	} catch (error) {
		console.error('Get watchlist error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const updateWatchlistEntry = async (req: Request, res: Response) => {
	const { entry_id } = req.params;
	const { status, rating, notes } = req.body;
	const user_id = req.user?.user_id;

	try {
		const result = await query(
			`UPDATE watchlist_entries 
       SET status = COALESCE($1, status),
           rating = COALESCE($2, rating),
           notes = COALESCE($3, notes),
           updated_at = NOW()
       WHERE entry_id = $4 AND user_id = $5
       RETURNING *`,
			[status, rating, notes, entry_id, user_id]
		);

		if (result.rows.length === 0) {
			return res.status(404).json({ error: 'Entry not found' });
		}

		res.json(result.rows[0]);
	} catch (error) {
		console.error('Update watchlist entry error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};

export const getMatches = async (req: Request, res: Response) => {
	const user_id = req.user?.user_id;

	try {
		const result = await query(
			`SELECT w1.tmdb_id, w1.media_type, w1.status as user1_status, w2.status as user2_status
       FROM watchlist_entries w1
       JOIN watchlist_entries w2 ON w1.tmdb_id = w2.tmdb_id
       WHERE w1.user_id = $1 AND w2.user_id != $1`,
			[user_id]
		);

		res.json(result.rows);
	} catch (error) {
		console.error('Get matches error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
