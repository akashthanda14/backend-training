import dotenv from 'dotenv';

dotenv.config();

export const validateCredentials = (email, password) => {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
        throw new Error('Admin credentials not configured in environment variables');
    }
    
    return email === adminEmail && password === adminPassword;
};

export const getAdminProfile = () => {
    const adminEmail = process.env.ADMIN_EMAIL;
    
    if (!adminEmail) {
        throw new Error('Admin email not configured in environment variables');
    }
    
    return {
        id: 'admin',
        email: adminEmail,
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_users'],
        created_at: new Date().toISOString()
    };
};

export const isConfigured = () => {
    return !!(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);
};
