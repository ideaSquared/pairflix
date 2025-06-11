import { Router } from 'express';
import {
	forgotPassword,
	resetPassword,
	sendEmailVerification,
	verifyEmail,
} from '../controllers/email.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post(
	'/send-verification',
	authenticateToken,
	sendEmailVerification as any
);
router.post('/verify-email', verifyEmail);

export default router;
