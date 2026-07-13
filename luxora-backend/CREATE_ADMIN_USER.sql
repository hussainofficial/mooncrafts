-- ============================================
-- LUXORA - Create Admin User
-- ============================================
-- Email: admin@luxora.com
-- Password: Admin@123
-- Role: admin
-- ============================================

-- Check if admin user already exists
SELECT 'Checking for existing admin user...' as status;
SELECT * FROM users WHERE email = 'admin@luxora.com';

-- Create admin user
INSERT INTO users (email, password, fullName, phone, role, status, created_at)
VALUES (
  'admin@luxora.com',
  '$2b$10$w6ZwZUqm8Oo4GPZwTeXOzOJ.j1nV4qibIDKt99NG.N9XYWSmi4MJy',
  'Admin User',
  '9999999999',
  'admin',
  'active',
  NOW()
);

-- Verify admin user was created
SELECT 'Admin user created successfully!' as status;
SELECT id, email, fullName, role, status, created_at FROM users WHERE email = 'admin@luxora.com';

-- ============================================
-- LOGIN CREDENTIALS
-- ============================================
-- Email: admin@luxora.com
-- Password: Admin@123
-- ============================================
