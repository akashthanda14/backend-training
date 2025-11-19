import express from 'express';
import { login, getProfile, getSystemStatus } from '../controller/adminController.js';
import { authenticateAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public admin routes (no authentication required)
router.post('/login', login);

// Protected admin routes (authentication required)
router.get('/profile', authenticateAdmin, getProfile);

// Admin-only system routes
router.get('/system/status', authenticateAdmin, getSystemStatus);

export default router;
