import { Router } from 'express';
import { searchTMDb } from '../controllers/search.controller';

const router = Router();

router.get('/media', searchTMDb);

export default router;
