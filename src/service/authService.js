import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, getUserByUsername, updatePassword } from '../model/authModel.js';
import { sendEmailVerificationOTP, sendPasswordResetOTP, verifyPasswordResetOTP } from './otpService.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function generateToken(userId) {
    return jwt.sign(
        { id: userId, type: 'user' },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );
}

export async function registerUser(userData) {
    try {
        const { username, email, password } = userData;

        // Validate all required fields
        if (!username || !email || !password) {
            throw new Error('Username, email, and password are required');
        }

        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        if (username.length < 3) {
            throw new Error('Username must be at least 3 characters long');
        }

        if (password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Check for existing users
        const existingUserByEmail = await getUserByEmail(email);
        if (existingUserByEmail) {
            throw new Error('User with this email already exists');
        }

        const existingUserByUsername = await getUserByUsername(username);
        if (existingUserByUsername) {
            throw new Error('User with this username already exists');
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user with all required fields
        const newUser = await createUser({
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            role: 'user'
        });

        // Send verification email
        try {
            await sendEmailVerificationOTP(email.trim().toLowerCase());
            console.log(`✅ Verification email sent to: ${email}`);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Don't fail registration if email fails
        }

        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser;

        return {
            user: userWithoutPassword,
            message: 'User registered successfully. Please check your email for verification.'
        };

    } catch (error) {
        console.error('Service error registering user:', error.message);
        throw error;
    }
}

export async function loginUser(credentials) {
    try {
        const { email, password } = credentials;

        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        const user = await getUserByEmail(email.trim().toLowerCase());

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        // Check if email is verified
        if (!user.email_verified) {
            return {
                requiresVerification: true,
                email: user.email,
                message: 'Please verify your email before logging in. Check your email for verification code.'
            };
        }

        const token = generateToken(user.id);

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return {
            token,
            user: userWithoutPassword,
            message: 'Login successful'
        };

    } catch (error) {
        console.error('Service error logging in user:', error.message);
        throw error;
    }
}

/**
 * Forgot Password Service
 * 
 * Initiates the password reset process by sending an OTP to the user's email
 * 
 * @param {string} email - User's email address
 * @returns {Promise<Object>} - Result with success status
 */
export async function forgotPassword(email) {
    try {
        if (!email) {
            throw new Error('Email is required');
        }

        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        console.log('🔍 Forgot password requested for:', email);

        // Check if user exists
        const user = await getUserByEmail(email.trim().toLowerCase());
        
        if (!user) {
            // For security, don't reveal if user exists or not
            // Return success anyway
            console.log('⚠️ User not found for email:', email);
            return {
                success: true,
                message: 'If an account with this email exists, a password reset code has been sent.'
            };
        }

        console.log('✅ User found:', user.email, '- Sending OTP...');

        // Send password reset OTP
        await sendPasswordResetOTP(email.trim().toLowerCase());

        console.log('✅ Password reset OTP sent successfully to:', email);

        return {
            success: true,
            message: 'Password reset code sent to your email. Please check your inbox.'
        };

    } catch (error) {
        console.error('Service error in forgot password:', error.message);
        throw error;
    }
}

/**
 * Reset Password Service
 * 
 * Resets the user's password after verifying the OTP
 * 
 * @param {Object} resetData - Object containing email, otp, and newPassword
 * @returns {Promise<Object>} - Result with success status
 */
export async function resetPassword(resetData) {
    try {
        const { email, otp, newPassword } = resetData;

        // Validate inputs
        if (!email || !otp || !newPassword) {
            throw new Error('Email, OTP, and new password are required');
        }

        if (!emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }

        if (newPassword.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }

        // Check if user exists
        const user = await getUserByEmail(email.trim().toLowerCase());
        
        if (!user) {
            throw new Error('User not found');
        }

        // Verify OTP
        await verifyPasswordResetOTP(email.trim().toLowerCase(), otp);

        // Hash new password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password in database
        const updated = await updatePassword(email.trim().toLowerCase(), hashedPassword);

        if (!updated) {
            throw new Error('Failed to update password');
        }

        return {
            success: true,
            message: 'Password reset successfully. You can now login with your new password.'
        };

    } catch (error) {
        console.error('Service error in reset password:', error.message);
        throw error;
    }
}
