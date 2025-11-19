import { verifyAdminToken, getAdminFromToken } from '../service/adminService.js';

export const authenticateAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                error: "Admin authorization header is required"
            });
        }
        
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                error: "Admin token is required"
            });
        }
        
        // Verify the admin token
        const decoded = verifyAdminToken(token);
        
        // Get fresh admin profile
        const admin = getAdminFromToken(token);
        
        // Attach admin info to request
        req.admin = admin;
        req.adminToken = decoded;
        
        next();
        
    } catch (error) {
        console.error('Admin authentication error:', error);
        
        if (error.message.includes('Invalid') || error.message.includes('expired')) {
            return res.status(401).json({
                success: false,
                error: "Invalid or expired admin token"
            });
        }
        
        return res.status(500).json({
            success: false,
            error: "Internal server error during admin authentication"
        });
    }
};

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

export const requireAdminPermissions = (requiredPermissions = []) => {
    return async (req, res, next) => {
        try {
            // First check if admin is authenticated
            if (!req.admin || !req.adminToken) {
                return res.status(401).json({
                    success: false,
                    error: "Admin authentication required"
                });
            }
            
            // Check if admin has required permissions
            const adminPermissions = req.admin.permissions || [];
            
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
