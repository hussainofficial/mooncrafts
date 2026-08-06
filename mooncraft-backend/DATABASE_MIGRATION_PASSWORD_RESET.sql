-- Forgot/reset password: single-use, hashed, time-limited reset tokens.
-- Only the SHA-256 hash of the raw token is ever stored, never the raw value.

ALTER TABLE users
  ADD COLUMN reset_password_token VARCHAR(255) DEFAULT NULL,
  ADD COLUMN reset_password_expires DATETIME DEFAULT NULL;

CREATE INDEX idx_users_reset_password_token ON users (reset_password_token);
