-- Create Database
CREATE DATABASE IF NOT EXISTS luxora_jewelry CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE luxora_jewelry;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Addresses Table
CREATE TABLE IF NOT EXISTS user_addresses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  type ENUM('home', 'work', 'other') DEFAULT 'home',
  street_address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table (for Phase 2)
CREATE TABLE IF NOT EXISTS categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  type ENUM('material', 'type', 'collection') NOT NULL,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Categories (Optional - for testing)
INSERT INTO categories (name, slug, description, type, display_order) VALUES
('Silver', 'silver', 'Beautiful silver jewelry pieces', 'material', 1),
('Gold', 'gold', 'Elegant gold jewelry collection', 'material', 2),
('Kundan', 'kundan', 'Traditional kundan jewelry', 'type', 1),
('Artificial', 'artificial', 'Affordable artificial jewelry', 'type', 2),
('Necklaces', 'necklaces', 'Stunning necklace collection', 'type', 3),
('Earrings', 'earrings', 'Exquisite earring designs', 'type', 4),
('Rings', 'rings', 'Beautiful ring collection', 'type', 5),
('Bracelets', 'bracelets', 'Elegant bracelets', 'type', 6),
('Anklets', 'anklets', 'Stylish anklet designs', 'type', 7)
ON DUPLICATE KEY UPDATE display_order=display_order;

-- Verify Tables Created
SELECT 'Users Table' as 'Status', COUNT(*) as 'Columns' FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'luxora_jewelry' AND TABLE_NAME = 'users'
UNION
SELECT 'Refresh Tokens Table', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'luxora_jewelry' AND TABLE_NAME = 'refresh_tokens'
UNION
SELECT 'User Addresses Table', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'luxora_jewelry' AND TABLE_NAME = 'user_addresses'
UNION
SELECT 'Categories Table', COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = 'luxora_jewelry' AND TABLE_NAME = 'categories';
