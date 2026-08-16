import { Router } from 'express';
import {
	findByEmail,
	updateEmail,
	updatePassword,
	updatePreferences,
	updateUsername,
} from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth';
import { authRateLimit, generalRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.use(authenticateToken);

router.put('/password', authRateLimit, updatePassword);
router.put('/email', authRateLimit, updateEmail);
router.put('/username', generalRateLimit, updateUsername);
router.put('/preferences', generalRateLimit, updatePreferences);
router.get('/search', generalRateLimit, findByEmail);

export default router;
