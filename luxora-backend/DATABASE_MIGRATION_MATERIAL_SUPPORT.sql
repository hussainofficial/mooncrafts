-- Material Support Migration
-- Adds material tracking to products table for better product detail management

USE luxora_jewelry;

-- Add material_id column to products table if it doesn't exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS material_id INT AFTER category_id;

-- Add foreign key constraint for material_id to reference categories with type='material'
ALTER TABLE products
ADD CONSTRAINT fk_material_id FOREIGN KEY (material_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Add index on material_id for better query performance
CREATE INDEX IF NOT EXISTS idx_material_id ON products(material_id);

-- Update existing products with material information based on description
-- This is optional and can be done manually or through the admin dashboard
-- Example: Products can now have both a product type category and a material category

-- Verify the changes
SELECT
  'Products table updated with material support' as status,
  COUNT(*) as total_products
FROM products;

-- Show sample structure
DESCRIBE products;
