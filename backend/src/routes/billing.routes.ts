import { Router } from 'express';
import {
	postCancel,
	postCheckout,
	postMockActivate,
	postWebhook,
} from '../controllers/billing.controller';
import { authenticateToken } from '../middlewares/auth';
import { generalRateLimit, strictRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.use(generalRateLimit);

// Webhook must remain unauthenticated; Stripe authenticates via signature.
router.post('/webhook', postWebhook);

router.post('/checkout', authenticateToken, postCheckout);
router.post('/cancel', authenticateToken, strictRateLimit, postCancel);
router.post('/mock-activate', authenticateToken, postMockActivate);

export default router;
