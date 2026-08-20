#!/usr/bin/env node
// Seeds paired-up households into local D1 -- unlike seed-dev-users.mjs's flat DevLogin fixtures,
// these exist so a dev can exercise household-scoped flows (pick/commit, quota, provider filters)
// without first hand-creating a household through the UI/API. Includes premium ("unlimited picks")
// households so free-tier's 3-picks/day quota doesn't get in the way of repeated manual testing.
// --local only -- never touches a real D1 database.

import { hashPassword, runD1File, sqlString } from './seed-lib.mjs';

const PASSWORD = 'password123';

// Deterministic, not random -- reruns must resolve to the same ids so `INSERT OR IGNORE` actually
// no-ops on a second run instead of leaving orphaned household_members/subscriptions rows pointed
// at a user_id nothing re-inserted.
const idFor = (prefix, slug) => `${prefix}_hhseed_${slug}`;

const HOUSEHOLDS = [
	{
		slug: 'free1',
		name: 'Free Household',
		tier: 'free',
		members: [
			{
				slug: 'free1-owner',
				email: 'hh-free1-owner@example.com',
				username: 'hhfree1owner',
			},
			{
				slug: 'free1-partner',
				email: 'hh-free1-partner@example.com',
				username: 'hhfree1partner',
			},
		],
	},
	{
		slug: 'free2',
		name: 'Popcorn Club',
		tier: 'free',
		members: [
			{
				slug: 'free2-owner',
				email: 'hh-free2-owner@example.com',
				username: 'hhfree2owner',
			},
			{
				slug: 'free2-partner',
				email: 'hh-free2-partner@example.com',
				username: 'hhfree2partner',
			},
		],
	},
	{
		slug: 'premium1',
		name: 'Unlimited Picks HQ',
		tier: 'premium',
		members: [
			{
				slug: 'premium1-owner',
				email: 'hh-premium1-owner@example.com',
				username: 'hhpremium1owner',
			},
			{
				slug: 'premium1-partner',
				email: 'hh-premium1-partner@example.com',
				username: 'hhpremium1partner',
			},
		],
	},
	{
		slug: 'premium2',
		name: 'Binge Squad',
		tier: 'premium',
		members: [
			{
				slug: 'premium2-owner',
				email: 'hh-premium2-owner@example.com',
				username: 'hhpremium2owner',
			},
			{
				slug: 'premium2-partner',
				email: 'hh-premium2-partner@example.com',
				username: 'hhpremium2partner',
			},
		],
	},
	{
		slug: 'premium3',
		name: 'Multi-Region Movie Night',
		tier: 'premium',
		members: [
			{
				slug: 'premium3-owner',
				email: 'hh-premium3-owner@example.com',
				username: 'hhpremium3owner',
			},
			{
				slug: 'premium3-partner',
				email: 'hh-premium3-partner@example.com',
				username: 'hhpremium3partner',
			},
		],
	},
];

const defaultPreferences = JSON.stringify({
	theme: 'dark',
	viewStyle: 'grid',
	emailNotifications: true,
	autoArchiveDays: 30,
	favoriteGenres: [],
});

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

const run = async () => {
	const passwordHash = await hashPassword(PASSWORD);
	const now = Date.now();
	const statements = [];

	for (const household of HOUSEHOLDS) {
		const householdId = idFor('household', household.slug);
		statements.push(
			`INSERT OR IGNORE INTO households (id, name, created_at, updated_at) VALUES (${sqlString(householdId)}, ${sqlString(household.name)}, ${now}, ${now});`
		);

		household.members.forEach((member, index) => {
			const userId = idFor('user', member.slug);
			statements.push(
				`INSERT OR IGNORE INTO users (user_id, username, email, password_hash, role, status, email_verified, preferences, created_at, updated_at) VALUES (${sqlString(userId)}, ${sqlString(member.username)}, ${sqlString(member.email)}, ${sqlString(passwordHash)}, 'user', 'active', 1, ${sqlString(defaultPreferences)}, ${now}, ${now});`
			);
			const role = index === 0 ? 'owner' : 'member';
			statements.push(
				`INSERT OR IGNORE INTO household_members (household_id, user_id, role, joined_at) VALUES (${sqlString(householdId)}, ${sqlString(userId)}, ${sqlString(role)}, ${now});`
			);
		});

		if (household.tier === 'premium') {
			const subscriptionId = idFor('subscription', household.slug);
			const currentPeriodEnd = now + THIRTY_DAYS_MS;
			statements.push(
				`INSERT OR IGNORE INTO subscriptions (id, household_id, tier, status, stripe_customer_id, stripe_subscription_id, current_period_end, created_at, updated_at) VALUES (${sqlString(subscriptionId)}, ${sqlString(householdId)}, 'premium', 'active', NULL, NULL, ${currentPeriodEnd}, ${now}, ${now});`
			);
		}
	}

	runD1File(statements, 'seed-dev-households');

	const memberCount = HOUSEHOLDS.reduce((sum, h) => sum + h.members.length, 0);
	console.log(
		`\nSeeded ${HOUSEHOLDS.length} households (${memberCount} users, password: ${PASSWORD}):`
	);
	for (const household of HOUSEHOLDS) {
		const owner = household.members[0];
		console.log(
			`  - ${household.name} [${household.tier}] -- log in as ${owner.email}`
		);
	}
};

run();
