-- Initialize database
CREATE DATABASE IF NOT EXISTS myapp_db;
USE myapp_db;

-- Drop existing tables to ensure clean recreation
DROP TABLE IF EXISTS otps;
DROP TABLE IF EXISTS users;

-- Users table with email verification
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OTP table for email verification and password reset
CREATE TABLE otps (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp_code VARCHAR(10) NOT NULL,
  otp_type ENUM('email_verification', 'password_reset') NOT NULL DEFAULT 'email_verification',
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_otp_code (otp_code),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample users with verified emails
INSERT INTO users (username, email, password, role, email_verified) VALUES
('admin_user', 'admin@example.com', '$2b$10$rZ8qZ1YxYBYxYJ1YxYBYxO7d9z8qZ1YxYBYxYJ1YxYBYxO7d9z8qZ1', 'admin', TRUE),
('john_doe', 'john.doe@example.com', '$2b$10$rZ8qZ1YxYBYxYJ1YxYBYxO7d9z8qZ1YxYBYxYJ1YxYBYxO7d9z8qZ1', 'user', TRUE),
('jane_smith', 'jane.smith@example.com', '$2b$10$rZ8qZ1YxYBYxYJ1YxYBYxO7d9z8qZ1YxYBYxYJ1YxYBYxO7d9z8qZ1', 'user', FALSE);

-- Display summary
SELECT 'Database initialized successfully!' AS message;
SELECT COUNT(*) AS total_users FROM users;
