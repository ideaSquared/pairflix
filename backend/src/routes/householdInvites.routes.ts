import { Router } from 'express';
import { postAcceptInvite } from '../controllers/household.controller';
import { authenticateToken } from '../middlewares/auth';
import { generalRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.use(generalRateLimit);
router.use(authenticateToken);

router.post('/:token/accept', postAcceptInvite);

export default router;
