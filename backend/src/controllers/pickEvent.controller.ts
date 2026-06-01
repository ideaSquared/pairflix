import type { Request, Response } from 'express';
import HouseholdMember from '../models/HouseholdMember';
import type { PickEventKind } from '../models/PickEvent';
import {
	getPickEventStats,
	recordPickEvent,
} from '../services/pickEvent.service';
import {
	ProviderNotAvailableError,
	resolveProviderLaunch,
} from '../services/providerLaunch.service';

const VALID_KINDS: PickEventKind[] = [
	'proposed',
	'accepted',
	'swapped',
	'dismissed',
	'provider_launched',
];

const VALID_MEDIA_TYPES = ['movie', 'tv'] as const;

interface PickEventBody {
	tmdb_id: number;
	media_type: 'movie' | 'tv';
	kind: PickEventKind;
	mood?: string;
	minutes_budget?: number;
	provider_slug?: string;
	region?: string;
}

interface LaunchBody {
	provider_slug: string;
	media_type: 'movie' | 'tv';
	region?: string;
	mood?: string;
	minutes_budget?: number;
}

const requireMembership = async (
	householdId: string,
	userId: string
): Promise<boolean> => {
	const m = await HouseholdMember.findOne({
		where: { household_id: householdId, user_id: userId },
	});
	return m !== null;
};

export const postPickEvent = async (req: Request, res: Response) => {
	const householdId = req.params.id;
	const userId = req.user?.user_id;

	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	if (!householdId) {
		return res.status(400).json({ error: 'household_id_required' });
	}
	if (!(await requireMembership(householdId, userId))) {
		return res.status(403).json({ error: 'not_a_member' });
	}

	const body = req.body as PickEventBody;
	if (typeof body?.tmdb_id !== 'number' || Number.isNaN(body.tmdb_id)) {
		return res.status(400).json({ error: 'tmdb_id_required' });
	}
	if (!VALID_MEDIA_TYPES.includes(body.media_type)) {
		return res.status(400).json({ error: 'invalid_media_type' });
	}
	if (!VALID_KINDS.includes(body.kind)) {
		return res.status(400).json({ error: 'invalid_kind' });
	}
	if (body.region !== undefined && !/^[A-Z]{2}$/.test(body.region)) {
		return res.status(400).json({ error: 'invalid_region' });
	}

	const event = await recordPickEvent({
		household_id: householdId,
		user_id: userId,
		tmdb_id: body.tmdb_id,
		media_type: body.media_type,
		kind: body.kind,
		mood: body.mood ?? null,
		minutes_budget: body.minutes_budget ?? null,
		provider_slug: body.provider_slug ?? null,
		region: body.region ?? null,
	});

	return res.status(201).json({ id: event.id });
};

export const getPickEventStatsController = async (
	req: Request,
	res: Response
) => {
	const householdId = req.params.id;
	const userId = req.user?.user_id;

	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	if (!householdId) {
		return res.status(400).json({ error: 'household_id_required' });
	}
	if (!(await requireMembership(householdId, userId))) {
		return res.status(403).json({ error: 'not_a_member' });
	}

	const windowParam = req.query.window_days;
	let windowDays = 30;
	if (typeof windowParam === 'string') {
		const parsed = Number.parseInt(windowParam, 10);
		if (!Number.isNaN(parsed) && parsed > 0) {
			windowDays = Math.min(parsed, 365);
		}
	}

	const stats = await getPickEventStats(householdId, windowDays);
	return res.json(stats);
};

export const postProviderLaunch = async (req: Request, res: Response) => {
	const householdId = req.params.id;
	const tmdbIdParam = req.params.tmdbId;
	const userId = req.user?.user_id;

	if (!userId) {
		return res.status(401).json({ error: 'Authentication required' });
	}
	if (!householdId || !tmdbIdParam) {
		return res.status(400).json({ error: 'invalid_path_parameters' });
	}

	const tmdbId = Number.parseInt(tmdbIdParam, 10);
	if (Number.isNaN(tmdbId)) {
		return res.status(400).json({ error: 'invalid_tmdb_id' });
	}
	if (!(await requireMembership(householdId, userId))) {
		return res.status(403).json({ error: 'not_a_member' });
	}

	const body = req.body as LaunchBody;
	if (typeof body?.provider_slug !== 'string' || !body.provider_slug.trim()) {
		return res.status(400).json({ error: 'provider_slug_required' });
	}
	if (!VALID_MEDIA_TYPES.includes(body.media_type)) {
		return res.status(400).json({ error: 'invalid_media_type' });
	}
	const region =
		typeof body.region === 'string' && body.region ? body.region : 'GB';
	if (!/^[A-Z]{2}$/.test(region)) {
		return res.status(400).json({ error: 'invalid_region' });
	}

	try {
		const resolved = await resolveProviderLaunch({
			tmdb_id: tmdbId,
			media_type: body.media_type,
			provider_slug: body.provider_slug,
			region,
		});

		await recordPickEvent({
			household_id: householdId,
			user_id: userId,
			tmdb_id: tmdbId,
			media_type: body.media_type,
			kind: 'provider_launched',
			mood: body.mood ?? null,
			minutes_budget: body.minutes_budget ?? null,
			provider_slug: body.provider_slug,
			region,
		});

		return res.json(resolved);
	} catch (error) {
		if (error instanceof ProviderNotAvailableError) {
			return res.status(404).json({ error: 'provider_not_available' });
		}
		throw error;
	}
};
