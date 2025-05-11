import { Request, Response } from 'express';
import { activityService, ActivityType } from '../services/activity.service';
import {
	addToWatchlistService,
	getMatchesService,
	getWatchlistService,
	updateWatchlistEntryService,
} from '../services/watchlist.service';

export const addToWatchlist = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		console.log('[Watchlist Controller] Adding to watchlist:', {
			userId: req.user.user_id,
			entry: req.body,
		});
		const entry = await addToWatchlistService(req.user, req.body);

		// Log the activity when a user adds something to their watchlist
		await activityService.logActivity(
			req.user.user_id,
			ActivityType.WATCHLIST_ADD,
			{
				tmdbId: entry.tmdb_id,
				mediaType: entry.media_type,
				status: entry.status,
			}
		);

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
	// No activity logging needed for read operations
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		console.log(
			'[Watchlist Controller] Getting watchlist for user:',
			req.user.user_id
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
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const entryId = req.params.entry_id;
		if (!entryId) {
			return res.status(400).json({ error: 'Entry ID is required' });
		}

		console.log('[Watchlist Controller] Updating watchlist entry:', {
			userId: req.user.user_id,
			entryId: entryId,
			updates: req.body,
		});
		const updatedEntry = await updateWatchlistEntryService(
			entryId,
			req.body,
			req.user
		);

		// Determine the type of update and log accordingly
		if (req.body.rating !== undefined) {
			// If rating was updated
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.WATCHLIST_RATE,
				{
					tmdbId: updatedEntry.tmdb_id,
					mediaType: updatedEntry.media_type,
					rating: req.body.rating,
				}
			);
		} else if (req.body.status !== undefined) {
			// If status was changed
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.WATCHLIST_UPDATE,
				{
					tmdbId: updatedEntry.tmdb_id,
					mediaType: updatedEntry.media_type,
					status: req.body.status,
				}
			);
		} else {
			// For any other type of update
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.WATCHLIST_UPDATE,
				{
					tmdbId: updatedEntry.tmdb_id,
					mediaType: updatedEntry.media_type,
				}
			);
		}

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
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		console.log(
			'[Watchlist Controller] Getting matches for user:',
			req.user.user_id
		);
		const matches = await getMatchesService(req.user);

		// Log when a user views matches
		await activityService.logActivity(
			req.user.user_id,
			ActivityType.MATCH_VIEW,
			{
				timestamp: new Date(),
				matchCount: matches.length,
			}
		);

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
