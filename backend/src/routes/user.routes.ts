import { Router } from 'express';
import {
	findByEmail,
	updateEmail,
	updatePassword,
} from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.put('/password', updatePassword);
router.put('/email', updateEmail);
router.get('/search', findByEmail);

export default router;
