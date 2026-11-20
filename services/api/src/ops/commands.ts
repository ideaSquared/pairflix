import {
	createDb,
	householdMembers,
	households,
	subscriptions,
	type Database,
} from '@pairflix/db';
import {
	OpsError,
	type Args,
	type Field,
	type OpsCommand,
	type OpsOutput,
} from '@ideasquared/ops';
import { eq } from 'drizzle-orm';
import { getDashboardStats } from '../lib/adminDashboard';
import { getEntitlements } from '../lib/entitlements';
import { getPickEventStats } from '../lib/pickEventStats';
import type { Bindings } from '../types';

/** What the commands need of the request: the Worker bindings. */
export type OpsDeps = {
	env: Bindings;
};

const DEFAULT_WINDOW_DAYS = 30;
const MAX_WINDOW_DAYS = 365;

const invalid = (message: string): never => {
	throw new OpsError('invalid_argument', message);
};

const stringArg = (args: Args, name: string): string | undefined => {
	const value = args[name];
	return typeof value === 'string' ? value : undefined;
};

const requiredString = (args: Args, name: string): string =>
	stringArg(args, name) ?? invalid(`field '${name}' is required`);

const numberArg = (args: Args, name: string): number | undefined => {
	const value = args[name];
	return typeof value === 'number' ? value : undefined;
};

const integerArg = (
	args: Args,
	name: string,
	min: number,
	max: number,
	fallback: number
): number => {
	const value = numberArg(args, name) ?? fallback;
	return Number.isInteger(value) && value >= min && value <= max
		? value
		: invalid(`field '${name}' must be a whole number from ${min} to ${max}`);
};

const householdIdField: Field = {
	name: 'householdId',
	type: 'id',
	required: true,
	positional: true,
	description: 'The household id',
};

/** The household's id, or `not_found`. Its `name` is never read: people name households after
 * themselves. */
const requireHousehold = async (db: Database, args: Args): Promise<string> => {
	const householdId = requiredString(args, 'householdId').trim();
	if (householdId === '') invalid("field 'householdId' must not be empty");
	const row = await db
		.select({ id: households.id })
		.from(households)
		.where(eq(households.id, householdId))
		.get();
	if (!row) throw new OpsError('not_found', 'household not found');
	return row.id;
};

export const createOpsCommands = ({ env }: OpsDeps): OpsCommand[] => {
	const db = createDb(env.DB);

	const statsOverview: OpsCommand = {
		id: 'stats.overview',
		group: 'stats',
		name: 'overview',
		summary:
			'Platform-wide counts: users, active users, households, premium households, recent errors',
		kind: 'read',
		dryRun: false,
		fields: [],
		run: async (): Promise<OpsOutput> => {
			const stats = await getDashboardStats(db);
			return {
				result: stats,
				summary: `${stats.totalUsers} users, ${stats.totalHouseholds} households (${stats.premiumHouseholds} premium)`,
			};
		},
	};

	const householdShow: OpsCommand = {
		id: 'household.show',
		group: 'household',
		name: 'show',
		summary:
			'Show a household: member and owner ids, subscription state and today’s entitlements (no names)',
		kind: 'read',
		dryRun: false,
		fields: [householdIdField],
		run: async args => {
			const householdId = await requireHousehold(db, args);
			const [household, members, subscription, entitlements] =
				await Promise.all([
					db
						.select({ createdAt: households.createdAt })
						.from(households)
						.where(eq(households.id, householdId))
						.get(),
					db
						.select({
							userId: householdMembers.userId,
							role: householdMembers.role,
						})
						.from(householdMembers)
						.where(eq(householdMembers.householdId, householdId))
						.orderBy(householdMembers.joinedAt)
						.all(),
					db
						.select({
							tier: subscriptions.tier,
							status: subscriptions.status,
							currentPeriodEnd: subscriptions.currentPeriodEnd,
							stripeCustomerId: subscriptions.stripeCustomerId,
						})
						.from(subscriptions)
						.where(eq(subscriptions.householdId, householdId))
						.get(),
					getEntitlements(db, householdId),
				]);
			return {
				result: {
					householdId,
					createdAt: household?.createdAt.toISOString() ?? null,
					memberCount: members.length,
					ownerUserIds: members
						.filter(member => member.role === 'owner')
						.map(member => member.userId),
					memberUserIds: members
						.filter(member => member.role === 'member')
						.map(member => member.userId),
					subscription: subscription
						? {
								tier: subscription.tier,
								status: subscription.status,
								currentPeriodEnd:
									subscription.currentPeriodEnd?.toISOString() ?? null,
								hasStripeCustomer: subscription.stripeCustomerId !== null,
							}
						: null,
					entitlements,
				},
				summary: `${members.length} member${members.length === 1 ? '' : 's'}, ${entitlements.tier}`,
			};
		},
	};

	const householdPickStats: OpsCommand = {
		id: 'household.pick-stats',
		group: 'household',
		name: 'pick-stats',
		summary:
			'Pick event totals, first-pick acceptance rate and provider clicks for a household',
		kind: 'read',
		dryRun: false,
		fields: [
			householdIdField,
			{
				name: 'windowDays',
				type: 'number',
				required: false,
				description: `Days to look back, 1-${MAX_WINDOW_DAYS} (default ${DEFAULT_WINDOW_DAYS})`,
			},
		],
		run: async args => {
			const windowDays = integerArg(
				args,
				'windowDays',
				1,
				MAX_WINDOW_DAYS,
				DEFAULT_WINDOW_DAYS
			);
			const householdId = await requireHousehold(db, args);
			const stats = await getPickEventStats(db, householdId, windowDays);
			const rate = stats.firstPickAcceptanceRate;
			return {
				result: { householdId, ...stats },
				summary: `${stats.totals.proposed} proposed in ${windowDays} days, acceptance ${rate === null ? 'n/a' : `${Math.round(rate * 100)}%`}`,
			};
		},
	};

	return [statsOverview, householdShow, householdPickStats];
};
