-- Image Data Storage Fix Migration
-- This migration adds image_data LONGBLOB column and modifies image column to support large base64 data
-- Run this on existing databases to fix image storage

-- Alter products table to support large image data
ALTER TABLE products
  MODIFY COLUMN image LONGTEXT NULL COMMENT 'Store base64 data URL or image path',
  ADD COLUMN IF NOT EXISTS image_data LONGBLOB NULL COMMENT 'Store binary image data (optional)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_status_category ON products(status, category_id);

-- Verify the changes
DESC products;
