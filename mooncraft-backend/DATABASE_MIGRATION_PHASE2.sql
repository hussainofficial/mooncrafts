-- PHASE 2: Products Table
-- Run this script after Phase 1 setup

USE mooncraft_jewelry;

-- Products Table
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description LONGTEXT,
  price DECIMAL(10, 2) NOT NULL,
  category_id INT NOT NULL,
  image_url VARCHAR(500),
  image_filename VARCHAR(255),
  stock INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id),
  INDEX idx_category_id (category_id),
  INDEX idx_is_active (is_active),
  FULLTEXT INDEX ft_search (name, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Products (Optional)
INSERT INTO products (name, description, price, category_id, stock) VALUES
('Silver Necklace Elegant', 'Beautiful silver necklace with elegant design', 2999.99, 2, 50),
('Gold Earrings Classic', 'Classic gold earrings for all occasions', 3499.99, 2, 30),
('Kundan Bracelet Traditional', 'Traditional kundan bracelet with stones', 4999.99, 1, 25),
('Pearl Ring Delicate', 'Delicate pearl ring with gold setting', 2499.99, 5, 40),
('Diamond Pendant Sparkling', 'Sparkling diamond pendant in white gold', 7999.99, 2, 15)
ON DUPLICATE KEY UPDATE stock=stock;

-- Verify table created
SELECT 'Products Table Created' as 'Status', COUNT(*) as 'Total Products' FROM products;
