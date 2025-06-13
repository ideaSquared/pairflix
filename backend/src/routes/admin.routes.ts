import express from 'express';
import {
	adminController,
	adminLogin,
	adminLogout,
	changeUserStatusEnhanced,
	clearCache,
	forcePasswordReset,
	getAppSettings,
	getCurrentAdminUser,
	getLockedAccounts,
	getUserSessions,
	refreshAdminToken,
	resendEmailVerification,
	terminateAllUserSessions,
	terminateUserSession,
	unlockUserAccount,
	updateAppSettings,
	validateAdminToken,
} from '../controllers/admin.controller';
import { adminOnlyMiddleware } from '../middlewares/admin-only';
import { authenticateToken } from '../middlewares/auth';
import { strictRateLimit } from '../middlewares/rate-limiter';

const router = express.Router();

// Public admin routes (no auth required)
router.post('/login', adminLogin);

// Protected admin routes (require authentication)
router.get(
	'/validate-token',
	authenticateToken as express.RequestHandler,
	adminOnlyMiddleware as express.RequestHandler,
	validateAdminToken
);

// Current user endpoint
router.get(
	'/me',
	authenticateToken as express.RequestHandler,
	adminOnlyMiddleware as express.RequestHandler,
	getCurrentAdminUser
);

// Token refresh endpoint
router.post(
	'/refresh-token',
	authenticateToken as express.RequestHandler,
	adminOnlyMiddleware as express.RequestHandler,
	refreshAdminToken
);

// Logout endpoint
router.post(
	'/logout',
	authenticateToken as express.RequestHandler,
	adminOnlyMiddleware as express.RequestHandler,
	adminLogout
);

// Apply auth middleware to all other admin routes
router.use(authenticateToken as express.RequestHandler);
router.use(adminOnlyMiddleware as express.RequestHandler);

// Settings routes
router.get('/settings', getAppSettings);
router.put('/settings', updateAppSettings);
router.post('/settings/clear-cache', clearCache);

// User management routes
router.get('/users', adminController.getUsers);
router.post('/users', strictRateLimit, adminController.createUser);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', strictRateLimit, adminController.deleteUser);
router.put(
	'/users/:userId/status',
	strictRateLimit,
	adminController.changeUserStatus
);
router.post(
	'/users/:userId/reset-password',
	strictRateLimit,
	adminController.resetUserPassword
);
router.post(
	'/users/:userId/force-password-reset',
	strictRateLimit,
	forcePasswordReset
);
router.post(
	'/users/:userId/resend-verification',
	strictRateLimit,
	resendEmailVerification
);
router.get('/users-csv', adminController.exportUsersAsCsv);

// Audit log routes
// Get all audit logs with filtering options
router.get('/audit-logs', adminController.getAuditLogs);

// Get audit logs filtered by level
router.get('/audit-logs/:level', adminController.getAuditLogsByLevel);

// Get unique log sources for filtering
router.get('/audit-logs-sources', adminController.getLogSources);

// Get audit log statistics
router.get('/audit-logs-stats', adminController.getAuditLogStats);

// Manually run log rotation
router.post('/audit-logs-rotation', adminController.runLogRotation);

// Create a test log (useful for testing)
router.post('/audit-logs/test', adminController.createTestLog);

// Content management routes
router.get('/watchlist-entries', adminController.getAllWatchlistEntries);
router.put(
	'/watchlist-entries/:entryId/moderate',
	strictRateLimit,
	adminController.moderateWatchlistEntry
);
router.get('/matches', adminController.getAllMatches);
router.get('/content', adminController.getAllContent);
router.get('/content/:contentId/reports', adminController.getContentReports);
router.put('/content/:contentId', adminController.updateContent);
router.put(
	'/content/:contentId/flag',
	strictRateLimit,
	adminController.flagContent
);
router.put(
	'/content/:contentId/approve',
	strictRateLimit,
	adminController.approveContent
);
router.put(
	'/content/:contentId/remove',
	strictRateLimit,
	adminController.removeContent
);
router.put('/reports/:reportId/dismiss', adminController.dismissReport);

// System monitoring routes
router.get('/system-metrics', adminController.getSystemMetrics);
router.get('/user-activity-stats', adminController.getUserActivityStats);
router.get('/all-activities', adminController.getAllActivities);
router.get('/activity-analytics', adminController.getActivityAnalytics);
router.get(
	'/activities/context/:context',
	adminController.getActivitiesByContext
);
router.get(
	'/user/:userId/activity-patterns',
	adminController.getUserActivityPatterns
);
router.get('/dashboard-stats', adminController.getDashboardStats);
router.get('/system-stats', adminController.getSystemStats);

// Account lockout and session management routes
router.get('/locked-accounts', getLockedAccounts);
router.post('/users/:userId/unlock', unlockUserAccount);
router.get('/users/:userId/sessions', getUserSessions);
router.delete('/users/:userId/sessions/:sessionId', terminateUserSession);
router.delete('/users/:userId/sessions', terminateAllUserSessions);

// Enhanced user status management
router.put('/users/:userId/status-enhanced', changeUserStatusEnhanced);

export default router;
