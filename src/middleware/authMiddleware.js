/**
 * Authentication Middleware
 * 
 * Middleware functions for protecting routes and verifying JWT tokens
 */

import authService from '../service/authService.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    const user = await authService.verifyToken(token);
    req.user = user; // Add user to request object
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.message === 'Invalid token' || error.message === 'Token expired') {
      return res.status(401).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: 'Authentication failed',
      message: error.message
    });
  }
}
