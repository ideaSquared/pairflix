import { Request, Response } from 'express';
import {
	createMatchService,
	getMatchesService,
	updateMatchStatusService,
} from '../services/match.service';

export const createMatch = async (req: Request, res: Response) => {
	try {
		const match = await createMatchService(req.user, req.body);
		res.status(201).json(match);
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

export const updateMatchStatus = async (req: Request, res: Response) => {
	try {
		const updatedMatch = await updateMatchStatusService(
			req.params.match_id,
			req.body.status,
			req.user
		);
		res.json(updatedMatch);
	} catch (error) {
		if (error instanceof Error) {
			res.status(400).json({ error: error.message });
		} else {
			res.status(500).json({ error: 'Unknown error occurred' });
		}
	}
};
