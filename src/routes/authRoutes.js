import express from 'express';
import { 
  signup, 
  signin, 
  getProfile,
  forgotPasswordController,
  resetPasswordController
} from '../controller/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { loginLimiter, signupLimiter, otpLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', signupLimiter, signup);
router.post('/signin', loginLimiter, signin);

// Password reset routes (no authentication required)
router.post('/forgot-password', otpLimiter, forgotPasswordController);
router.post('/reset-password', otpLimiter, resetPasswordController);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getProfile);

export default router;
