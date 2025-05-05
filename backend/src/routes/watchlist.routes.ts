import { Router } from 'express';
import {
	addToWatchlist,
	getMatches,
	getWatchlist,
	updateWatchlistEntry,
} from '../controllers/watchlist.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

// Apply authentication middleware to all watchlist routes
router.use(authenticateToken);

router.post('/', addToWatchlist);
router.get('/', getWatchlist);
router.put('/:entry_id', updateWatchlistEntry);
router.get('/matches', getMatches);

export default router;
