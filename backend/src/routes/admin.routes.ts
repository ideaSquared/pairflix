import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All admin routes require authentication
router.use(authenticateToken);

// Admin-only middleware could be added here for additional security
// This would verify that the authenticated user has admin privileges

// Get all audit logs
router.get('/audit-logs', adminController.getAuditLogs);

// Get audit logs filtered by level
router.get('/audit-logs/:level', adminController.getAuditLogsByLevel);

// Create a test log (useful for testing)
router.post('/audit-logs/test', adminController.createTestLog);

export default router;
