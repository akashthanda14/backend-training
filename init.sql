-- Initialize database
CREATE DATABASE IF NOT EXISTS myapp_db;
USE myapp_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;




-- Insert sample users (passwords are hashed for: password123)
INSERT INTO users (username, email, password, created_at) VALUES
  ('john_doe', 'john.doe@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RXSBx8dsu', '2025-11-01 10:00:00'),
  ('jane_smith', 'jane.smith@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RXSBx8dsu', '2025-11-02 11:30:00'),
  ('bob_wilson', 'bob.wilson@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RXSBx8dsu', '2025-11-03 14:15:00'),
  ('alice_brown', 'alice.brown@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RXSBx8dsu', '2025-11-04 09:45:00'),
  ('charlie_davis', 'charlie.davis@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RXSBx8dsu', '2025-11-05 16:20:00');

-- Display summary
SELECT 'Database initialized successfully!' AS message;
SELECT COUNT(*) AS total_users FROM users;
