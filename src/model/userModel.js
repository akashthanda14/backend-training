import { query } from '../db/db.js';

export const getAllUsers = async () => {
    const sql = 'SELECT id, username, email, role, email_verified, created_at FROM users';
    return await query(sql);
};

export const getUserById = async (id) => {
    if (!id) {
        throw new Error('User ID is required');
    }
    
    const sql = 'SELECT id, username, email, role, email_verified, created_at FROM users WHERE id = ?';
    const result = await query(sql, [id]);
    return result[0];
};

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
        email_verified: false,
        created_at: new Date()
    };
};

export const updateUser = async (id, userData) => {
    if (!id) {
        throw new Error('User ID is required');
    }
    
    const fields = [];
    const values = [];
    
    // Only include defined values
    if (userData.username !== undefined) {
        fields.push('username = ?');
        values.push(userData.username);
    }
    
    if (userData.email !== undefined) {
        fields.push('email = ?');
        values.push(userData.email);
    }
    
    if (userData.password !== undefined) {
        fields.push('password = ?');
        values.push(userData.password);
    }
    
    if (userData.role !== undefined) {
        fields.push('role = ?');
        values.push(userData.role);
    }
    
    if (userData.email_verified !== undefined) {
        fields.push('email_verified = ?');
        values.push(userData.email_verified);
    }
    
    if (fields.length === 0) {
        throw new Error('No fields to update');
    }
    
    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    
    await query(sql, values);
    return getUserById(id);
};

export const deleteUser = async (id) => {
    if (!id) {
        throw new Error('User ID is required');
    }
    
    const sql = 'DELETE FROM users WHERE id = ?';
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
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

export const verifyUserEmail = async (email) => {
    if (!email) {
        throw new Error('Email is required');
    }
    
    const sql = 'UPDATE users SET email_verified = TRUE WHERE email = ?';
    const result = await query(sql, [email]);
    return result.affectedRows > 0;
};

export const isEmailVerified = async (email) => {
    if (!email) {
        throw new Error('Email is required');
    }
    
    const sql = 'SELECT email_verified FROM users WHERE email = ?';
    const result = await query(sql, [email]);
    return result[0]?.email_verified || false;
};

