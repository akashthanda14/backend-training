import express from 'express';
import { 
  signup, 
  signin, 
  getProfile
} from '../controller/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', signup);
router.post('/signin', signin);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getProfile);

export default router;
