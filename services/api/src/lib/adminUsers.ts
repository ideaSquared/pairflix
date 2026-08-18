import { users, sessions, authTokens, type Database } from '@pairflix/db';
import { and, asc, count, desc, eq, gte, like, or } from 'drizzle-orm';
import { hashPassword } from './crypto';
import { isUniqueConstraintViolation } from './dbErrors';
import { newId, randomToken } from './id';
import { FAILED_ATTEMPT_LIMIT, revokeAllSessions } from './session';

/**
 * Ported from the current Express admin user-management endpoints, with these deliberate
 * departures:
 *
 * - `listUsers`'s `sortBy` is whitelisted through `sortColumns` below instead of splicing the
 *   query string straight into `.orderBy()` -- the current Express admin panel takes `sortBy`
 *   unvalidated from the request and passes it straight into the ORM's order clause.
 * - `getLockedAccounts` reuses `FAILED_ATTEMPT_LIMIT` from `./session` (the same threshold
 *   `/login` actually enforces) instead of a separate hardcoded `3`, which is what the current
 *   Express admin panel's locked-accounts view uses.
 * - `forcePasswordReset` only moves `status` to `'pending'` when the account is currently
 *   `'active'` or `'inactive'` -- the current Express version overwrites `status`
 *   unconditionally, which would silently un-suspend/un-ban an account as a side effect of a
 *   password-reset action.
 * - `exportUsersCsv` quotes every field and escapes embedded quotes; the current Express version
 *   writes fields unquoted.
 *
 * No email sending here -- functions that issue a token return it to the route layer, which
 * sends the email using the tokens/data returned.
 */

const adminUserColumns = {
	id: users.id,
	username: users.username,
	email: users.email,
	role: users.role,
	status: users.status,
	emailVerified: users.emailVerified,
	failedLoginAttempts: users.failedLoginAttempts,
	lockedUntil: users.lockedUntil,
	lastLogin: users.lastLogin,
	createdAt: users.createdAt,
};

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export type AdminUserSummary = {
	id: string;
	username: string;
	email: string;
	role: 'user' | 'admin';
	status: 'active' | 'inactive' | 'pending' | 'suspended' | 'banned';
	emailVerified: boolean;
	failedLoginAttempts: number;
	lockedUntil: Date | null;
	lastLogin: Date | null;
	createdAt: Date;
};

const sortColumns = {
	createdAt: users.createdAt,
	username: users.username,
	email: users.email,
	lastLogin: users.lastLogin,
};

export const listUsers = async (
	db: Database,
	opts: {
		page?: number;
		limit?: number;
		search?: string;
		role?: 'user' | 'admin';
		status?: AdminUserSummary['status'];
		sortBy?: 'createdAt' | 'username' | 'email' | 'lastLogin';
		sortOrder?: 'asc' | 'desc';
	}
): Promise<{
	data: AdminUserSummary[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}> => {
	const page = opts.page ?? 1;
	const limit = opts.limit ?? 20;
	const sortColumn = sortColumns[opts.sortBy ?? 'createdAt'];
	const orderBy = opts.sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

	const where = and(
		opts.role ? eq(users.role, opts.role) : undefined,
		opts.status ? eq(users.status, opts.status) : undefined,
		opts.search
			? or(
					like(users.username, `%${opts.search}%`),
					like(users.email, `%${opts.search}%`)
				)
			: undefined
	);

	const [data, totalRow] = await Promise.all([
		db
			.select(adminUserColumns)
			.from(users)
			.where(where)
			.orderBy(orderBy)
			.limit(limit)
			.offset((page - 1) * limit),
		db.select({ total: count() }).from(users).where(where).get(),
	]);

	const total = totalRow?.total ?? 0;
	return {
		data,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
};

export const getUserById = async (
	db: Database,
	userId: string
): Promise<AdminUserSummary | null> => {
	const row = await db
		.select(adminUserColumns)
		.from(users)
		.where(eq(users.id, userId))
		.get();
	return row ?? null;
};

export class EmailTakenError extends Error {
	constructor() {
		super('email_taken');
		this.name = 'EmailTakenError';
	}
}

export class UsernameTakenError extends Error {
	constructor() {
		super('username_taken');
		this.name = 'UsernameTakenError';
	}
}

export const createUser = async (
	db: Database,
	input: {
		username: string;
		email: string;
		password: string;
		role?: 'user' | 'admin';
		status?: AdminUserSummary['status'];
	}
): Promise<AdminUserSummary> => {
	const existingEmail = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.email, input.email))
		.get();
	if (existingEmail) throw new EmailTakenError();

	const existingUsername = await db
		.select({ id: users.id })
		.from(users)
		.where(eq(users.username, input.username))
		.get();
	if (existingUsername) throw new UsernameTakenError();

	const id = newId('user');
	const role = input.role ?? 'user';
	const status = input.status ?? 'active';
	const now = new Date();
	await db.insert(users).values({
		id,
		username: input.username,
		email: input.email,
		passwordHash: await hashPassword(input.password),
		role,
		status,
		emailVerified: false,
		failedLoginAttempts: 0,
		createdAt: now,
		updatedAt: now,
	});

	return {
		id,
		username: input.username,
		email: input.email,
		role,
		status,
		emailVerified: false,
		failedLoginAttempts: 0,
		lockedUntil: null,
		lastLogin: null,
		createdAt: now,
	};
};

