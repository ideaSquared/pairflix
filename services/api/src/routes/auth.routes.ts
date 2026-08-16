import { Router, type RequestHandler } from 'express';
import {
	getCurrentUser,
	login,
	logout,
	register,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth';
import { authRateLimit, generalRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.post('/register', authRateLimit, register);
router.post('/login', authRateLimit, login);
router.get(
	'/me',
	generalRateLimit,
	authenticateToken,
	getCurrentUser as RequestHandler
);
router.post(
	'/logout',
	generalRateLimit,
	authenticateToken,
	logout as RequestHandler
);

export default router;
