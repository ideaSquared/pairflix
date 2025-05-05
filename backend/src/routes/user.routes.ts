import { Router } from 'express';
import { updateEmail, updatePassword } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.use(authenticateToken);

router.put('/password', updatePassword);
router.put('/email', updateEmail);

export default router;
