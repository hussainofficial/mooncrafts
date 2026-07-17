-- Fix: same schema-mismatch bug as materials/categories. collection.repository.js
-- selects/inserts/updates a `slug` column that doesn't exist on the live `collections`
-- table (collection.service.js even requires it on create), so add/update/list all break
-- or silently return null for it.

ALTER TABLE collections
  ADD COLUMN slug varchar(255) DEFAULT NULL AFTER name;

UPDATE collections
SET slug = LOWER(REPLACE(TRIM(name), ' ', '-'))
WHERE slug IS NULL;

ALTER TABLE collections
  MODIFY COLUMN slug varchar(255) NOT NULL,
  ADD UNIQUE KEY unique_slug (slug);
