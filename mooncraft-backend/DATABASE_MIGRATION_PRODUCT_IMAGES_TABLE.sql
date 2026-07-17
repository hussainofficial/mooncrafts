-- Migration: Create product_images table for gallery images
-- This table stores multiple images per product with ordering and metadata

CREATE TABLE IF NOT EXISTS product_images (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  image_url LONGTEXT NOT NULL COMMENT 'Base64 encoded image data URL',
  display_order INT DEFAULT 1 COMMENT 'Order for displaying images (1, 2, 3...)',
  alt_text VARCHAR(255) COMMENT 'Alt text for SEO',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product_id (product_id),
  INDEX idx_display_order (product_id, display_order)
);

-- Verify the table was created
DESC product_images;
