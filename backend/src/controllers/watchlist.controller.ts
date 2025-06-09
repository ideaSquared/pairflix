import type { Request, Response } from 'express';
import { activityService, ActivityType } from '../services/activity.service';
import { auditLogService } from '../services/audit.service';
import {
	addToWatchlistService,
	getMatchesService,
	getWatchlistService,
	updateWatchlistEntryService,
} from '../services/watchlist.service';

// Define interfaces for request body validation
interface WatchlistBody {
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	status:
		| 'to_watch'
		| 'watch_together_focused'
		| 'watch_together_background'
		| 'watching'
		| 'finished'
		| 'flagged'
		| 'removed'
		| 'active';
	notes?: string;
	title?: string;
	name?: string;
}

interface UpdateWatchlistBody {
	tmdb_id?: number;
	media_type?: 'movie' | 'tv';
	status?:
		| 'to_watch'
		| 'watch_together_focused'
		| 'watch_together_background'
		| 'watching'
		| 'finished'
		| 'flagged'
		| 'removed'
		| 'active';
	notes?: string;
	rating?: number;
	title?: string;
	mediaTitle?: string;
	name?: string;
}

// Type guard functions
const isValidWatchlistBody = (obj: unknown): obj is WatchlistBody => {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	const body = obj as Record<string, unknown>;

	return (
		typeof body.tmdb_id === 'number' &&
		typeof body.media_type === 'string' &&
		['movie', 'tv'].includes(body.media_type) &&
		typeof body.status === 'string' &&
		[
			'to_watch',
			'watch_together_focused',
			'watch_together_background',
			'watching',
			'finished',
			'flagged',
			'removed',
			'active',
		].includes(body.status) &&
		(body.notes === undefined || typeof body.notes === 'string') &&
		(body.title === undefined || typeof body.title === 'string') &&
		(body.name === undefined || typeof body.name === 'string')
	);
};

const isValidUpdateWatchlistBody = (
	obj: unknown
): obj is UpdateWatchlistBody => {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}

	const body = obj as Record<string, unknown>;

	return (
		(body.tmdb_id === undefined || typeof body.tmdb_id === 'number') &&
		(body.media_type === undefined ||
			(typeof body.media_type === 'string' &&
				['movie', 'tv'].includes(body.media_type))) &&
		(body.status === undefined ||
			(typeof body.status === 'string' &&
				[
					'to_watch',
					'watch_together_focused',
					'watch_together_background',
					'watching',
					'finished',
					'flagged',
					'removed',
					'active',
				].includes(body.status))) &&
		(body.notes === undefined || typeof body.notes === 'string') &&
		(body.rating === undefined || typeof body.rating === 'number') &&
		(body.title === undefined || typeof body.title === 'string') &&
		(body.mediaTitle === undefined || typeof body.mediaTitle === 'string') &&
		(body.name === undefined || typeof body.name === 'string')
	);
};

export const addToWatchlist = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		// Type validation
		const requestBody = req.body as unknown;
		if (!isValidWatchlistBody(requestBody)) {
			return res.status(400).json({ error: 'Invalid request body' });
		}

		// Audit log for watchlist addition attempt
		await auditLogService.info(
			'Watchlist addition attempt',
			'watchlist-controller',
			{
				userId: req.user.user_id,
				tmdbId: requestBody.tmdb_id,
				mediaType: requestBody.media_type,
				// Use the title from the request body, not from the entry
				title: requestBody.title ?? requestBody.name ?? 'Unknown title',
				ip: req.ip ?? 'unknown',
			}
		);

		const entry = await addToWatchlistService(req.user, requestBody);

		// Log the activity when a user adds something to their watchlist
		// This is highly relevant for a social movie app
		await activityService.logActivity(
			req.user.user_id,
			ActivityType.WATCHLIST_ADD,
			{
				tmdbId: entry.tmdb_id,
				mediaType: entry.media_type,
				// Use title from request body instead since it's not in the model
				title: requestBody.title ?? requestBody.name ?? 'Unknown title',
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
				title: requestBody.title ?? requestBody.name ?? 'Unknown title',
			}
		);

		res.status(201).json(entry);
	} catch (error) {
		const requestBody = req.body as Record<string, unknown>;

		// Audit log for watchlist addition failure
		await auditLogService.error(
			'Watchlist addition failed',
			'watchlist-controller',
			{
				userId: req.user?.user_id,
				entry: requestBody,
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

		const watchlist = await getWatchlistService(req.user);
		res.json(watchlist);
	} catch (error) {
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

		// Type validation
		const requestBody = req.body as unknown;
		if (!isValidUpdateWatchlistBody(requestBody)) {
			return res.status(400).json({ error: 'Invalid request body' });
		}

		// Audit log for watchlist update attempt
		await auditLogService.info(
			'Watchlist update attempt',
			'watchlist-controller',
			{
				userId: req.user.user_id,
				entryId,
				updates: requestBody as Record<string, unknown>,
				ip: req.ip ?? 'unknown',
			}
		);

		// Get metadata for the updated entry from the request context
		// We need to store this separately since the WatchlistEntry model doesn't have title
		const entryMetadata = {
			title: requestBody.title ?? requestBody.mediaTitle ?? 'Unknown title',
		};

		const updatedEntry = await updateWatchlistEntryService(
			entryId,
			requestBody,
			req.user
		);

		// Determine the type of update and log accordingly
		if (requestBody.rating !== undefined) {
			// Rating updates are very relevant for a social movie app
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.WATCHLIST_RATE,
				{
					tmdbId: updatedEntry.tmdb_id,
					mediaType: updatedEntry.media_type,
					title: entryMetadata.title,
					rating: requestBody.rating,
				}
			);

			// Audit log for rating update
			await auditLogService.info(
				'Watchlist rating updated',
				'watchlist-controller',
				{
					userId: req.user.user_id,
					entryId,
					tmdbId: updatedEntry.tmdb_id,
					title: entryMetadata.title,
					newRating: requestBody.rating,
				}
			);
		} else if (requestBody.status !== undefined) {
			// Status changes (watched, plan to watch, etc.) are also relevant
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.WATCHLIST_UPDATE,
				{
					tmdbId: updatedEntry.tmdb_id,
					mediaType: updatedEntry.media_type,
					title: entryMetadata.title,
					status: requestBody.status,
				}
			);

			// Audit log for status update
			await auditLogService.info(
				'Watchlist status updated',
				'watchlist-controller',
				{
					userId: req.user.user_id,
					entryId,
					tmdbId: updatedEntry.tmdb_id,
					title: entryMetadata.title,
					newStatus: requestBody.status,
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
					entryId,
					tmdbId: updatedEntry.tmdb_id,
					title: entryMetadata.title,
					updates: requestBody as Record<string, unknown>,
				}
			);
		}

		res.json(updatedEntry);
	} catch (error) {
		const requestBody = req.body as Record<string, unknown>;

		// Audit log for update failure
		await auditLogService.error(
			'Watchlist update failed',
			'watchlist-controller',
			{
				userId: req.user?.user_id,
				entryId: req.params.entry_id,
				updates: requestBody,
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

		const matches = await getMatchesService(req.user);

		// Just viewing matches isn't activity other users need to see
		// This would clutter the activity feed without providing value

		res.json(matches);
	} catch (error) {
		if (error instanceof Error) {
			res.status(500).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
