/**
 * Admin Authentication Middleware
 * 
 * This file contains middleware functions for protecting admin-only routes.
 * 
 * Security Flow:
 * 1. Extract JWT token from Authorization header
 * 2. Verify token is valid and not expired
 * 3. Confirm token belongs to the admin (from .env credentials)
 * 4. Attach admin info to request object for use in controllers
 * 5. Allow request to proceed OR block with 401 Unauthorized
 * 
 * Admin Credentials:
 * - Defined in .env file (ADMIN_EMAIL, ADMIN_PASSWORD)
 * - Cannot be changed without server restart
 * - Admin login generates JWT token via /admin/login
 */

import { verifyAdminToken, getAdminFromToken } from '../service/adminService.js';

/**
 * Authenticate Admin Middleware
 * 
 * REQUIRED middleware for admin-only routes.
 * Blocks ALL requests without valid admin token.
 * 
 * Usage:
 *   router.get('/users', authenticateAdmin, getUsers);
 * 
 * Headers Required:
 *   Authorization: Bearer <admin_jwt_token>
 * 
 * Success:
 *   - Adds req.admin (admin profile data)
 *   - Adds req.adminToken (decoded JWT)
 *   - Calls next() to continue to route handler
 * 
 * Failure:
 *   - Returns 401 if no token provided
 *   - Returns 401 if token is invalid/expired
 *   - Returns 500 for server errors
 */
export const authenticateAdmin = async (req, res, next) => {
    try {
        // Step 1: Check if Authorization header exists
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: "Admin authorization header is required"
            });
        }
        
        // Step 2: Extract token from "Bearer TOKEN" format
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Admin token is required"
            });
        }
        
        // Step 3: Verify the admin token (checks signature, expiration, and admin role)
        const decoded = verifyAdminToken(token);
        
        // Step 4: Get fresh admin profile data
        const admin = getAdminFromToken(token);
        
        // Step 5: Attach admin info to request object for use in controllers
        req.admin = admin;
        req.adminToken = decoded;
        
        // Step 6: Continue to the next middleware/route handler
        next();
        
    } catch (error) {
        console.error('Admin authentication error:', error);
        
        // Handle specific JWT errors (invalid signature, expired token, etc.)
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired admin token"
            });
        }
        
        // Handle unexpected errors
        return res.status(500).json({
            success: false,
            error: "Internal server error during admin authentication"
        });
    }
};

/**
 * Optional Admin Authentication Middleware
 * 
 * Tries to authenticate admin but continues even if authentication fails.
 * Useful for routes that behave differently for admins vs regular users.
 * 
 * Usage:
 *   router.get('/dashboard', optionalAdminAuth, getDashboard);
 * 
 * Behavior:
 *   - If valid admin token: Adds req.admin and req.adminToken
 *   - If no token or invalid token: Continues without admin info
 *   - Never blocks the request
 */
export const optionalAdminAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return next(); // No token provided, continue without admin info
        }
        
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return next(); // No token provided, continue without admin info
        }
        
        try {
            // Try to verify the admin token
            const decoded = verifyAdminToken(token);
            const admin = getAdminFromToken(token);
            
            // Attach admin info to request
            req.admin = admin;
            req.adminToken = decoded;
        } catch (error) {
            // Invalid token, but we continue without admin info
            console.log('Optional admin auth failed:', error.message);
        }
        
        next();
        
    } catch (error) {
        console.error('Optional admin authentication error:', error);
        next(); // Continue even if there's an error
    }
};

/**
 * Require Admin Permissions Middleware
 * 
 * Fine-grained permission control for admin routes.
 * Must be used AFTER authenticateAdmin middleware.
 * 
 * Usage:
 *   router.delete('/users/:id', 
 *     authenticateAdmin, 
 *     requireAdminPermissions(['DELETE_USERS']), 
 *     deleteUser
 *   );
 * 
 * Parameters:
 *   requiredPermissions - Array of permission strings required to access route
 * 
 * Behavior:
 *   - Checks if req.admin exists (must use authenticateAdmin first)
 *   - Verifies admin has ALL required permissions
 *   - Returns 403 Forbidden if permissions are insufficient
 */
export const requireAdminPermissions = (requiredPermissions = []) => {
    return async (req, res, next) => {
        try {
            // Check if admin is authenticated (must use authenticateAdmin middleware first)
            if (!req.admin || !req.adminToken) {
                return res.status(401).json({
                    success: false,
                    error: "Admin authentication required"
                });
            }
            
            // Get admin's permissions from their profile
            const adminPermissions = req.admin.permissions || [];
            
            // Check if admin has ALL required permissions
            const hasAllPermissions = requiredPermissions.every(permission => 
                adminPermissions.includes(permission)
            );
            
            if (!hasAllPermissions) {
                return res.status(403).json({
                    success: false,
                    error: "Insufficient admin permissions",
                    required: requiredPermissions,
                    current: adminPermissions
                });
            }
            
            next();
            
        } catch (error) {
            console.error('Admin permission check error:', error);
            return res.status(500).json({
                success: false,
                error: "Internal server error during permission check"
            });
        }
    };
};

/**
 * IMPLEMENTATION SUMMARY:
 * 
 * All User Management Routes (/users/*) are protected by authenticateAdmin:
 * ✅ GET /users - List all users (Admin only)
 * ✅ GET /users/:id - Get user details (Admin only)
 * ✅ POST /users - Create user (Admin only)
 * ✅ PUT /users/:id - Update user (Admin only)
 * ✅ DELETE /users/:id - Delete user (Admin only)
 * 
 * Regular users CANNOT access these endpoints even with valid JWT tokens.
 * Only the admin (defined in .env) can perform user management operations.
 * 
 * To access these routes:
 * 1. Login as admin: POST /admin/login with ADMIN_EMAIL and ADMIN_PASSWORD
 * 2. Get admin JWT token from response
 * 3. Include token in requests: Authorization: Bearer <admin_token>
 */
