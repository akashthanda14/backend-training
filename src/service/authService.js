import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import * as authModel from '../model/authModel.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Register a new user
 */
async function registerUser(userData) {
  try {
    const { username, email, password } = userData;

    // Validate required fields
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate username (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    const userExists = await authModel.checkUserExists(email, username);
    if (userExists) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const userId = await authModel.createUser(username, email, hashedPassword);

    // Get the created user (without password)
    const newUser = await authModel.getUserById(userId);

    // Generate JWT token
    const token = generateToken(userId);

    return {
      user: newUser,
      token
    };
  } catch (error) {
    console.error('Service error registering user:', error.message);
    throw error;
  }
}

/**
 * Login user
 */
async function loginUser(credentials) {
  try {
    const { login, password } = credentials; // login can be email or username

    // Validate required fields
    if (!login || !password) {
      throw new Error('Email/username and password are required');
    }

    // Find user by email or username
    let user = await authModel.getUserByEmail(login);
    if (!user) {
      user = await authModel.getUserByUsername(login);
    }

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = generateToken(user.id);


    // Remove password from user object for security (don't send password back to client)
    // This creates a new object with all user fields except the password
    const userWithoutPassword = {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    };

    return {
      user: userWithoutPassword,
      token
    };
  } catch (error) {
    console.error('Service error logging in user:', error.message);
    throw error;
  }
}

/**
 * Verify JWT token
 */
async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await authModel.getUserById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    }
    throw error;
  }
}

/**
 * Generate JWT token
 */
function generateToken(userId) {
  return jwt.sign(
    { userId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Refresh token
 */
async function refreshToken(oldToken) {
  try {
    const decoded = jwt.verify(oldToken, JWT_SECRET);
    const user = await authModel.getUserById(decoded.userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const newToken = generateToken(user.id);
    return {
      user,
      token: newToken
    };
  } catch (error) {
    console.error('Service error refreshing token:', error.message);
    throw error;
  }
}

export default {
  registerUser,
  loginUser,
  verifyToken,
  refreshToken,
  generateToken
};
