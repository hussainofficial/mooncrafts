-- Fix: guest checkout fails with "Unknown column 'guest_email' in 'where clause'"
-- The orders table predates guest checkout support: user_id was NOT NULL and the
-- guest_email/guest_phone/guest_name columns used by order.repository.js were never added.

ALTER TABLE orders
  MODIFY COLUMN user_id INT NULL,
  ADD COLUMN guest_email VARCHAR(255) DEFAULT NULL AFTER updated_at,
  ADD COLUMN guest_phone VARCHAR(20) DEFAULT NULL AFTER guest_email,
  ADD COLUMN guest_name VARCHAR(255) DEFAULT NULL AFTER guest_phone;
