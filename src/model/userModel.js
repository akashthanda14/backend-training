import { query } from '../db/db.js';
import { DEFAULT_ROLE } from '../constants/roles.js';

export async function getAllUsers() {
  const users = await query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
  return users;
}

export async function getUserById(userId) {
  const users = await query('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [userId]);
  return users[0] || null;
}

export async function createUser(username, email, password, role = DEFAULT_ROLE) {
  const result = await query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, password, role]
  );
  return result.insertId;
}

export async function updateUser(userId, userData) {
  const { username, email, role } = userData;
  const result = await query(
    'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?',
    [username, email, role, userId]
  );
  return result.affectedRows;
}

export async function deleteUser(userId) {
  const result = await query('DELETE FROM users WHERE id = ?', [userId]);
  return result.affectedRows;
}

