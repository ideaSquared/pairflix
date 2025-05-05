import { Request, Response } from 'express';
import {
	addToWatchlistService,
	getMatchesService,
	getWatchlistService,
	updateWatchlistEntryService,
} from '../services/watchlist.service';

export const addToWatchlist = async (req: Request, res: Response) => {
	try {
		const entry = await addToWatchlistService(req.user, req.body);
		res.status(201).json(entry);
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const getWatchlist = async (req: Request, res: Response) => {
	try {
		const watchlist = await getWatchlistService(req.user);
		res.json(watchlist);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ error: 'Internal server error' });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updateWatchlistEntry = async (req: Request, res: Response) => {
	try {
		const updatedEntry = await updateWatchlistEntryService(
			req.params.entry_id,
			req.body,
			req.user
		);
		res.json(updatedEntry);
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const getMatches = async (req: Request, res: Response) => {
	try {
		const matches = await getMatchesService(req.user);
		res.json(matches);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ error: 'Internal server error' });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
