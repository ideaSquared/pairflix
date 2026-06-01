import { Router } from 'express';
import { getProviders } from '../controllers/providers.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.get('/:tmdbId', getProviders);

export default router;
