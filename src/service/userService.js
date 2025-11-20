/**
 * User Service
 * 
 * Services contain business logic and orchestrate between controllers and models.
 * They handle data transformation, validation, and business rules.
 */

import * as userModel from '../model/userModel.js';
import bcrypt from 'bcryptjs';
import { DEFAULT_ROLE, ROLES } from '../constants/roles.js';

/**
 * List all users
 * Business logic for retrieving users
 */
async function listUsers() {
  try {
    const users = await userModel.getAllUsers();
    return users;
  } catch (error) {
    console.error('Service error fetching users:', error.message);
    throw new Error('Failed to retrieve users');
  }
}

/**
 * Get user by ID
 * Business logic for retrieving a single user
 */
async function getUserById(userId) {
  try {
    const user = await userModel.getUserById(userId);
    return user;
  } catch (error) {
    console.error('Service error fetching user:', error.message);
    throw error;
  }
}

/**
 * Create a new user
 * Business logic for creating a user
 */
async function createUser(userData) {
  try {
    // Validate required fields
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Username, email, and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Validate username (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(userData.username)) {
      throw new Error('Username can only contain letters, numbers, and underscores');
    }

    // Validate role if provided
    const role = userData.role || DEFAULT_ROLE;
    if (!Object.values(ROLES).includes(role)) {
      throw new Error('Invalid role specified');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    const userId = await userModel.createUser(userData.username, userData.email, hashedPassword, role);
    const newUser = await userModel.getUserById(userId);
    return newUser;
  } catch (error) {
    console.error('Service error creating user:', error.message);
    throw error;
  }
}

/**
 * Update an existing user
 * Business logic for updating a user
 */
async function updateUser(userId, userData) {
  try {
    // Check if user exists
    const existingUser = await userModel.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    // Validate fields if provided
    if (userData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw new Error('Invalid email format');
      }
    }

    if (userData.username) {
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(userData.username)) {
        throw new Error('Username can only contain letters, numbers, and underscores');
      }
    }

    // Validate role if provided
    if (userData.role && !Object.values(ROLES).includes(userData.role)) {
      throw new Error('Invalid role specified');
    }

    // Use existing values if not provided
    const username = userData.username || existingUser.username;
    const email = userData.email || existingUser.email;
    const role = userData.role || existingUser.role;

    const updateData = { username, email, role };
    const affectedRows = await userModel.updateUser(userId, updateData);
    
    if (affectedRows === 0) {
      throw new Error('User update failed');
    }

    const updatedUser = await userModel.getUserById(userId);
    return updatedUser;
  } catch (error) {
    console.error('Service error updating user:', error.message);
    throw error;
  }
}

/**
 * Delete a user
 * Business logic for deleting a user
 */
async function deleteUser(userId) {
  try {
    // Check if user exists
    const existingUser = await userModel.getUserById(userId);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const affectedRows = await userModel.deleteUser(userId);
    
    if (affectedRows === 0) {
      throw new Error('User deletion failed');
    }

    return { message: 'User deleted successfully' };
  } catch (error) {
    console.error('Service error deleting user:', error.message);
    throw error;
  }
}

export default {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
