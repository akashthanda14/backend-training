import { sendEmailVerificationOTP, verifyEmailOTP } from '../service/otpService.js';
import { verifyUserEmail, getUserByEmail } from '../model/userModel.js';
import { sendWelcomeEmail } from '../service/emailService.js';

export const sendVerificationOTP = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }
        
        // Check if user exists
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Check if already verified
        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                error: 'Email is already verified'
            });
        }
        
        const result = await sendEmailVerificationOTP(email);
        
        res.status(200).json({
            success: true,
            message: 'Verification OTP sent to email',
            data: {
                email: email,
                expiresIn: result.expiresIn
            }
        });
        
    } catch (error) {
        console.error('Send verification OTP error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send verification OTP'
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                error: 'Email and OTP are required'
            });
        }
        
        // Check if user exists
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        // Check if already verified
        if (user.email_verified) {
            return res.status(400).json({
                success: false,
                error: 'Email is already verified'
            });
        }
        
        // Verify OTP
        await verifyEmailOTP(email, otp);
        
        // Update user as verified
        await verifyUserEmail(email);
        
        // Send welcome email
        try {
            await sendWelcomeEmail(email, user.username);
        } catch (emailError) {
            console.error('Welcome email error:', emailError);
        }
        
        res.status(200).json({
            success: true,
            message: 'Email verified successfully',
            data: {
                email: email,
                verified: true
            }
        });
        
    } catch (error) {
        console.error('Verify email error:', error);
        
        if (error.message === 'Invalid or expired OTP') {
            return res.status(400).json({
                success: false,
                error: 'Invalid or expired OTP'
            });
        }
        
        res.status(500).json({
            success: false,
            error: 'Failed to verify email'
        });
    }
};

export const checkVerificationStatus = async (req, res) => {
    try {
        const { email } = req.params;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                error: 'Email is required'
            });
        }
        
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                email: email,
                verified: user.email_verified,
                username: user.username
            }
        });
        
    } catch (error) {
        console.error('Check verification status error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check verification status'
        });
    }
};