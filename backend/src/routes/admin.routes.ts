import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateToken, requireAdmin } from '../middlewares/auth';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);
// Ensure all admin routes are restricted to admin users only
router.use(requireAdmin);

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

export default router;
