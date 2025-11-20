import { query } from '../db/db.js';
import { DEFAULT_ROLE } from '../constants/roles.js';

export async function createUser(username, email, hashedPassword, role = DEFAULT_ROLE) {
  const result = await query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
    [username, email, hashedPassword, role]
  );
  return result.insertId;
}

export async function getUserByEmail(email) {
  const users = await query(
    'SELECT id, username, email, password, role, created_at FROM users WHERE email = ?',
    [email]
  );
  return users[0] || null;
}

export async function getUserByUsername(username) {
  const users = await query(
    'SELECT id, username, email, password, role, created_at FROM users WHERE username = ?',
    [username]
  );
  return users[0] || null;
}

export async function checkUserExists(email, username) {
  const users = await query(
    'SELECT id FROM users WHERE email = ? OR username = ?',
    [email, username]
  );
  return users.length > 0;
}

export async function getUserById(userId) {
  const users = await query(
    'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
    [userId]
  );
  return users[0] || null;
}
