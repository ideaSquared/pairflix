import { createDb } from '@pairflix/db';
import {
	AdminAuditLogQuerySchema,
	AdminAuditLogRotationRequestSchema,
	AdminChangeStatusRequestSchema,
	AdminContentListQuerySchema,
	AdminCreateUserRequestSchema,
	AdminPaginationQuerySchema,
	AdminRemoveContentRequestSchema,
	AdminResetPasswordRequestSchema,
	AdminSettingsPatchRequestSchema,
	AdminUpdateContentRequestSchema,
	AdminUpdateUserRequestSchema,
	AdminUserListQuerySchema,
	AdminUsersExportQuerySchema,
} from '@pairflix/lib.validation';
import { Hono } from 'hono';
import { auditInfo, auditWarn } from '../lib/audit';
import {
	cleanupOldLogs,
	getAuditLogStats,
	getLogSources,
	listAuditLogs,
	type AuditLogEntry,
} from '../lib/adminAuditLogs';
import {
	approveContent,
	dismissReport,
	flagContent,
	getContentReports,
	listContent,
	removeContent,
	updateContent,
} from '../lib/adminContent';
import { getDashboardStats } from '../lib/adminDashboard';
import { getSettings, updateSettings } from '../lib/adminSettings';
import {
	EmailTakenError,
	UsernameTakenError,
	createUser,
	deleteUser,
	exportUsersCsv,
	forcePasswordReset,
	getLockedAccounts,
	getUserById,
	listUserSessions,
	listUsers,
	resendVerification,
	resetPassword,
	terminateAllUserSessions,
	terminateUserSession,
	unlockUser,
	updateUser,
} from '../lib/adminUsers';
import {
	sendAccountStatusEmail,
	sendAdminPasswordResetEmail,
	sendPasswordResetEmail,
	sendVerificationEmail,
} from '../lib/email';
import { requireAdmin, requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const AUDIT_LOG_LEVELS: AuditLogEntry['level'][] = [
	'info',
	'warn',
	'error',
	'debug',
];

const isAuditLogLevel = (value: string): value is AuditLogEntry['level'] =>
	AUDIT_LOG_LEVELS.some(level => level === value);

export const adminRoutes = new Hono<AppEnv>();

adminRoutes.use('*', requireAuth, requireAdmin);

adminRoutes.get('/dashboard-stats', async c => {
	const db = createDb(c.env.DB);
	return c.json(await getDashboardStats(db));
});

adminRoutes.get('/users/export', async c => {
	const parsed = AdminUsersExportQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	const csv = await exportUsersCsv(db, parsed.data);
	await auditInfo(db, 'Exported users CSV', 'admin', parsed.data);
	return c.text(csv, 200, {
		'Content-Type': 'text/csv',
		'Content-Disposition': 'attachment; filename="users.csv"',
	});
});

adminRoutes.get('/users', async c => {
	const parsed = AdminUserListQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	return c.json(await listUsers(db, parsed.data));
});

adminRoutes.post('/users', async c => {
	const parsed = AdminCreateUserRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	try {
		const user = await createUser(db, parsed.data);
		await auditInfo(db, 'Admin created user', 'admin', {
			userId: user.id,
			email: user.email,
		});
		return c.json(user, 201);
	} catch (error) {
		if (error instanceof EmailTakenError) {
			return c.json({ error: 'email_taken' }, 409);
		}
		if (error instanceof UsernameTakenError) {
			return c.json({ error: 'username_taken' }, 409);
		}
		throw error;
	}
});

adminRoutes.get('/locked-accounts', async c => {
	const parsed = AdminPaginationQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	return c.json(await getLockedAccounts(db, parsed.data));
});

adminRoutes.get('/users/:userId', async c => {
	const db = createDb(c.env.DB);
	const user = await getUserById(db, c.req.param('userId'));
	if (!user) return c.json({ error: 'user_not_found' }, 404);
	return c.json(user);
});

adminRoutes.patch('/users/:userId', async c => {
	const parsed = AdminUpdateUserRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	try {
		const user = await updateUser(db, userId, parsed.data);
		if (!user) return c.json({ error: 'user_not_found' }, 404);
		await auditInfo(db, 'Admin updated user', 'admin', {
			userId,
			changes: parsed.data,
		});
		return c.json(user);
	} catch (error) {
		if (error instanceof EmailTakenError) {
			return c.json({ error: 'email_taken' }, 409);
		}
		if (error instanceof UsernameTakenError) {
			return c.json({ error: 'username_taken' }, 409);
		}
		throw error;
	}
});

adminRoutes.delete('/users/:userId', async c => {
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	const deleted = await deleteUser(db, userId);
	if (!deleted) return c.json({ error: 'user_not_found' }, 404);
	await auditWarn(db, 'Admin deleted user', 'admin', { userId });
	return c.body(null, 204);
});

/**
 * Consolidates Express's two competing status-change endpoints (`status` and `status-enhanced`,
 * which had materially different side effects) into one that always does the fuller behavior:
 * revoke sessions on suspend/ban, and notify the user by email for the three statuses worth an
 * explanation (active/suspended/banned -- see `lib/email.ts`'s `sendAccountStatusEmail`).
 */
adminRoutes.patch('/users/:userId/status', async c => {
	const parsed = AdminChangeStatusRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	const { status, reason } = parsed.data;
	const user = await updateUser(db, userId, { status });
	if (!user) return c.json({ error: 'user_not_found' }, 404);

	if (status === 'suspended' || status === 'banned') {
		await terminateAllUserSessions(db, userId);
	}
	if (status === 'active' || status === 'suspended' || status === 'banned') {
		await sendAccountStatusEmail(c.env, user.email, status, reason);
	}
	await auditWarn(db, 'Admin changed user status', 'admin', {
		userId,
		status,
		reason,
	});
	return c.json(user);
});

adminRoutes.post('/users/:userId/reset-password', async c => {
	const parsed = AdminResetPasswordRequestSchema.safeParse(
		await c.req.json().catch(() => ({}))
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	const result = await resetPassword(db, userId);
	if (!result) return c.json({ error: 'user_not_found' }, 404);

	await auditWarn(db, 'Admin reset user password', 'admin', {
		userId,
		emailed: parsed.data.sendEmail,
	});
	if (!parsed.data.sendEmail) {
		return c.json({ newPassword: result.newPassword });
	}
	const user = await getUserById(db, userId);
	if (user) {
		await sendAdminPasswordResetEmail(c.env, user.email, result.newPassword);
	}
	return c.json({ ok: true });
});

adminRoutes.post('/users/:userId/force-password-reset', async c => {
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	const result = await forcePasswordReset(db, userId);
	if (!result) return c.json({ error: 'user_not_found' }, 404);

	const user = await getUserById(db, userId);
	if (user) await sendPasswordResetEmail(c.env, user.email, result.token);
	await auditWarn(db, 'Admin forced password reset', 'admin', { userId });
	return c.json({ ok: true });
});

adminRoutes.post('/users/:userId/resend-verification', async c => {
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	const result = await resendVerification(db, userId);
	if (result === 'not_found') return c.json({ error: 'user_not_found' }, 404);
	if (result === 'already_verified') {
		return c.json({ error: 'already_verified' }, 400);
	}

	const user = await getUserById(db, userId);
	if (user) await sendVerificationEmail(c.env, user.email, result.token);
	await auditInfo(db, 'Admin resent verification email', 'admin', { userId });
	return c.json({ ok: true });
});

adminRoutes.post('/users/:userId/unlock', async c => {
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	const user = await unlockUser(db, userId);
	if (!user) return c.json({ error: 'user_not_found' }, 404);
	await auditInfo(db, 'Admin unlocked account', 'admin', { userId });
	return c.json(user);
});

adminRoutes.get('/users/:userId/sessions', async c => {
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	const user = await getUserById(db, userId);
	if (!user) return c.json({ error: 'user_not_found' }, 404);
	return c.json({ sessions: await listUserSessions(db, userId) });
});

adminRoutes.delete('/users/:userId/sessions/:sessionId', async c => {
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	const deleted = await terminateUserSession(
		db,
		userId,
		c.req.param('sessionId')
	);
	if (!deleted) return c.json({ error: 'session_not_found' }, 404);
	await auditWarn(db, 'Admin terminated session', 'admin', {
		userId,
		sessionId: c.req.param('sessionId'),
	});
	return c.body(null, 204);
});

adminRoutes.delete('/users/:userId/sessions', async c => {
	const db = createDb(c.env.DB);
	const userId = c.req.param('userId');
	const count = await terminateAllUserSessions(db, userId);
	await auditWarn(db, 'Admin terminated all sessions', 'admin', {
		userId,
		count,
	});
	return c.json({ terminated: count });
});

adminRoutes.get('/audit-logs/sources', async c => {
	const db = createDb(c.env.DB);
	return c.json({ sources: await getLogSources(db) });
});

adminRoutes.get('/audit-logs/stats', async c => {
	const db = createDb(c.env.DB);
	return c.json(await getAuditLogStats(db));
});

adminRoutes.post('/audit-logs/rotation', async c => {
	const parsed = AdminAuditLogRotationRequestSchema.safeParse(
		await c.req.json().catch(() => ({}))
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	const deleted = await cleanupOldLogs(db, parsed.data.retentionDays);
	await auditInfo(db, 'Admin ran audit log rotation', 'admin', deleted);
	return c.json({ deleted });
});

adminRoutes.get('/audit-logs/:level', async c => {
	const level = c.req.param('level');
	if (!isAuditLogLevel(level)) {
		return c.json(
			{
				error: 'Invalid input',
				details: [`level must be one of: ${AUDIT_LOG_LEVELS.join(', ')}`],
			},
			400
		);
	}
	const parsed = AdminAuditLogQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	return c.json(await listAuditLogs(db, { ...parsed.data, level }));
});

adminRoutes.get('/audit-logs', async c => {
	const parsed = AdminAuditLogQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	return c.json(await listAuditLogs(db, parsed.data));
});

adminRoutes.get('/settings', async c => {
	const db = createDb(c.env.DB);
	return c.json(await getSettings(db));
});

adminRoutes.patch('/settings', async c => {
	const parsed = AdminSettingsPatchRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	const settings = await updateSettings(db, parsed.data);
	await auditInfo(db, 'Admin updated settings', 'admin', {
		keys: Object.keys(parsed.data),
	});
	return c.json(settings);
});

adminRoutes.get('/content', async c => {
	const parsed = AdminContentListQuerySchema.safeParse(c.req.query());
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	return c.json(await listContent(db, parsed.data));
});

adminRoutes.get('/content/:contentId/reports', async c => {
	const db = createDb(c.env.DB);
	return c.json({
		reports: await getContentReports(db, c.req.param('contentId')),
	});
});

adminRoutes.patch('/content/:contentId', async c => {
	const parsed = AdminUpdateContentRequestSchema.safeParse(
		await c.req.json().catch(() => null)
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	const contentId = c.req.param('contentId');
	const updated = await updateContent(db, contentId, parsed.data);
	if (!updated) return c.json({ error: 'content_not_found' }, 404);
	await auditInfo(db, 'Admin updated content', 'admin', {
		contentId,
		changes: parsed.data,
	});
	return c.json(updated);
});

adminRoutes.patch('/content/:contentId/flag', async c => {
	const db = createDb(c.env.DB);
	const contentId = c.req.param('contentId');
	const updated = await flagContent(db, contentId);
	if (!updated) return c.json({ error: 'content_not_found' }, 404);
	await auditWarn(db, 'Admin flagged content', 'admin', { contentId });
	return c.json(updated);
});

adminRoutes.patch('/content/:contentId/approve', async c => {
	const db = createDb(c.env.DB);
	const contentId = c.req.param('contentId');
	const updated = await approveContent(db, contentId);
	if (!updated) return c.json({ error: 'content_not_found' }, 404);
	await auditInfo(db, 'Admin approved content', 'admin', { contentId });
	return c.json(updated);
});

adminRoutes.patch('/content/:contentId/remove', async c => {
	const parsed = AdminRemoveContentRequestSchema.safeParse(
		await c.req.json().catch(() => ({}))
	);
	if (!parsed.success) {
		return c.json(
			{
				error: 'Invalid input',
				details: parsed.error.issues.map(i => i.message),
			},
			400
		);
	}
	const db = createDb(c.env.DB);
	const contentId = c.req.param('contentId');
	const updated = await removeContent(db, contentId, parsed.data.reason);
	if (!updated) return c.json({ error: 'content_not_found' }, 404);
	await auditWarn(db, 'Admin removed content', 'admin', {
		contentId,
		reason: parsed.data.reason,
	});
	return c.json(updated);
});

adminRoutes.patch('/reports/:reportId/dismiss', async c => {
	const db = createDb(c.env.DB);
	const reportId = c.req.param('reportId');
	const dismissed = await dismissReport(db, reportId);
	if (!dismissed) return c.json({ error: 'report_not_found' }, 404);
	await auditInfo(db, 'Admin dismissed content report', 'admin', {
		reportId,
	});
	return c.json(dismissed);
});
