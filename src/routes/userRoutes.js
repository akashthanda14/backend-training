/**
 * User Management Routes (Admin Only)
 * 
 * All routes in this file are PROTECTED and require admin authentication.
 * Only users with valid admin tokens can access these endpoints.
 * 
 * The authenticateAdmin middleware:
 * - Verifies the admin JWT token
 * - Checks if the token belongs to the admin from .env
 * - Blocks access if token is invalid or expired
 * - Blocks access if user is not an admin
 * 
 * Security:
 * - Regular users CANNOT access these endpoints
 * - Each request must include: Authorization: Bearer <admin_token>
 * - Admins are defined in .env file (ADMIN_EMAIL, ADMIN_PASSWORD)
 */

import express from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controller/userController.js';
import { authenticateAdmin } from '../middleware/adminMiddleware.js';

const router = express.Router();

// GET /users - Get all users (Admin only)
// Returns list of all registered users in the system
router.get('/', authenticateAdmin, getUsers);

// GET /users/:id - Get a specific user by ID (Admin only)
// Returns detailed information about a single user
router.get('/:id', authenticateAdmin, getUserById);

// POST /users - Create a new user (Admin only)
// Allows admin to manually create user accounts
router.post('/', authenticateAdmin, createUser);

// PUT /users/:id - Update a user (Admin only)
// Allows admin to modify user information (username, email, password, role, etc.)
router.put('/:id', authenticateAdmin, updateUser);

// DELETE /users/:id - Delete a user (Admin only)
// Permanently removes a user from the system
router.delete('/:id', authenticateAdmin, deleteUser);

export default router;
