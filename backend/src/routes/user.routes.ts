import { Router } from 'express';
import {
	findByEmail,
	updateEmail,
	updatePassword,
	updatePreferences,
	updateUsername,
} from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.put('/password', updatePassword);
router.put('/email', updateEmail);
router.put('/username', updateUsername);
router.put('/preferences', updatePreferences);
router.get('/search', findByEmail);

export default router;
