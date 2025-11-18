import { query } from '../db/db.js';

/**
 * Create a new user with hashed password
 */
export async function createUser(username, email, hashedPassword) {
  const result = await query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );
  return result.insertId;
}

/**
 * Find user by email for authentication
 */
export async function getUserByEmail(email) {
  const users = await query(
    'SELECT id, username, email, password, created_at FROM users WHERE email = ?',
    [email]
  );
  return users[0] || null;
}

/**
 * Find user by username for authentication
 */
export async function getUserByUsername(username) {
  const users = await query(
    'SELECT id, username, email, password, created_at FROM users WHERE username = ?',
    [username]
  );
  return users[0] || null;
}

/**
 * Check if user exists by email or username
 */
export async function checkUserExists(email, username) {
  const users = await query(
    'SELECT id FROM users WHERE email = ? OR username = ?',
    [email, username]
  );
  return users.length > 0;
}

/**
 * Get user by ID (excluding password)
 */
export async function getUserById(userId) {
  const users = await query(
    'SELECT id, username, email, created_at FROM users WHERE id = ?',
    [userId]
  );
  return users[0] || null;
}
