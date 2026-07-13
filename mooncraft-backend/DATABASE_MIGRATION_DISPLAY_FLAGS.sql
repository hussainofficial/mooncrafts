-- Database Migration: Add Display Flags to Products Table
-- Adds columns to control product visibility in homepage sections

ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_trending BOOLEAN DEFAULT FALSE AFTER status,
ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE AFTER is_trending,
ADD COLUMN IF NOT EXISTS is_best_seller BOOLEAN DEFAULT FALSE AFTER is_new_arrival,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE AFTER is_best_seller;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_is_trending ON products(is_trending);
CREATE INDEX IF NOT EXISTS idx_is_new_arrival ON products(is_new_arrival);
CREATE INDEX IF NOT EXISTS idx_is_best_seller ON products(is_best_seller);
CREATE INDEX IF NOT EXISTS idx_is_featured ON products(is_featured);

-- Verify the columns were added
DESCRIBE products;
