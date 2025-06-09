import { Router, type RequestHandler } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All activity routes require authentication
router.use(authenticateToken);

// Get current user's activity
router.get('/me', activityController.getUserActivities as RequestHandler);

// Get partner's activity
router.get(
	'/partner',
	activityController.getPartnerActivities as RequestHandler
);

// Get combined activity feed
router.get('/feed', activityController.getFeed as RequestHandler);

// Admin route - Get any user's activity by userId
router.get(
	'/user/:userId',
	activityController.getAdminUserActivities as RequestHandler<{
		userId: string;
	}>
);

export default router;
