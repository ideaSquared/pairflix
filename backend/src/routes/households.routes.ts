// TODO: replace on merge — Phase B owns this routes file. Phase E only adds the
// entitlements GET and registers the pick-quota middleware below.
import { Router } from 'express';
import { getHouseholdEntitlements } from '../controllers/billing.controller';
import { authenticateToken } from '../middlewares/auth';
import {
	enforcePickQuota,
	enforceRegionLock,
} from '../middlewares/entitlements.middleware';

const router = Router();

router.use(authenticateToken);

router.get('/:id/entitlements', getHouseholdEntitlements);

// TODO: when Phase B's pick controller lands, mount it here:
//   router.post('/:id/pick', enforcePickQuota, enforceRegionLock, pickController);
// The two middlewares below are re-exported so Phase B can mount them directly
// if they prefer to own the route registration.
export { enforcePickQuota, enforceRegionLock };

export default router;
