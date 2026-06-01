import type { Request, Response } from 'express';
import HouseholdMember from '../models/HouseholdMember';
import WatchedTogether from '../models/WatchedTogether';
import {
	acceptInvite,
	createForOwner,
	createInvite,
	isOwner,
	listForUser,
} from '../services/household.service';
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
		const member = await HouseholdMember.findOne({
			where: { household_id: householdId, user_id: userId },
		});
		if (!member) {
			return res.status(403).json({ error: 'not_a_member' });
		}

		const row = await WatchedTogether.create({
			household_id: householdId,
			tmdb_id: tmdbId,
			media_type: body.media_type,
			watched_at: new Date(),
			enjoyed: null,
			mood_at_pick: body.mood ?? null,
			minutes_budget_at_pick: body.minutes ?? null,
		});

		return res.status(201).json({ recorded: true, id: row.id });
	} catch (error) {
		console.error('Error committing household pick:', error);
		const message = error instanceof Error ? error.message : 'Unknown error';
		return res.status(500).json({ error: message });
	}
};

export const listHouseholds = async (req: Request, res: Response) => {
	const userId = req.user?.user_id;
	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	const households = await listForUser(userId);
	return res.json({ households });
};

export const createHousehold = async (req: Request, res: Response) => {
	const userId = req.user?.user_id;
	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	const { name } = (req.body ?? {}) as { name?: string };
	const trimmed = typeof name === 'string' ? name.trim() : '';
	if (trimmed.length > 80) {
		return res.status(400).json({ error: 'name_too_long' });
	}
	const household = await createForOwner(userId, trimmed || null);
	return res.status(201).json({ household });
};

export const postInvite = async (req: Request, res: Response) => {
	const userId = req.user?.user_id;
	const householdId = req.params.id;
	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	if (!householdId) {
		return res.status(400).json({ error: 'household_id_required' });
	}
	if (!(await isOwner(householdId, userId))) {
		return res.status(403).json({ error: 'owner_only' });
	}
	const { email } = (req.body ?? {}) as { email?: string };
	const invitedEmail =
		typeof email === 'string' && email.trim() ? email.trim() : null;
	const invite = await createInvite(householdId, userId, invitedEmail);
	return res.status(201).json({ invite });
};

export const postAcceptInvite = async (req: Request, res: Response) => {
	const userId = req.user?.user_id;
	const token = req.params.token;
	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	if (!token) {
		return res.status(400).json({ error: 'token_required' });
	}
	try {
		const result = await acceptInvite(token, userId);
		return res.status(200).json(result);
	} catch (error) {
		if (error instanceof Error && error.name === 'InviteInvalid') {
			return res.status(410).json({ error: 'invite_invalid_or_expired' });
		}
		throw error;
	}
};
