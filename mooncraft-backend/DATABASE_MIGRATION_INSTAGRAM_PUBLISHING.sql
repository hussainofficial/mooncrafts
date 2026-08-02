-- Adds Instagram auto-publish tracking columns to products.
-- Used by product.controller.js to record whether a product was pushed to the
-- store's Instagram Business feed and which published post it corresponds to.

ALTER TABLE products
  ADD COLUMN is_instagram_published TINYINT(1) NOT NULL DEFAULT 0 AFTER is_featured,
  ADD COLUMN instagram_post_id VARCHAR(255) DEFAULT NULL AFTER is_instagram_published;
