import { Request, Response } from 'express';
import {
	addToWatchlistService,
	getMatchesService,
	getWatchlistService,
	updateWatchlistEntryService,
} from '../services/watchlist.service';

export const addToWatchlist = async (req: Request, res: Response) => {
	try {
		console.log('[Watchlist Controller] Adding to watchlist:', {
			userId: req.user?.user_id,
			entry: req.body,
		});
		const entry = await addToWatchlistService(req.user, req.body);
		res.status(201).json(entry);
	} catch (error) {
		console.error('[Watchlist Controller] Error adding to watchlist:', {
			userId: req.user?.user_id,
			entry: req.body,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		});
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const getWatchlist = async (req: Request, res: Response) => {
	try {
		console.log(
			'[Watchlist Controller] Getting watchlist for user:',
			req.user?.user_id
		);
		const watchlist = await getWatchlistService(req.user);
		res.json(watchlist);
	} catch (error) {
		console.error('[Watchlist Controller] Error getting watchlist:', {
			userId: req.user?.user_id,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		});
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updateWatchlistEntry = async (req: Request, res: Response) => {
	try {
		console.log('[Watchlist Controller] Updating watchlist entry:', {
			userId: req.user?.user_id,
			entryId: req.params.entry_id,
			updates: req.body,
		});
		const updatedEntry = await updateWatchlistEntryService(
			req.params.entry_id,
			req.body,
			req.user
		);
		res.json(updatedEntry);
	} catch (error) {
		console.error('[Watchlist Controller] Error updating watchlist entry:', {
			userId: req.user?.user_id,
			entryId: req.params.entry_id,
			updates: req.body,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		});
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const getMatches = async (req: Request, res: Response) => {
	try {
		console.log(
			'[Watchlist Controller] Getting matches for user:',
			req.user?.user_id
		);
		const matches = await getMatchesService(req.user);
		res.json(matches);
	} catch (error) {
		console.error('[Watchlist Controller] Error getting matches:', {
			userId: req.user?.user_id,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		});
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
