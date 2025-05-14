import { Request, Response } from 'express';
import { activityService, ActivityType } from '../services/activity.service';
import { auditLogService } from '../services/audit.service';
import {
	createMatchService,
	getMatchesService,
	updateMatchStatusService,
} from '../services/match.service';

export const createMatch = async (req: Request, res: Response) => {
	try {
		console.log('[Match Controller] Creating match:', {
			userId: req.user?.user_id,
			matchData: req.body,
		});

		// Audit log for match creation attempt
		await auditLogService.info('Match creation attempt', 'match-controller', {
			userId: req.user?.user_id,
			targetUserId: req.body.user2_id,
			ip: req.ip,
		});

		const match = await createMatchService(req.user, req.body);

		// Log match creation - this is relevant for user activity feed
		// as it shows users making connections
		if (req.user) {
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.MATCH_CREATE,
				{
					matchId: match.match_id,
					user2Id: match.user2_id,
				}
			);
		}

		// Audit log for successful match creation
		await auditLogService.info(
			'Match created successfully',
			'match-controller',
			{
				userId: req.user?.user_id,
				targetUserId: match.user2_id,
				matchId: match.match_id,
				status: match.status,
			}
		);

		res.status(201).json(match);
	} catch (error) {
		console.error('[Match Controller] Error creating match:', {
			userId: req.user?.user_id,
			matchData: req.body,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		});

		// Audit log for match creation failure
		await auditLogService.error('Match creation failed', 'match-controller', {
			userId: req.user?.user_id,
			targetUserId: req.body.user2_id,
			error: error instanceof Error ? error.message : 'Unknown error',
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
			'[Match Controller] Getting matches for user:',
			req.user?.user_id
		);
		const matches = await getMatchesService(req.user);

		// Just viewing matches isn't an activity others need to see
		// This would clutter the activity feed without providing value

		res.json(matches);
	} catch (error) {
		console.error('[Match Controller] Error getting matches:', {
			userId: req.user?.user_id,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		});
		if (error instanceof Error) {
			res.status(500).json({ error: 'Internal server error' });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};

export const updateMatchStatus = async (req: Request, res: Response) => {
	try {
		console.log('[Match Controller] Updating match status:', {
			userId: req.user?.user_id,
			matchId: req.params.match_id,
			status: req.body.status,
		});

		const matchId = req.params.match_id;
		if (!matchId) {
			return res.status(400).json({ error: 'Match ID is required' });
		}

		// Audit log for match status update attempt
		await auditLogService.info(
			'Match status update attempt',
			'match-controller',
			{
				userId: req.user?.user_id,
				matchId: matchId,
				newStatus: req.body.status,
				ip: req.ip,
			}
		);

		const updatedMatch = await updateMatchStatusService(
			matchId,
			req.body.status,
			req.user
		);

		// Match status updates are relevant for user activity feed
		if (req.user) {
			await activityService.logActivity(
				req.user.user_id,
				ActivityType.MATCH_UPDATE,
				{
					matchId: matchId,
					newStatus: req.body.status,
				}
			);
		}

		// Audit log for successful match status update
		await auditLogService.info(
			'Match status updated successfully',
			'match-controller',
			{
				userId: req.user?.user_id,
				matchId: matchId,
				// Remove reference to previousStatus which doesn't exist
				newStatus: updatedMatch.status,
			}
		);

		res.json(updatedMatch);
	} catch (error) {
		console.error('[Match Controller] Error updating match status:', {
			userId: req.user?.user_id,
			matchId: req.params.match_id,
			status: req.body.status,
			error: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : undefined,
		});

		// Audit log for match status update failure
		await auditLogService.error(
			'Match status update failed',
			'match-controller',
			{
				userId: req.user?.user_id,
				matchId: req.params.match_id,
				attemptedStatus: req.body.status,
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
