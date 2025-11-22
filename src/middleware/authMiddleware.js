/**
 * Authentication Middleware
 * 
 * Middleware functions for protecting routes and verifying JWT tokens
 */

import jwt from 'jsonwebtoken';
import { getUserById } from '../model/userModel.js';

/**
 * Middleware to verify JWT token and authenticate user
 */
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.type !== 'user') {
            return res.status(403).json({
                success: false,
                error: 'Invalid token type'
            });
        }

        const user = await getUserById(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        req.user = user; // Add user to request object
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                error: 'Invalid token'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                error: 'Token expired'
            });
        }

        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};
