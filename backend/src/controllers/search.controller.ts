import { Request, Response } from 'express';
import { searchMediaService } from '../services/search.service';

export const searchTMDb = async (req: Request, res: Response) => {
	const { query } = req.query;
	if (!query || typeof query !== 'string') {
		return res.status(400).json({ error: 'Query parameter is required' });
	}
	try {
		const results = await searchMediaService(query);
		res.json(results);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ error: 'Internal server error' });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
