#!/usr/bin/env node
// Seeds the fixture users apps/client/src/components/dev/DevLogin.tsx expects into local D1.
// The Cloudflare re-platform (ADR 0001) deleted the old Express app's backend/src/db/seeders.ts
// but never ported it, so DevLogin has been referencing users that don't exist since the cutover.
// --local only -- never touches a real D1 database.

import { hashPassword, runD1File, sqlString } from './seed-lib.mjs';

const PASSWORD = 'password123';

const newId = () => `user_${crypto.randomUUID().replace(/-/g, '')}`;

// Mirrors apps/client/src/components/dev/DevLogin.tsx's testUsers list.
const users = [
	{
		email: 'useractive@example.com',
		username: 'useractive',
		status: 'active',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'userbanned@example.com',
		username: 'userbanned',
		status: 'banned',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'usersuspended@example.com',
		username: 'usersuspended',
		status: 'suspended',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'admin@example.com',
		username: 'admin',
		status: 'active',
		role: 'admin',
		emailVerified: true,
	},
	{
		email: 'user1@example.com',
		username: 'user1',
		status: 'active',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'user2@example.com',
		username: 'user2',
		status: 'active',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'user3@example.com',
		username: 'user3',
		status: 'active',
		role: 'user',
		emailVerified: false,
	},
	{
		email: 'user4@example.com',
		username: 'user4',
		status: 'suspended',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'user5@example.com',
		username: 'user5',
		status: 'active',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'user6@example.com',
		username: 'user6',
		status: 'active',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'user7@example.com',
		username: 'user7',
		status: 'banned',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'user8@example.com',
		username: 'user8',
		status: 'active',
		role: 'user',
		emailVerified: false,
	},
	{
		email: 'user9@example.com',
		username: 'user9',
		status: 'active',
		role: 'user',
		emailVerified: true,
	},
	{
		email: 'user10@example.com',
		username: 'user10',
		status: 'suspended',
		role: 'user',
		emailVerified: true,
	},
];

const defaultPreferences = JSON.stringify({
	theme: 'dark',
	viewStyle: 'grid',
	emailNotifications: true,
	autoArchiveDays: 30,
	favoriteGenres: [],
});

const run = async () => {
	const passwordHash = await hashPassword(PASSWORD);
	const now = Date.now();

	const statements = users.map(user => {
		const id = newId();
		return `INSERT OR IGNORE INTO users (user_id, username, email, password_hash, role, status, email_verified, preferences, created_at, updated_at) VALUES (${sqlString(id)}, ${sqlString(user.username)}, ${sqlString(user.email)}, ${sqlString(passwordHash)}, ${sqlString(user.role)}, ${sqlString(user.status)}, ${user.emailVerified ? 1 : 0}, ${sqlString(defaultPreferences)}, ${now}, ${now});`;
	});

	runD1File(statements, 'seed-dev-users');

	console.log(`\nSeeded ${users.length} dev users (password: ${PASSWORD}).`);
};

run();
