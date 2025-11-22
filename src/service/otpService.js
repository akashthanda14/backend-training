import crypto from 'crypto';
import { createOTP, getValidOTP, markOTPAsUsed, deleteOTPsByEmail } from '../model/otpModel.js';
import { sendOTPEmail } from './emailService.js';

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