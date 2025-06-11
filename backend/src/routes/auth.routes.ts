import { Router } from 'express';
import {
	getCurrentUser,
	login,
	logout,
	register,
} from '../controllers/auth.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticateToken, getCurrentUser as any);
router.post('/logout', authenticateToken, logout as any);

export default router;
