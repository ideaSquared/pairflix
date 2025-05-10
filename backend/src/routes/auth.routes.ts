import { Router } from 'express';
import { getCurrentUser, login } from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
