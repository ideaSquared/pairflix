import express from 'express';
import {
	adminController,
	adminLogin,
	clearCache,
	getAppSettings,
	updateAppSettings,
	validateAdminToken,
} from '../controllers/admin.controller';
import { adminOnlyMiddleware } from '../middlewares/admin-only';
import { authenticateToken } from '../middlewares/auth';

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

// Apply auth middleware to all other admin routes
router.use(authenticateToken as express.RequestHandler);
router.use(adminOnlyMiddleware as express.RequestHandler);

// Settings routes
router.get('/settings', getAppSettings);
router.put('/settings', updateAppSettings);
router.post('/settings/clear-cache', clearCache);

// User management routes
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.get('/users/:userId', adminController.getUserById);
router.put('/users/:userId', adminController.updateUser);
router.delete('/users/:userId', adminController.deleteUser);
router.put('/users/:userId/status', adminController.changeUserStatus);
router.post('/users/:userId/reset-password', adminController.resetUserPassword);
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
	adminController.moderateWatchlistEntry
);
router.get('/matches', adminController.getAllMatches);
router.get('/content', adminController.getAllContent);
router.get('/content/:contentId/reports', adminController.getContentReports);
router.put('/content/:contentId', adminController.updateContent);
router.put('/content/:contentId/flag', adminController.flagContent);
router.put('/content/:contentId/approve', adminController.approveContent);
router.put('/content/:contentId/remove', adminController.removeContent);
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

export default router;
