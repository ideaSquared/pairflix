import { Router } from 'express';
import { createMatch, getMatches, updateMatchStatus } from '../controllers/match.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Apply authentication middleware to all match routes
router.use(authenticateToken);

router.get('/', getMatches);
router.post('/', createMatch);
router.put('/:match_id/status', updateMatchStatus);

export default router;