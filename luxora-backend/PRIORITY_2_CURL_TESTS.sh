# ?? PRIORITY 2 API TESTING - CURL EXAMPLES

## BEFORE RUNNING TESTS:
# 1. Run database migration: mysql -u root -p < DATABASE_MIGRATION_PRODUCTS.sql
# 2. Start backend: npm run dev
# 3. Get an admin token from login: curl -X POST http://localhost:5000/api/v1/auth/login
# 4. Replace YOUR_ADMIN_TOKEN below with actual JWT token

## SET YOUR TOKEN
export ADMIN_TOKEN="YOUR_ADMIN_TOKEN"
export USER_TOKEN="YOUR_USER_TOKEN"

# ============================================
# PRODUCT MANAGEMENT TESTS (8 endpoints)
# ============================================

# 1. List all products (PUBLIC)
curl -X GET "http://localhost:5000/api/v1/products?page=1&limit=10"

# 2. Get single product (PUBLIC)
curl -X GET "http://localhost:5000/api/v1/products/1"

# 3. Search products (PUBLIC)
curl -X GET "http://localhost:5000/api/v1/products/search?q=ring"

# 4. Create product (ADMIN ONLY)
curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{
    "name": "Test Diamond Ring",
    "description": "Beautiful test diamond ring",
    "price": 4500.00,
    "categoryId": 1,
    "image": "/images/test-ring.jpg",
    "stock": 12
  }'

# 5. Update product (ADMIN ONLY)
curl -X PUT http://localhost:5000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{
    "name": "Diamond Ring Updated",
    "description": "Updated diamond ring",
    "price": 5200.00,
    "categoryId": 1,
    "image": "/images/diamond-ring-v2.jpg",
    "stock": 8,
    "status": "active"
  }'

# 6. Delete product (ADMIN ONLY)
curl -X DELETE http://localhost:5000/api/v1/products/11 \
  -H "Authorization: Bearer "

# 7. Low stock products (ADMIN ONLY)
curl -X GET "http://localhost:5000/api/v1/products/admin/low-stock?threshold=10" \
  -H "Authorization: Bearer "

# 8. Product statistics (ADMIN ONLY)
curl -X GET "http://localhost:5000/api/v1/products/admin/stats" \
  -H "Authorization: Bearer "

# ============================================
# USER PROFILE TESTS (4 endpoints)
# ============================================

# 1. Get user profile (PROTECTED)
curl -X GET http://localhost:5000/api/v1/user/profile \
  -H "Authorization: Bearer "

# 2. Update profile (PROTECTED)
curl -X PUT http://localhost:5000/api/v1/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{
    "fullName": "Jane Doe Updated",
    "phone": "+91 9876543210",
    "profileImage": "/images/profile-new.jpg"
  }'

# 3. Change password (PROTECTED)
curl -X PUT http://localhost:5000/api/v1/user/password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{
    "currentPassword": "oldPassword123",
    "newPassword": "newPassword456"
  }'

# 4. Get all users (ADMIN ONLY)
curl -X GET "http://localhost:5000/api/v1/user/admin/all-users?page=1&limit=20" \
  -H "Authorization: Bearer "

# ============================================
# CATEGORY TESTS (6 endpoints)
# ============================================

# 1. List categories (PUBLIC)
curl -X GET "http://localhost:5000/api/v1/categories?page=1&limit=10"

# 2. Get single category (PUBLIC)
curl -X GET "http://localhost:5000/api/v1/categories/1"

# 3. Create category (ADMIN ONLY)
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{
    "name": "Gemstones",
    "description": "Collection of precious gemstones",
    "image": "/images/gemstones.jpg",
    "slug": "gemstones"
  }'

# 4. Update category (ADMIN ONLY)
curl -X PUT http://localhost:5000/api/v1/categories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer " \
  -d '{
    "name": "Diamond Rings",
    "description": "Premium diamond ring collection",
    "image": "/images/diamond-rings.jpg",
    "slug": "diamond-rings"
  }'

# 5. Delete category (ADMIN ONLY)
curl -X DELETE http://localhost:5000/api/v1/categories/7 \
  -H "Authorization: Bearer "

# 6. Get all categories (ADMIN ONLY)
curl -X GET "http://localhost:5000/api/v1/categories/admin/all?page=1&limit=20" \
  -H "Authorization: Bearer "

# ============================================
# TESTING NOTES
# ============================================

# All endpoints return JSON responses with format:
# {
#   "success": true/false,
#   "message": "...",
#   "data": {...}
# }

# Protected endpoints (require Authorization header):
# - All user profile endpoints
# - All product admin endpoints
# - All category admin endpoints

# Admin endpoints (require admin role):
# - POST/PUT/DELETE /api/v1/products
# - GET /api/v1/products/admin/*
# - All category management endpoints
# - GET /api/v1/user/admin/all-users

