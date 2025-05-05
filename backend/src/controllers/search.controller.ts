import { Response } from 'express';
import { searchMedia } from '../services/tmdb.service';
import { AuthenticatedRequest } from '../types';

export const searchTMDb = async (req: AuthenticatedRequest, res: Response) => {
	const { query } = req.query;

	if (!query || typeof query !== 'string') {
		return res.status(400).json({ error: 'Query parameter is required' });
	}

	try {
		const results = await searchMedia(query);
		res.json(results.results || []);
	} catch (error) {
		console.error('Search error:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
};
