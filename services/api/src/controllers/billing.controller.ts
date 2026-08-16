import type { Request, Response } from 'express';
import Household from '../models/Household';
import HouseholdMember from '../models/HouseholdMember';
import {
	cancelSubscription,
	handleStripeWebhook,
	isBillingMockEnabled,
	mockActivatePremium,
	startCheckoutSession,
} from '../services/billing.service';
import { getEntitlements } from '../services/entitlements.service';

async function requireMember(
	householdId: string,
	userId: string | undefined
): Promise<boolean> {
	if (!userId) return false;
	const m = await HouseholdMember.findOne({
		where: { household_id: householdId, user_id: userId },
	});
	return m !== null;
}

async function requireOwner(
	householdId: string,
	userId: string | undefined
): Promise<boolean> {
	if (!userId) return false;
	const m = await HouseholdMember.findOne({
		where: { household_id: householdId, user_id: userId, role: 'owner' },
	});
	return m !== null;
}

export async function postCheckout(req: Request, res: Response): Promise<void> {
	const { household_id, tier } = (req.body ?? {}) as {
		household_id?: string;
		tier?: 'premium';
	};
	if (!household_id) {
		res.status(400).json({ error: 'household_id_required' });
		return;
	}
	if (!(await requireOwner(household_id, req.user?.user_id))) {
		res.status(403).json({ error: 'owner_only' });
		return;
	}
	const session = await startCheckoutSession(household_id, tier ?? 'premium');
	res.status(200).json(session);
}

export async function postWebhook(req: Request, res: Response): Promise<void> {
	await handleStripeWebhook(req, res);
}

export async function postCancel(req: Request, res: Response): Promise<void> {
	const { household_id } = (req.body ?? {}) as { household_id?: string };
	if (!household_id) {
		res.status(400).json({ error: 'household_id_required' });
		return;
	}
	const household = await Household.findByPk(household_id);
	if (!household) {
		res.status(404).json({ error: 'household_not_found' });
		return;
	}
	if (!(await requireOwner(household_id, req.user?.user_id))) {
		res.status(403).json({ error: 'owner_only' });
		return;
	}
	await cancelSubscription(household_id);
	res.status(204).end();
}

export async function postMockActivate(
	req: Request,
	res: Response
): Promise<void> {
	if (!isBillingMockEnabled()) {
		res.status(404).json({ error: 'not_found' });
		return;
	}
	const { household_id } = (req.body ?? {}) as { household_id?: string };
	if (!household_id) {
		res.status(400).json({ error: 'household_id_required' });
		return;
	}
	if (!(await requireOwner(household_id, req.user?.user_id))) {
		res.status(403).json({ error: 'owner_only' });
		return;
	}
	await mockActivatePremium(household_id);
	res.status(200).json({ ok: true });
}

export async function getHouseholdEntitlements(
	req: Request,
	res: Response
): Promise<void> {
	const householdId =
		typeof req.params.id === 'string' ? req.params.id : undefined;
	if (!householdId) {
		res.status(400).json({ error: 'household_id_required' });
		return;
	}
	if (!(await requireMember(householdId, req.user?.user_id))) {
		res.status(403).json({ error: 'not_a_member' });
		return;
	}
	const entitlements = await getEntitlements(householdId);
	res.status(200).json(entitlements);
}
