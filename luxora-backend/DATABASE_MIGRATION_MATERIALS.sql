-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description LONGTEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create collections table
CREATE TABLE IF NOT EXISTS collections (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL UNIQUE,
  description LONGTEXT,
  image_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_active (is_active),
  INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample materials
INSERT INTO materials (name, description, is_active) VALUES
('Gold', 'Premium gold material', TRUE),
('Silver', 'High quality silver', TRUE),
('Platinum', 'Precious platinum', TRUE),
('Diamond', 'Natural diamonds', TRUE),
('Emerald', 'Authentic emeralds', TRUE),
('Ruby', 'High grade rubies', TRUE),
('Sapphire', 'Premium sapphires', TRUE),
('Pearl', 'Natural pearls', TRUE)
ON DUPLICATE KEY UPDATE is_active=TRUE;

-- Insert sample collections
INSERT INTO collections (name, description, is_active, display_order) VALUES
('Luxury Collection', 'Premium and exclusive jewelry pieces', TRUE, 1),
('Classic Collection', 'Timeless and elegant designs', TRUE, 2),
('Modern Collection', 'Contemporary jewelry styles', TRUE, 3),
('Bridal Collection', 'Wedding and engagement jewelry', TRUE, 4)
ON DUPLICATE KEY UPDATE is_active=TRUE;
