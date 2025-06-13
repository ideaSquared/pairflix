import { Router } from 'express';
import { searchTMDb } from '../controllers/search.controller';
import { searchRateLimit } from '../middlewares/rate-limiter';

const router = Router();

router.get('/media', searchRateLimit, searchTMDb);

export default router;
