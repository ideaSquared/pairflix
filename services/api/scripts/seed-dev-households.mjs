#!/usr/bin/env node
// Seeds paired-up households into local D1 -- unlike seed-dev-users.mjs's flat, unpaired accounts,
// these exist so a dev can exercise household-scoped flows (pick/commit, quota, provider filters)
// without first hand-creating a household through the UI/API. Includes premium ("unlimited picks")
// households so free-tier's 3-picks/day quota doesn't get in the way of repeated manual testing.
// Mirrored in apps/client/src/components/dev/DevLogin.tsx's householdTestUsers -- keep both in sync
// if this list changes.
// --local only -- never touches a real D1 database.

import { hashPassword, runD1File, sqlString } from './seed-lib.mjs';

const PASSWORD = 'password123';

// Deterministic, not random -- reruns must resolve to the same ids so the `ON CONFLICT` upserts
// below land on the same rows instead of creating duplicates.
const idFor = (prefix, slug) => `${prefix}_hhseed_${slug}`;

// Usernames stay short (<=10 chars) — the DevLogin quick-login panel is a fixed 300px wide
// (DevLogin.css.ts's devContainer), and longer usernames visibly overflow buttons in its two-column grid.
const HOUSEHOLDS = [
	{
		slug: 'free1',
		name: 'Free Household',
		tier: 'free',
		members: [
			{
				slug: 'free1-owner',
				email: 'hh-f1-owner@example.com',
				username: 'hhf1owner',
			},
			{
				slug: 'free1-partner',
				email: 'hh-f1-partner@example.com',
				username: 'hhf1partner',
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
				email: 'hh-f2-owner@example.com',
				username: 'hhf2owner',
			},
			{
				slug: 'free2-partner',
				email: 'hh-f2-partner@example.com',
				username: 'hhf2partner',
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
				email: 'hh-p1-owner@example.com',
				username: 'hhp1owner',
			},
			{
				slug: 'premium1-partner',
				email: 'hh-p1-partner@example.com',
				username: 'hhp1partner',
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
				email: 'hh-p2-owner@example.com',
				username: 'hhp2owner',
			},
			{
				slug: 'premium2-partner',
				email: 'hh-p2-partner@example.com',
				username: 'hhp2partner',
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
				email: 'hh-p3-owner@example.com',
				username: 'hhp3owner',
			},
			{
				slug: 'premium3-partner',
				email: 'hh-p3-partner@example.com',
				username: 'hhp3partner',
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
			`INSERT INTO households (id, name, created_at, updated_at) VALUES (${sqlString(householdId)}, ${sqlString(household.name)}, ${now}, ${now}) ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at;`
		);

		household.members.forEach((member, index) => {
			const userId = idFor('user', member.slug);
			// ON CONFLICT(user_id), not email/username -- a rerun after this script's own fixtures
			// change (e.g. the username shortening below) must update the existing seeded row to
			// match, not silently leave it stale under its old email/username (which is exactly what
			// `INSERT OR IGNORE` did here before -- DevLogin's quick-login then 404s "Invalid email
			// or password" against an email the DB was never updated to).
			statements.push(
				`INSERT INTO users (user_id, username, email, password_hash, role, status, email_verified, preferences, created_at, updated_at) VALUES (${sqlString(userId)}, ${sqlString(member.username)}, ${sqlString(member.email)}, ${sqlString(passwordHash)}, 'user', 'active', 1, ${sqlString(defaultPreferences)}, ${now}, ${now}) ON CONFLICT(user_id) DO UPDATE SET username = excluded.username, email = excluded.email, password_hash = excluded.password_hash, updated_at = excluded.updated_at;`
			);
			const role = index === 0 ? 'owner' : 'member';
			statements.push(
				`INSERT INTO household_members (household_id, user_id, role, joined_at) VALUES (${sqlString(householdId)}, ${sqlString(userId)}, ${sqlString(role)}, ${now}) ON CONFLICT(household_id, user_id) DO UPDATE SET role = excluded.role;`
			);
		});

		if (household.tier === 'premium') {
			const subscriptionId = idFor('sub', household.slug);
			const currentPeriodEnd = now + THIRTY_DAYS_MS;
			// ON CONFLICT(household_id), not id -- `subscriptions.household_id` is the unique key
			// that actually identifies "this household's subscription"; the id's own prefix has
			// already changed once (subscription_hhseed_... -> sub_hhseed_...), which would otherwise
			// insert a second row and hit the household_id unique constraint anyway.
			statements.push(
				`INSERT INTO subscriptions (id, household_id, tier, status, stripe_customer_id, stripe_subscription_id, current_period_end, created_at, updated_at) VALUES (${sqlString(subscriptionId)}, ${sqlString(householdId)}, 'premium', 'active', NULL, NULL, ${currentPeriodEnd}, ${now}, ${now}) ON CONFLICT(household_id) DO UPDATE SET tier = excluded.tier, status = excluded.status, current_period_end = excluded.current_period_end, updated_at = excluded.updated_at;`
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
