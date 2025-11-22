import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createUser, getUserByEmail, getUserByUsername } from '../model/authModel.js';
import { sendEmailVerificationOTP } from './otpService.js';

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
