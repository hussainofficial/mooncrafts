-- Priority 2 API Database Migration
-- Creates products table and updates existing tables for complete e-commerce functionality

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description LONGTEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT,
  image LONGTEXT,
  image_data LONGBLOB,
  stock INT DEFAULT 0,
  status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  INDEX idx_category (category_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Update categories table (if not already updated)
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS status ENUM('active', 'inactive') DEFAULT 'active',
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Create index on categories slug
CREATE INDEX IF NOT EXISTS idx_category_slug ON categories(slug);

-- Insert sample products (optional)
INSERT INTO products (name, description, price, category_id, image, stock, status) VALUES
('Diamond Ring', 'Beautiful solitaire diamond ring', 5000.00, 1, '/images/diamond-ring.jpg', 10, 'active'),
('Gold Necklace', 'Elegant 18K gold necklace', 3000.00, 2, '/images/gold-necklace.jpg', 15, 'active'),
('Pearl Earrings', 'Authentic pearl earrings', 1500.00, 3, '/images/pearl-earrings.jpg', 20, 'active'),
('Emerald Bracelet', 'Premium emerald bracelet', 4000.00, 4, '/images/emerald-bracelet.jpg', 8, 'active'),
('Ruby Pendant', 'Stunning ruby pendant', 3500.00, 5, '/images/ruby-pendant.jpg', 12, 'active'),
('Sapphire Ring', 'Royal blue sapphire ring', 4500.00, 1, '/images/sapphire-ring.jpg', 6, 'active'),
('Gold Bracelet', '24K gold bracelet', 2500.00, 4, '/images/gold-bracelet.jpg', 18, 'active'),
('Diamond Earrings', 'Diamond stud earrings', 2000.00, 3, '/images/diamond-earrings.jpg', 14, 'active'),
('Titanium Watch', 'Luxury titanium watch', 6000.00, 6, '/images/titanium-watch.jpg', 5, 'active'),
('Crystal Bracelet', 'Swarovski crystal bracelet', 1200.00, 4, '/images/crystal-bracelet.jpg', 25, 'active')
ON DUPLICATE KEY UPDATE stock=stock;

-- Sample categories (if not already inserted)
INSERT INTO categories (name, slug, description, status) VALUES
('Rings', 'rings', 'Collection of rings', 'active'),
('Necklaces', 'necklaces', 'Elegant necklaces', 'active'),
('Earrings', 'earrings', 'Beautiful earrings', 'active'),
('Bracelets', 'bracelets', 'Stunning bracelets', 'active'),
('Pendants', 'pendants', 'Precious pendants', 'active'),
('Watches', 'watches', 'Luxury watches', 'active')
ON DUPLICATE KEY UPDATE status='active';

-- Create saved_cards table (if not exists)
CREATE TABLE IF NOT EXISTS saved_cards (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  last_four_digits VARCHAR(4),
  card_holder_name VARCHAR(255),
  expiry_date VARCHAR(7),
  card_type VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create wishlist table (if not exists)
CREATE TABLE IF NOT EXISTS wishlist (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create reviews table (if not exists)
CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  comment LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables exist
SHOW TABLES;
