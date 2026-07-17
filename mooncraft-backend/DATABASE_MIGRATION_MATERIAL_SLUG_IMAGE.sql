-- Fix: materials list/add/update return or expect a `slug`/`image` property that doesn't
-- exist on the live `materials` table. material.repository.js selects/inserts/updates
-- both columns, and material.service.js requires `slug` on create, so without this column
-- reads silently omit it (shows as null/undefined in the API response) and creates/updates
-- fail with "Unknown column 'slug' in field list".

ALTER TABLE materials
  ADD COLUMN slug varchar(255) DEFAULT NULL AFTER name,
  ADD COLUMN image varchar(500) DEFAULT NULL AFTER description;

-- Backfill slugs for existing rows from their name (lowercase, spaces -> hyphens)
UPDATE materials
SET slug = LOWER(REPLACE(TRIM(name), ' ', '-'))
WHERE slug IS NULL;

ALTER TABLE materials
  MODIFY COLUMN slug varchar(255) NOT NULL,
  ADD UNIQUE KEY unique_slug (slug);
