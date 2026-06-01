import { Router } from 'express';
import {
	getHistory,
	patchHistoryEntry,
} from '../controllers/history.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router({ mergeParams: true });

router.use(authenticateToken);

router.get('/:id/history', getHistory);
router.patch('/:id/history/:watchedId', patchHistoryEntry);

export default router;
