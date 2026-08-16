import { Router } from 'express';
import {
	commitHouseholdPick,
	createHousehold,
	listHouseholds,
	pickForHousehold,
	postInvite,
} from '../controllers/household.controller';
import {
	getPickEventStatsController,
	postPickEvent,
	postProviderLaunch,
} from '../controllers/pickEvent.controller';
import { authenticateToken } from '../middlewares/auth';
import {
	enforcePickQuota,
	enforceRegionLock,
} from '../middlewares/entitlements.middleware';
import { generalRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.use(generalRateLimit);
router.use(authenticateToken);

router.get('/', listHouseholds);
router.post('/', createHousehold);
router.post('/:id/invites', postInvite);
router.post('/:id/pick', enforceRegionLock, enforcePickQuota, pickForHousehold);
router.post('/:id/picks/:tmdbId/commit', commitHouseholdPick);
router.post('/:id/picks/:tmdbId/launch', postProviderLaunch);
router.post('/:id/pick-events', postPickEvent);
router.get('/:id/pick-events/stats', getPickEventStatsController);

export default router;
