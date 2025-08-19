import { Router } from 'express';
import { registerUser, loginUser, createGuestToken, registerUserWithGuestTransfer, loginUserWithGuestTransfer } from '../controllers/user.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Auth endpoints - /api/auth altında
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/guest', createGuestToken);
router.post('/register-with-transfer', authenticateToken, registerUserWithGuestTransfer);
router.post('/login-with-transfer', authenticateToken, loginUserWithGuestTransfer);

// User management endpoints - /api/users altında (gelecekte eklenebilir)
// router.get('/profile', authenticateToken, getUserProfile);
// router.put('/profile', authenticateToken, updateUserProfile);

export default router;