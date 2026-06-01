import { Router } from 'express';
import { getProviders } from '../controllers/providers.controller';
import { authenticateToken } from '../middlewares/auth';
import { generalRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.use(generalRateLimit);
router.use(authenticateToken);

router.get('/:tmdbId', getProviders);

export default router;
