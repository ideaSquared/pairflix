import { Router } from 'express';
import {
	forgotPassword,
	getEtherealCredentials,
	resetPassword,
	sendEmailVerification,
	verifyEmail,
} from '../controllers/email.controller';
import { authenticateToken } from '../middlewares/auth';
import { authRateLimit, strictRateLimit } from '../middlewares/rate-limiter';

const router = Router();

// Development endpoint for Ethereal credentials
router.get('/ethereal-credentials', getEtherealCredentials);

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
