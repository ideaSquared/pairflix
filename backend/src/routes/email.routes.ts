import { Router } from 'express';
import {
	forgotPassword,
	resetPassword,
	sendEmailVerification,
	verifyEmail,
} from '../controllers/email.controller';
import { authenticateToken } from '../middlewares/auth';
import { authRateLimit, strictRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.post('/forgot-password', strictRateLimit, forgotPassword);
router.post('/reset-password', strictRateLimit, resetPassword);
router.post(
	'/send-verification',
	authRateLimit,
	authenticateToken,
	sendEmailVerification as any
);
router.post('/verify-email', authRateLimit, verifyEmail);

export default router;
