import { query } from '../db/db.js';

export const createOTP = async (email, otpCode, otpType, expiresAt) => {
    const sql = 'INSERT INTO otps (email, otp_code, otp_type, expires_at) VALUES (?, ?, ?, ?)';
    const result = await query(sql, [email, otpCode, otpType, expiresAt]);
    return result;
};

export const getValidOTP = async (email, otpCode, otpType) => {
    const sql = `
        SELECT * FROM otps 
        WHERE email = ? 
        AND otp_code = ? 
        AND otp_type = ? 
        AND expires_at > NOW() 
        AND used = FALSE 
        ORDER BY created_at DESC 
        LIMIT 1
    `;
    const result = await query(sql, [email, otpCode, otpType]);
    return result[0];
};

export const markOTPAsUsed = async (id) => {
    const sql = 'UPDATE otps SET used = TRUE WHERE id = ?';
    await query(sql, [id]);
};

export const deleteExpiredOTPs = async () => {
    const sql = 'DELETE FROM otps WHERE expires_at < NOW()';
    await query(sql);
};

export const deleteOTPsByEmail = async (email, otpType) => {
    const sql = 'DELETE FROM otps WHERE email = ? AND otp_type = ?';
    await query(sql, [email, otpType]);
};

export const getOTPHistory = async (email, limit = 10) => {
    const sql = `
        SELECT otp_type, created_at, expires_at, used 
        FROM otps 
        WHERE email = ? 
        ORDER BY created_at DESC 
        LIMIT ?
    `;
    const result = await query(sql, [email, limit]);
    return result;
};