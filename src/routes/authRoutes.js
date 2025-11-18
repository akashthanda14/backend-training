/**
 * Authentication Routes
 * 
 * Defines all the endpoints for authentication operations
 */

import express from 'express';
import { 
  signup, 
  signin, 
  getProfile, 
  refreshToken, 
  logout 
} from '../controller/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.post('/signup', signup);
router.post('/signin', signin);
router.post('/refresh', refreshToken);

// Protected routes (authentication required)
router.get('/profile', authenticateToken, getProfile);
router.post('/logout', authenticateToken, logout);

export default router;
