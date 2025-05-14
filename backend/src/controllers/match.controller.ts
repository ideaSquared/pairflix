import { Request, Response } from 'express';
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
		const match = await createMatchService(req.user, req.body);
		res.status(201).json(match);
	} catch (error) {
		console.error('[Match Controller] Error creating match:', {
			userId: req.user?.user_id,
			matchData: req.body,
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
			'[Match Controller] Getting matches for user:',
			req.user?.user_id
		);
		const matches = await getMatchesService(req.user);
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
		
		const updatedMatch = await updateMatchStatusService(
			matchId,
			req.body.status,
			req.user
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
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
