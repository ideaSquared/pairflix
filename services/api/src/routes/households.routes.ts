import { Router } from 'express';
import { getHouseholdEntitlements } from '../controllers/billing.controller';
import { authenticateToken } from '../middlewares/auth';
import { generalRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.use(generalRateLimit);
router.use(authenticateToken);

router.get('/:id/entitlements', getHouseholdEntitlements);

export default router;