export const updateUser = async (
	db: Database,
	userId: string,
	input: Partial<{
		username: string;
		email: string;
		role: 'user' | 'admin';
		status: AdminUserSummary['status'];
	}>
): Promise<AdminUserSummary | null> => {
	if (input.email) {
		const existingEmail = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, input.email))
			.get();
		if (existingEmail && existingEmail.id !== userId)
			throw new EmailTakenError();
	}
	if (input.username) {
		const existingUsername = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.username, input.username))
			.get();
		if (existingUsername && existingUsername.id !== userId)
			throw new UsernameTakenError();
	}

	// The checks above narrow the common case but aren't atomic with the write below -- a
	// concurrent register/update can still claim the same email/username in between. Falls back
	// to inspecting the DB-level unique-constraint violation (same convention as
	// routes/me.ts's username-update handler) rather than letting it surface as a 500.
	try {
		const updated = await db
			.update(users)
			.set({ ...input, updatedAt: new Date() })
			.where(eq(users.id, userId))
			.returning(adminUserColumns)
			.get();
		return updated ?? null;
	} catch (error) {
		if (!isUniqueConstraintViolation(error)) throw error;
		const message = constraintErrorMessage(error);
		if (input.email && message.includes('users.email')) {
			throw new EmailTakenError();
		}
		if (input.username && message.includes('users.username')) {
			throw new UsernameTakenError();
		}
		throw error;
	}
};

const constraintErrorMessage = (error: unknown): string =>
	error instanceof Error
		? `${error.message} ${constraintErrorMessage(error.cause)}`
		: '';

export const deleteUser = async (
	db: Database,
	userId: string
): Promise<boolean> => {
	const deleted = await db
		.delete(users)
		.where(eq(users.id, userId))
		.returning({ id: users.id });
	return deleted.length > 0;
};

export const resetPassword = async (
	db: Database,
	userId: string
): Promise<{ newPassword: string } | null> => {
	const newPassword = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
	const updated = await db
		.update(users)
		.set({
			passwordHash: await hashPassword(newPassword),
			updatedAt: new Date(),
		})
		.where(eq(users.id, userId))
		.returning({ id: users.id })
		.get();
	if (!updated) return null;
	return { newPassword };
};

export const forcePasswordReset = async (
	db: Database,
	userId: string
): Promise<{ token: string } | null> => {
	const user = await db
		.select({ id: users.id, status: users.status })
		.from(users)
		.where(eq(users.id, userId))
		.get();
	if (!user) return null;

	const token = randomToken();
	const now = new Date();
	await db.insert(authTokens).values({
		id: token,
		userId,
		purpose: 'password_reset',
		forcedByAdmin: true,
		expiresAt: new Date(now.getTime() + TOKEN_TTL_MS),
		createdAt: now,
	});

	if (user.status === 'active' || user.status === 'inactive') {
		await db
			.update(users)
			.set({ status: 'pending', updatedAt: now })
			.where(eq(users.id, userId));
	}

	return { token };
};

