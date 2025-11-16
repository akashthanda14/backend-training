/**
 * User Controller
 * 
 * Controllers handle HTTP requests and responses.
 * They call service functions to do the actual work,
 * then send the results back to the client.
 */

import userService from '../service/userService.js';

/**
 * Get All Users
 * GET /api/v1/users
 * 
 * Returns a list of all users
 */
export async function getUsers(req, res) {
  try {
    const users = await userService.listUsers(); // eklnfekonwwefnowenoi
    res.json({ 
      success: true,
      data: users,
      count: users.length
    });
  } catch (err) {
    console.error('Error in getUsers:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch users',
      message: err.message 
    });
  }
}

/**
 * Get User by ID
 * GET /api/v1/users/:id
 * 
 * Returns a single user by their ID
 */
export async function getUserById(req, res) {
  try {
    const userId = parseInt(req.params.id);
    
    // Validate ID
    if (isNaN(userId) || userId < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }
    
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Error in getUserById:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: err.message
    });
  }
}

/**
 * Create User
 * POST /api/v1/users
 * 
 * Creates a new user
 */
export async function createUser(req, res) {
  try {
    const { username, email } = req.body;

    // Validate required fields
    if (!username || !email) {
      return res.status(400).json({
        success: false,
        error: 'Username and email are required'
      });
    }

    const newUser = await userService.createUser({ username, email });

    res.status(201).json({
      success: true,
      data: newUser,
      message: 'User created successfully'
    });
  } catch (err) {
    console.error('Error in createUser:', err);
    
    // Handle duplicate entry errors
    if (err.message.includes('Duplicate entry') || err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create user',
      message: err.message
    });
  }
}

/**
 * Update User
 * PUT /api/v1/users/:id
 * 
 * Updates an existing user
 */
export async function updateUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    
    // Validate ID
    if (isNaN(userId) || userId < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const { username, email } = req.body;

    // At least one field should be provided
    if (!username && !email) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (username or email) is required for update'
      });
    }

    const updatedUser = await userService.updateUser(userId, { username, email });

    res.json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully'
    });
  } catch (err) {
    console.error('Error in updateUser:', err);

    if (err.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Handle duplicate entry errors
    if (err.message.includes('Duplicate entry') || err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        error: 'Username or email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update user',
      message: err.message
    });
  }
}

/**
 * Delete User
 * DELETE /api/v1/users/:id
 * 
 * Deletes a user by ID
 */
export async function deleteUser(req, res) {
  try {
    const userId = parseInt(req.params.id);
    
    // Validate ID
    if (isNaN(userId) || userId < 1) {
      return res.status(400).json({
        success: false,
        error: 'Invalid user ID'
      });
    }

    const result = await userService.deleteUser(userId);

    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    console.error('Error in deleteUser:', err);

    if (err.message === 'User not found') {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
      message: err.message
    });
  }
}

