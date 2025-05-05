import { Router } from 'express';
import {
	addToWatchlist,
	getMatches,
	getWatchlist,
	updateWatchlistEntry,
} from '../controllers/watchlist.controller';

const router = Router();

router.post('/', addToWatchlist);
router.get('/', getWatchlist);
router.put('/:entry_id', updateWatchlistEntry);
router.get('/matches', getMatches);

export default router;
