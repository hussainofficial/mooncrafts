-- ============================================
-- MOONCRAFT - Create Admin User
-- ============================================
-- Email: admin@mooncraft.com
-- Password: Admin@123
-- Role: admin
-- ============================================

-- Check if admin user already exists
SELECT 'Checking for existing admin user...' as status;
SELECT * FROM users WHERE email = 'admin@mooncraft.com';

-- Create admin user
INSERT INTO users (email, password, fullName, phone, role, status, created_at)
VALUES (
  'admin@mooncraft.com',
  '$2b$10$w6ZwZUqm8Oo4GPZwTeXOzOJ.j1nV4qibIDKt99NG.N9XYWSmi4MJy',
  'Admin User',
  '9999999999',
  'admin',
  'active',
  NOW()
);

-- Verify admin user was created
SELECT 'Admin user created successfully!' as status;
SELECT id, email, fullName, role, status, created_at FROM users WHERE email = 'admin@mooncraft.com';

-- ============================================
-- LOGIN CREDENTIALS
-- ============================================
-- Email: admin@mooncraft.com
-- Password: Admin@123
-- ============================================
