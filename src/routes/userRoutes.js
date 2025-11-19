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
router.get('/', authenticateAdmin, getUsers);

// GET /users/:id - Get a specific user by ID (Admin only)
router.get('/:id', authenticateAdmin, getUserById);

// POST /users - Create a new user (Admin only)
router.post('/', authenticateAdmin, createUser);

// PUT /users/:id - Update a user (Admin only)
router.put('/:id', authenticateAdmin, updateUser);

// DELETE /users/:id - Delete a user (Admin only)
router.delete('/:id', authenticateAdmin, deleteUser);

export default router;
