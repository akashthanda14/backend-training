import { query } from '../db/db.js';

export async function getAllUsers() {
  const users = await query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC');
  return users;
}

export async function getUserById(userId) {
  const users = await query('SELECT id, username, email, created_at FROM users WHERE id = ?', [userId]);
  return users[0] || null;
}

export async function createUser(username, email) {
  const result = await query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, 'temp_password'] // This should be updated to require password
  );
  return result.insertId;
}

export async function updateUser(userId, username, email) {
  const result = await query(
    'UPDATE users SET username = ?, email = ? WHERE id = ?',
    [username, email, userId]
  );
  return result.affectedRows;
}

export async function deleteUser(userId) {
  const result = await query('DELETE FROM users WHERE id = ?', [userId]);
  return result.affectedRows;
}

