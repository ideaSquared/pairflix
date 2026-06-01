import { Router } from 'express';
import {
	postCancel,
	postCheckout,
	postMockActivate,
	postWebhook,
} from '../controllers/billing.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Webhook must remain unauthenticated; Stripe authenticates via signature.
router.post('/webhook', postWebhook);

router.post('/checkout', authenticateToken, postCheckout);
router.post('/cancel', authenticateToken, postCancel);
router.post('/mock-activate', authenticateToken, postMockActivate);

export default router;