export const resendVerification = async (
	db: Database,
	userId: string
): Promise<{ token: string } | 'already_verified' | 'not_found'> => {
	const user = await db
		.select({ id: users.id, emailVerified: users.emailVerified })
		.from(users)
		.where(eq(users.id, userId))
		.get();
	if (!user) return 'not_found';
	if (user.emailVerified) return 'already_verified';

	await db
		.delete(authTokens)
		.where(
			and(eq(authTokens.userId, userId), eq(authTokens.purpose, 'verify_email'))
		);

	const token = randomToken();
	await db.insert(authTokens).values({
		id: token,
		userId,
		purpose: 'verify_email',
		expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
		createdAt: new Date(),
	});

	return { token };
};

export const getLockedAccounts = async (
	db: Database,
	opts: { page?: number; limit?: number }
): Promise<{
	data: AdminUserSummary[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}> => {
	const page = opts.page ?? 1;
	const limit = opts.limit ?? 20;
	const where = or(
		gte(users.lockedUntil, new Date()),
		gte(users.failedLoginAttempts, FAILED_ATTEMPT_LIMIT)
	);

	const [data, totalRow] = await Promise.all([
		db
			.select(adminUserColumns)
			.from(users)
			.where(where)
			.orderBy(desc(users.failedLoginAttempts))
			.limit(limit)
			.offset((page - 1) * limit),
		db.select({ total: count() }).from(users).where(where).get(),
	]);

	const total = totalRow?.total ?? 0;
	return {
		data,
		pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
	};
};

export const unlockUser = async (
	db: Database,
	userId: string
): Promise<AdminUserSummary | null> => {
	const updated = await db
		.update(users)
		.set({ failedLoginAttempts: 0, lockedUntil: null, updatedAt: new Date() })
		.where(eq(users.id, userId))
		.returning(adminUserColumns)
		.get();
	return updated ?? null;
};

export type AdminSessionSummary = {
	id: string;
	ipAddress: string | null;
	userAgent: string | null;
	deviceInfo: string | null;
	createdAt: Date;
	expiresAt: Date;
};

export const listUserSessions = async (
	db: Database,
	userId: string
): Promise<AdminSessionSummary[]> => {
	return db
		.select({
			id: sessions.id,
			ipAddress: sessions.ipAddress,
			userAgent: sessions.userAgent,
			deviceInfo: sessions.deviceInfo,
			createdAt: sessions.createdAt,
			expiresAt: sessions.expiresAt,
		})
		.from(sessions)
		.where(eq(sessions.userId, userId))
		.orderBy(desc(sessions.createdAt));
};

export const terminateUserSession = async (
	db: Database,
	userId: string,
	sessionId: string
): Promise<boolean> => {
	const deleted = await db
		.delete(sessions)
		.where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
		.returning({ id: sessions.id });
	return deleted.length > 0;
};

export const terminateAllUserSessions = async (
	db: Database,
	userId: string
): Promise<number> => {
	return revokeAllSessions(db, userId);
};

const csvField = (value: string): string => `"${value.replace(/"/g, '""')}"`;

export const exportUsersCsv = async (
	db: Database,
	opts: { role?: 'user' | 'admin'; status?: AdminUserSummary['status'] }
): Promise<string> => {
	const where = and(
		opts.role ? eq(users.role, opts.role) : undefined,
		opts.status ? eq(users.status, opts.status) : undefined
	);

	const rows = await db.select(adminUserColumns).from(users).where(where);

	const header = 'User ID,Username,Email,Status,Role,Created At,Last Login';
	const lines = rows.map(row =>
		[
			row.id,
			row.username,
			row.email,
			row.status,
			row.role,
			row.createdAt.toISOString(),
			row.lastLogin ? row.lastLogin.toISOString() : 'Never',
		]
			.map(csvField)
			.join(',')
	);

	return [header, ...lines].join('\n');
};
