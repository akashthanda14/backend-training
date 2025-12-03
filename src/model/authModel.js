import { query } from '../db/db.js';

export const createUser = async (userData) => {
    const { username, email, password, role = 'user' } = userData;
    
    // Validate all required fields are present
    if (!username || !email || !password) {
        throw new Error('Username, email, and password are required');
    }
    
    const sql = 'INSERT INTO users (username, email, password, role, email_verified) VALUES (?, ?, ?, ?, FALSE)';
    const result = await query(sql, [username, email, password, role]);
    
    return { 
        id: result.insertId, 
        username, 
        email, 
        role, 
        email_verified: false 
    };
};

export const getUserByEmail = async (email) => {
    if (!email) {
        throw new Error('Email is required');
    }
    
    const sql = 'SELECT * FROM users WHERE email = ?';
    const result = await query(sql, [email]);
    return result[0];
};

export const getUserByUsername = async (username) => {
    if (!username) {
        throw new Error('Username is required');
    }
    
    const sql = 'SELECT * FROM users WHERE username = ?';
    const result = await query(sql, [username]);
    return result[0];
};

/**
 * Update User Password
 * 
 * Updates a user's password in the database
 * 
 * @param {string} email - User's email address
 * @param {string} hashedPassword - New hashed password
 * @returns {Promise<boolean>} - Success status
 */
export const updatePassword = async (email, hashedPassword) => {
    if (!email || !hashedPassword) {
        throw new Error('Email and hashed password are required');
    }
    
    const sql = 'UPDATE users SET password = ? WHERE email = ?';
    const result = await query(sql, [hashedPassword, email]);
    
    return result.affectedRows > 0;
};
