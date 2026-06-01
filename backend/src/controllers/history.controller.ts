import type { Request, Response } from 'express';
import {
	getHouseholdHistory,
	getHouseholdMemberUserIds,
	isHouseholdMember,
	setEnjoyed,
} from '../services/history.service';
import { recomputeForUser } from '../services/tasteProfile.service';

const parseLimit = (raw: unknown): number => {
	if (typeof raw !== 'string') {
		return 50;
	}
	const parsed = Number.parseInt(raw, 10);
	if (Number.isNaN(parsed) || parsed <= 0) {
		return 50;
	}
	return Math.min(parsed, 200);
};

export const getHistory = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const householdId = req.params.id;
		if (!householdId) {
			return res.status(400).json({ error: 'Household ID is required' });
		}

		const isMember = await isHouseholdMember(req.user.user_id, householdId);
		if (!isMember) {
			return res.status(403).json({ error: 'Not a member of this household' });
		}

		const limit = parseLimit(req.query.limit);
		const history = await getHouseholdHistory(householdId, limit);
		return res.json({ history });
	} catch (error) {
		if (error instanceof Error) {
			return res.status(500).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Unknown error occurred' });
	}
};

interface PatchHistoryBody {
	enjoyed: boolean;
}

const isValidPatchBody = (obj: unknown): obj is PatchHistoryBody => {
	if (typeof obj !== 'object' || obj === null) {
		return false;
	}
	const body = obj as Record<string, unknown>;
	return typeof body.enjoyed === 'boolean';
};

export const patchHistoryEntry = async (req: Request, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Authentication required' });
		}

		const householdId = req.params.id;
		const watchedId = req.params.watchedId;
		if (!householdId || !watchedId) {
			return res
				.status(400)
				.json({ error: 'Household ID and watched ID are required' });
		}

		const isMember = await isHouseholdMember(req.user.user_id, householdId);
		if (!isMember) {
			return res.status(403).json({ error: 'Not a member of this household' });
		}

		const body = req.body as unknown;
		if (!isValidPatchBody(body)) {
			return res
				.status(400)
				.json({ error: 'Invalid request body: enjoyed must be a boolean' });
		}

		const updated = await setEnjoyed(watchedId, householdId, body.enjoyed);
		if (!updated) {
			return res.status(404).json({ error: 'History entry not found' });
		}

		// Fire-and-forget: recompute taste profiles for every household member
		// using the new gold-signal thumbs rating.
		// TODO: trigger recompute on merge
		void (async () => {
			try {
				const userIds = await getHouseholdMemberUserIds(householdId);
				await Promise.all(userIds.map(id => recomputeForUser(id)));
			} catch (err) {
				console.warn('Failed to trigger taste profile recompute', err);
			}
		})();

		return res.json({ entry: updated });
	} catch (error) {
		if (error instanceof Error) {
			return res.status(500).json({ error: error.message });
		}
		return res.status(500).json({ error: 'Unknown error occurred' });
	}
};
