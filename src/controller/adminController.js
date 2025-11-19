import { loginAdmin } from "../service/adminService.js";

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: "Email and password are required"
            });
        }
        
        // Attempt login
        const result = await loginAdmin({ email, password });
        
        res.status(200).json({
            success: true,
            message: "Admin login successful",
            data: result
        });
        
    } catch (error) {
        console.error('Admin login error:', error);
        
        // Handle specific error cases
        if (error.message === "Invalid admin credentials") {
            return res.status(401).json({
                success: false,
                error: "Invalid admin credentials"
            });
        }
        
        if (error.message === "Admin authentication is not configured") {
            return res.status(503).json({
                success: false,
                error: "Admin authentication is not configured"
            });
        }
        
        res.status(500).json({
            success: false,
            error: "Internal server error during admin login"
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        // Admin info should be attached by middleware
        const admin = req.admin;
        
        res.status(200).json({
            success: true,
            data: {
                admin: admin
            }
        });
        
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};

export const getSystemStatus = async (req, res) => {
    try {
        const status = {
            server: 'running',
            database: 'connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.version
        };
        
        res.status(200).json({
            success: true,
            data: status
        });
        
    } catch (error) {
        console.error('Get system status error:', error);
        res.status(500).json({
            success: false,
            error: "Internal server error"
        });
    }
};
