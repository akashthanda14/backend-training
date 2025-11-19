import jwt from 'jsonwebtoken';
import { validateCredentials, getAdminProfile, isConfigured } from '../model/adminModel.js';

export const loginAdmin = async (credentials) => {
    const { email, password } = credentials;
    
    // Validate input
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
    
    // Check if admin is configured
    if (!isConfigured()) {
        throw new Error('Admin authentication is not configured');
    }
    
    // Validate credentials
    const isValid = validateCredentials(email, password);
    if (!isValid) {
        throw new Error('Invalid admin credentials');
    }
    
    // Get admin profile
    const adminProfile = getAdminProfile();
    
    // Generate token
    const token = generateAdminToken(adminProfile);
    
    return {
        admin: adminProfile,
        token: token
    };
};

export const generateAdminToken = (admin) => {
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    const payload = {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        type: 'admin' // Mark this as an admin token
    };
    
    return jwt.sign(payload, jwtSecret, { 
        expiresIn: jwtExpiresIn,
        issuer: 'admin-auth-service'
    });
};

export const verifyAdminToken = (token) => {
    try {
        const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
        const decoded = jwt.verify(token, jwtSecret);
        
        // Ensure this is an admin token
        if (decoded.type !== 'admin') {
            throw new Error('Invalid admin token type');
        }
        
        return decoded;
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid admin token');
        }
        if (error.name === 'TokenExpiredError') {
            throw new Error('Admin token has expired');
        }
        throw error;
    }
};

export const getAdminFromToken = (token) => {
    const decoded = verifyAdminToken(token);
    return getAdminProfile();
};
