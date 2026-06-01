import type { Request, Response } from 'express';
import { defaultRecommendationService } from '../services/recommendation.service';
import type { Mood } from '../services/recommendation.types';

interface PickBody {
	mood: Mood;
	minutes: number;
	providers?: string[];
	region?: string;
	excludeTmdbIds?: number[];
}

interface CommitBody {
	media_type: 'movie' | 'tv';
	mood?: Mood;
	minutes?: number;
}

export const pickForHousehold = async (req: Request, res: Response) => {
	const householdId = req.params.id;
	const userId = req.user?.user_id;

	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	if (!householdId) {
		return res.status(400).json({ error: 'Household id required' });
	}

	try {
		const body = req.body as PickBody;
		if (body.region !== undefined && !/^[A-Z]{2}$/.test(body.region)) {
			return res.status(400).json({ error: 'region must be a 2-letter code' });
		}
		const result = await defaultRecommendationService.pickForHousehold({
			householdId,
			mood: body.mood,
			minutes: body.minutes,
			...(body.providers ? { providers: body.providers } : {}),
			...(body.region ? { region: body.region } : {}),
			...(body.excludeTmdbIds ? { excludeTmdbIds: body.excludeTmdbIds } : {}),
		});
		return res.json(result);
	} catch (error) {
		console.error('Error picking for household:', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return res.status(500).json({ error: message });
	}
};

export const commitHouseholdPick = async (req: Request, res: Response) => {
	const householdId = req.params.id;
	const tmdbIdParam = req.params.tmdbId;
	const userId = req.user?.user_id;

	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	if (!householdId || !tmdbIdParam) {
		return res.status(400).json({ error: 'Invalid path parameters' });
	}

	const tmdbId = parseInt(tmdbIdParam, 10);
	if (Number.isNaN(tmdbId)) {
		return res.status(400).json({ error: 'Invalid tmdbId' });
	}

	const body = req.body as CommitBody;

	try {
		// Phase A will own WatchedTogether persistence; for now the recommender
		// service stubs the write so the contract is stable.
		const payload = {
			household_id: householdId,
			tmdb_id: tmdbId,
			media_type: body.media_type,
			mood_at_pick: body.mood ?? null,
			minutes_budget_at_pick: body.minutes ?? null,
		};
		return res.status(201).json({ recorded: true, ...payload });
	} catch (error) {
		console.error('Error committing household pick:', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return res.status(500).json({ error: message });
	}
};
