import { Request, Response } from 'express';
import { activityService, ActivityType } from '../services/activity.service';
import { auditLogService } from '../services/audit.service';
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

		// Audit log for watchlist addition attempt
		await auditLogService.info(
			'Watchlist addition attempt',
			'watchlist-controller',
			{
				userId: req.user.user_id,
				tmdbId: req.body.tmdb_id,
				mediaType: req.body.media_type,
				// Use the title from the request body, not from the entry
				title: req.body.title || req.body.name || 'Unknown title',
				ip: req.ip,
			}
		);

		const entry = await addToWatchlistService(req.user, req.body);

		// Log the activity when a user adds something to their watchlist
		// This is highly relevant for a social movie app
		await activityService.logActivity(
			req.user.user_id,
			ActivityType.WATCHLIST_ADD,
			{
				tmdbId: entry.tmdb_id,
				mediaType: entry.media_type,
				// Use title from request body instead since it's not in the model
				title: req.body.title || req.body.name || 'Unknown title',
				status: entry.status,
			}
		);

		// Audit log for successful watchlist addition
		await auditLogService.info(
			'Watchlist addition successful',
			'watchlist-controller',
			{
				userId: req.user.user_id,
				entryId: entry.entry_id,
				tmdbId: entry.tmdb_id,
				mediaType: entry.media_type,
				// Use title from request body
				title: req.body.title || req.body.name || 'Unknown title',
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

		// Audit log for watchlist addition failure
		await auditLogService.error(
			'Watchlist addition failed',
			'watchlist-controller',
			{
				userId: req.user?.user_id,
				entry: req.body,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

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

		// Audit log for watchlist update attempt
		await auditLogService.info(
			'Watchlist update attempt',
			'watchlist-controller',
			{
				userId: req.user.user_id,
				entryId: entryId,
				updates: req.body,
				ip: req.ip,
			}
		);

		// Get metadata for the updated entry from the request context
		// We need to store this separately since the WatchlistEntry model doesn't have title
		const entryMetadata = {
			title: req.body.title || req.body.mediaTitle || 'Unknown title',
		};

		const updatedEntry = await updateWatchlistEntryService(
			entryId,
			req.body,
			req.user
		);

		// Determine the type of update and log accordingly
		if (req.body.rating !== undefined) {
			// Rating updates are very relevant for a social movie app
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.WATCHLIST_RATE,
				{
					tmdbId: updatedEntry.tmdb_id,
					mediaType: updatedEntry.media_type,
					title: entryMetadata.title,
					rating: req.body.rating,
				}
			);

			// Audit log for rating update
			await auditLogService.info(
				'Watchlist rating updated',
				'watchlist-controller',
				{
					userId: req.user.user_id,
					entryId: entryId,
					tmdbId: updatedEntry.tmdb_id,
					title: entryMetadata.title,
					newRating: req.body.rating,
				}
			);
		} else if (req.body.status !== undefined) {
			// Status changes (watched, plan to watch, etc.) are also relevant
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.WATCHLIST_UPDATE,
				{
					tmdbId: updatedEntry.tmdb_id,
					mediaType: updatedEntry.media_type,
					title: entryMetadata.title,
					status: req.body.status,
				}
			);

			// Audit log for status update
			await auditLogService.info(
				'Watchlist status updated',
				'watchlist-controller',
				{
					userId: req.user.user_id,
					entryId: entryId,
					tmdbId: updatedEntry.tmdb_id,
					title: entryMetadata.title,
					newStatus: req.body.status,
				}
			);
		} else {
			// Other updates are less important, but still log with minimal info
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.WATCHLIST_UPDATE,
				{
					tmdbId: updatedEntry.tmdb_id,
					mediaType: updatedEntry.media_type,
					title: entryMetadata.title,
				}
			);

			// Audit log for general update
			await auditLogService.info(
				'Watchlist entry updated',
				'watchlist-controller',
				{
					userId: req.user.user_id,
					entryId: entryId,
					tmdbId: updatedEntry.tmdb_id,
					title: entryMetadata.title,
					updates: req.body,
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

		// Audit log for update failure
		await auditLogService.error(
			'Watchlist update failed',
			'watchlist-controller',
			{
				userId: req.user?.user_id,
				entryId: req.params.entry_id,
				updates: req.body,
				error: error instanceof Error ? error.message : 'Unknown error',
			}
		);

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

		// Just viewing matches isn't activity other users need to see
		// This would clutter the activity feed without providing value

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
