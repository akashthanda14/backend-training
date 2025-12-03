import crypto from 'crypto';
import { createOTP, getValidOTP, markOTPAsUsed, deleteOTPsByEmail } from '../model/otpModel.js';
import { sendOTPEmail, sendPasswordResetEmail } from './emailService.js';

export const generateOTP = (length = 6) => {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
        otp += digits[crypto.randomInt(0, digits.length)];
    }
    
    return otp;
};

export const sendEmailVerificationOTP = async (email) => {
    try {
        const otpLength = parseInt(process.env.OTP_LENGTH) || 6;
        const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN) || 10;
        
        // Generate OTP
        const otpCode = generateOTP(otpLength);
        
        // Calculate expiry time
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
        
        // Delete any existing OTPs for this email
        await deleteOTPsByEmail(email, 'email_verification');
        
        // Store OTP in database
        await createOTP(email, otpCode, 'email_verification', expiresAt);
        
        // Send OTP email
        await sendOTPEmail(email, otpCode);
        
        return {
            success: true,
            message: 'OTP sent successfully',
            expiresIn: expiresInMinutes
        };
        
    } catch (error) {
        console.error('Send OTP error:', error);
        throw new Error('Failed to send OTP: ' + error.message);
    }
};

export const verifyEmailOTP = async (email, otpCode) => {
    try {
        // Get valid OTP
        const otpRecord = await getValidOTP(email, otpCode, 'email_verification');
        
        if (!otpRecord) {
            throw new Error('Invalid or expired OTP');
        }
        
        // Mark OTP as used
        await markOTPAsUsed(otpRecord.id);
        
        return {
            success: true,
            message: 'OTP verified successfully'
        };
        
    } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
    }
};

/**
 * Send Password Reset OTP
 * 
 * Generates and sends a password reset OTP to the user's email
 * 
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Result with success status
 */
export const sendPasswordResetOTP = async (email) => {
    try {
        const otpLength = parseInt(process.env.OTP_LENGTH) || 6;
        const expiresInMinutes = parseInt(process.env.OTP_EXPIRES_IN) || 10;
        
        console.log('📧 Generating password reset OTP for:', email);
        
        // Generate OTP
        const otpCode = generateOTP(otpLength);
        
        console.log('🔢 Generated OTP:', otpCode);
        
        // Calculate expiry time
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);
        
        console.log('🗑️ Deleting existing password reset OTPs for:', email);
        // Delete any existing password reset OTPs for this email
        await deleteOTPsByEmail(email, 'password_reset');
        
        console.log('💾 Storing OTP in database...');
        // Store OTP in database
        await createOTP(email, otpCode, 'password_reset', expiresAt);
        
        console.log('📨 Sending password reset email...');
        // Send password reset email
        await sendPasswordResetEmail(email, otpCode);
        
        console.log('✅ Password reset email sent successfully!');
        
        return {
            success: true,
            message: 'Password reset OTP sent successfully',
            expiresIn: expiresInMinutes
        };
        
    } catch (error) {
        console.error('❌ Send password reset OTP error:', error);
        throw new Error('Failed to send password reset OTP: ' + error.message);
    }
};

/**
 * Verify Password Reset OTP
 * 
 * Verifies the OTP for password reset
 * 
 * @param {string} email - User's email address
 * @param {string} otpCode - OTP code to verify
 * @returns {Promise<Object>} - Result with success status
 */
export const verifyPasswordResetOTP = async (email, otpCode) => {
    try {
        // Get valid OTP
        const otpRecord = await getValidOTP(email, otpCode, 'password_reset');
        
        if (!otpRecord) {
            throw new Error('Invalid or expired OTP');
        }
        
        // Mark OTP as used
        await markOTPAsUsed(otpRecord.id);
        
        return {
            success: true,
            message: 'Password reset OTP verified successfully'
        };
        
    } catch (error) {
        console.error('Verify password reset OTP error:', error);
        throw error;
    }
};