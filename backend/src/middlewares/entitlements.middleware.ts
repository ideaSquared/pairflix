import type { NextFunction, Request, Response } from 'express';
import HouseholdMember from '../models/HouseholdMember';
import { getEntitlements, recordPick } from '../services/entitlements.service';

async function isHouseholdMember(
	householdId: string,
	userId: string
): Promise<boolean> {
	const membership = await HouseholdMember.findOne({
		where: { household_id: householdId, user_id: userId },
	});
	return membership !== null;
}

/**
 * Enforce daily pick quota for the household identified by req.params.id.
 *
 * Apply to: POST /api/households/:id/pick (Phase B).
 *
 * On success (controller responds 2xx) inserts a PickUsage row via a
 * res.on('finish') hook, leaving Phase B's controller untouched.
 */
export async function enforcePickQuota(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const householdId = req.params.id;
		if (!householdId) {
			res.status(400).json({ error: 'household_id_required' });
			return;
		}

		if (!req.user) {
			res.status(401).json({ error: 'Authentication required' });
			return;
		}

		const isMember = await isHouseholdMember(householdId, req.user.user_id);
		if (!isMember) {
			res.status(403).json({ error: 'not_a_household_member' });
			return;
		}

		const entitlements = await getEntitlements(householdId);

		if (entitlements.picks_remaining <= 0) {
			res.status(402).json({
				error: 'pick_quota_exceeded',
				upgrade_url: '/upgrade',
				entitlements,
			});
			return;
		}

		res.on('finish', () => {
			if (res.statusCode < 300) {
				void recordPick(householdId).catch(err => {
					console.error('Failed to record pick usage:', err);
				});
			}
		});

		next();
	} catch (error) {
		next(error);
	}
}

/**
 * For free-tier households, silently force the request body's region to the
 * tier's region_lock. Premium households pass through unchanged.
 *
 * Apply to: POST /api/households/:id/pick.
 */
export async function enforceRegionLock(
	req: Request,
	res: Response,
	next: NextFunction
): Promise<void> {
	try {
		const householdId = req.params.id;
		if (!householdId) {
			next();
			return;
		}

		const entitlements = await getEntitlements(householdId);

		if (entitlements.region_lock !== null) {
			const body = (req.body ?? {}) as Record<string, unknown>;
			body.region = entitlements.region_lock;
			req.body = body;
		}

		next();
	} catch (error) {
		next(error);
	}
}
