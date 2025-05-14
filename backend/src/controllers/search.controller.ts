import { Request, Response } from 'express';
import { searchMediaService } from '../services/search.service';

export const searchTMDb = async (req: Request, res: Response) => {
	const { query } = req.query;
	if (!query || typeof query !== 'string') {
		console.log('[Search Controller] Invalid query parameter:', { query });
		return res.status(400).json({ error: 'Query parameter is required' });
	}
	try {
		console.log('[Search Controller] Searching media:', { query });
		const tmdbResponse = await searchMediaService(query);

		// Search activity isn't typically interesting for other users to see
		// in an activity feed - it clutters the feed without providing value
		// Consider logging only searches that lead to watchlist additions
		// if (req.user) {
		//   await activityService.logActivity(
		//     req.user.user_id,
		//     ActivityType.MEDIA_SEARCH,
		//     {
		//       searchQuery: query,
		//       resultCount: tmdbResponse.results?.length || 0,
		//       timestamp: new Date(),
		//     }
		//   );
		// }

		res.json(tmdbResponse);
	} catch (error) {
		console.error('[Search Controller] Error searching media:', {
			query,
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
