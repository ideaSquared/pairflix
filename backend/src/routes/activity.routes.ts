import { Router } from 'express';
import { activityController } from '../controllers/activity.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// All activity routes require authentication
router.use(authenticateToken);

// Get current user's activity
router.get('/me', activityController.getUserActivities);

// Get partner's activity
router.get('/partner', activityController.getPartnerActivities);

// Get combined activity feed
router.get('/feed', activityController.getFeed);

export default router;
