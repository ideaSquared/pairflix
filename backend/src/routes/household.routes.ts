import { Router } from 'express';
import {
	commitHouseholdPick,
	pickForHousehold,
} from '../controllers/household.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.post('/:id/pick', pickForHousehold);
router.post('/:id/picks/:tmdbId/commit', commitHouseholdPick);

export default router;
