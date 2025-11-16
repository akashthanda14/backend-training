/**
 * User Routes
 * 
 * Defines all the endpoints for user operations
 */

import express from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from '../controller/userController.js';

const router = express.Router();

// GET /users - Get all users
router.get('/', getUsers);

// GET /users/:id - Get a specific user by ID
router.get('/:id', getUserById);

// POST /users - Create a new user
router.post('/', createUser);

// PUT /users/:id - Update a user
router.put('/:id', updateUser);

// DELETE /users/:id - Delete a user
router.delete('/:id', deleteUser);

export default router;
