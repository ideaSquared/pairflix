import { Router } from 'express';
import {
	commitHouseholdPick,
	pickForHousehold,
} from '../controllers/household.controller';
import { authenticateToken } from '../middlewares/auth';
import {
	enforcePickQuota,
	enforceRegionLock,
} from '../middlewares/entitlements.middleware';
import { generalRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.use(generalRateLimit);
router.use(authenticateToken);

router.post('/:id/pick', enforceRegionLock, enforcePickQuota, pickForHousehold);
router.post('/:id/picks/:tmdbId/commit', commitHouseholdPick);

export default router;
