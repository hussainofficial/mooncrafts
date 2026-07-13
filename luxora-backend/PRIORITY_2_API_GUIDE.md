# 🚀 PRIORITY 2 APIs - Complete Implementation Guide

## ✅ WHAT'S NEW IN PRIORITY 2

### **3 Major Feature Areas (18 New Endpoints)**

1. **Product Management** (8 endpoints) - Admin CRUD for products
2. **User Profile** (4 endpoints) - Profile, password, statistics
3. **Categories** (6 endpoints) - Category management with product counts

---

## 📂 FILES CREATED

### **Repositories** (3 new)
```
✅ src/repositories/product.repository.js    - 13 methods
✅ src/repositories/user.repository.js       - 6 methods
✅ src/repositories/category.repository.js   - 9 methods
```

### **Controllers** (3 new)
```
✅ src/controllers/product.controller.js     - 8 methods
✅ src/controllers/user.controller.js        - 4 methods
✅ src/controllers/category.controller.js    - 6 methods
```

### **Routes** (3 new)
```
✅ src/routes/product.routes.js              - 8 endpoints
✅ src/routes/user.routes.js                 - 4 endpoints
✅ src/routes/category.routes.js             - 6 endpoints
```

### **Database Migration**
```
✅ DATABASE_MIGRATION_PRODUCTS.sql           - Products table + sample data
```

### **Updated Files**
```
✅ src/app.js                                - Added 2 route registrations
```

---

## 🛢️ DATABASE SETUP

### **Step 1: Run the Migration**

```bash
mysql -u root -p < C:\Users\hussa\luxora-backend\DATABASE_MIGRATION_PRODUCTS.sql
```

Or in MySQL Workbench:
```
File → Open SQL Script → Select DATABASE_MIGRATION_PRODUCTS.sql → Execute
```

This creates:
- **products** table (10 sample products)
- **categories** table updates (6 sample categories)
- **saved_cards** table
- **wishlist** table
- **reviews** table

### **Step 2: Verify Tables**

```bash
mysql -u root -p
mysql> USE luxora;
mysql> SHOW TABLES;
mysql> SELECT * FROM products LIMIT 5;
mysql> SELECT * FROM categories;
```

---

## 📊 API ENDPOINTS

### **PRODUCT MANAGEMENT** (8 endpoints)

#### **Create Product (Admin)**
```
POST /api/v1/products
Authorization: Bearer <TOKEN>

Request Body:
{
  "name": "Diamond Ring",
  "description": "Beautiful solitaire diamond ring",
  "price": 5000.00,
  "categoryId": 1,
  "image": "/images/diamond-ring.jpg",
  "stock": 10
}

Response:
{
  "success": true,
  "message": "Product created successfully",
  "productId": 11
}
```

#### **List All Products (Public)**
```
GET /api/v1/products?page=1&limit=20&categoryId=1&minPrice=1000&maxPrice=10000&search=ring

Response:
{
  "success": true,
  "products": [
    {
      "id": 1,
      "name": "Diamond Ring",
      "price": 5000.00,
      "stock": 10,
      "category_name": "Rings",
      "image": "/images/diamond-ring.jpg"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### **Get Product By ID (Public)**
```
GET /api/v1/products/1

Response:
{
  "success": true,
  "product": {
    "id": 1,
    "name": "Diamond Ring",
    "description": "Beautiful solitaire diamond ring",
    "price": 5000.00,
    "stock": 10,
    "category_name": "Rings",
    "image": "/images/diamond-ring.jpg",
    "status": "active"
  }
}
```

#### **Update Product (Admin)**
```
PUT /api/v1/products/1
Authorization: Bearer <TOKEN>

Request Body:
{
  "name": "Diamond Ring Updated",
  "description": "Beautiful updated diamond ring",
  "price": 5500.00,
  "categoryId": 1,
  "image": "/images/diamond-ring-v2.jpg",
  "stock": 15,
  "status": "active"
}

Response:
{
  "success": true,
  "message": "Product updated successfully"
}
```

#### **Delete Product (Admin)**
```
DELETE /api/v1/products/1
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### **Search Products (Public)**
```
GET /api/v1/products/search?q=ring

Response:
{
  "success": true,
  "products": [...],
  "count": 3
}
```

#### **Get Low Stock Products (Admin)**
```
GET /api/v1/products/admin/low-stock?threshold=10
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "products": [...],
  "count": 5
}
```

#### **Get Product Statistics (Admin)**
```
GET /api/v1/products/admin/stats
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "stats": {
    "total_products": 10,
    "in_stock": 8,
    "low_stock": 2,
    "avg_price": 3450.00,
    "max_price": 6000.00,
    "min_price": 1200.00
  }
}
```

---

### **USER PROFILE** (4 endpoints)

#### **Get Profile (Protected)**
```
GET /api/v1/user/profile
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe",
    "phone": "+91 9876543210",
    "profileImage": "/images/profile.jpg",
    "createdAt": "2026-06-01T10:00:00Z",
    "stats": {
      "total_orders": 5,
      "wishlist_count": 12,
      "review_count": 3,
      "total_spent": 45000.00
    }
  }
}
```

#### **Update Profile (Protected)**
```
PUT /api/v1/user/profile
Authorization: Bearer <TOKEN>

Request Body:
{
  "fullName": "John Doe Updated",
  "phone": "+91 9876543211",
  "profileImage": "/images/profile-new.jpg"
}

Response:
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "John Doe Updated",
    "phone": "+91 9876543211",
    "profileImage": "/images/profile-new.jpg"
  }
}
```

#### **Change Password (Protected)**
```
PUT /api/v1/user/password
Authorization: Bearer <TOKEN>

Request Body:
{
  "currentPassword": "oldPassword123",
  "newPassword": "newPassword456"
}

Response:
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### **Get All Users (Admin)**
```
GET /api/v1/user/admin/all-users?page=1&limit=20
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "fullName": "John Doe",
      "phone": "+91 9876543210",
      "createdAt": "2026-06-01T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 20,
    "pages": 3
  }
}
```

---

### **CATEGORIES** (6 endpoints)

#### **Create Category (Admin)**
```
POST /api/v1/categories
Authorization: Bearer <TOKEN>

Request Body:
{
  "name": "Rings",
  "description": "Collection of beautiful rings",
  "image": "/images/rings.jpg",
  "slug": "rings"
}

Response:
{
  "success": true,
  "message": "Category created successfully",
  "categoryId": 7
}
```

#### **List Categories (Public)**
```
GET /api/v1/categories?page=1&limit=20

Response:
{
  "success": true,
  "categories": [
    {
      "id": 1,
      "name": "Rings",
      "description": "Collection of beautiful rings",
      "image": "/images/rings.jpg",
      "slug": "rings",
      "status": "active",
      "product_count": 10
    }
  ],
  "pagination": {
    "total": 6,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

#### **Get Category By ID (Public)**
```
GET /api/v1/categories/1

Response:
{
  "success": true,
  "category": {
    "id": 1,
    "name": "Rings",
    "description": "Collection of beautiful rings",
    "image": "/images/rings.jpg",
    "slug": "rings",
    "status": "active"
  }
}
```

#### **Update Category (Admin)**
```
PUT /api/v1/categories/1
Authorization: Bearer <TOKEN>

Request Body:
{
  "name": "Rings Updated",
  "description": "Updated collection of rings",
  "image": "/images/rings-v2.jpg",
  "slug": "rings-updated"
}

Response:
{
  "success": true,
  "message": "Category updated successfully",
  "category": {...}
}
```

#### **Delete Category (Admin)**
```
DELETE /api/v1/categories/1
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "message": "Category deleted successfully"
}
```

#### **Get All Categories (Admin)**
```
GET /api/v1/categories/admin/all?page=1&limit=20
Authorization: Bearer <TOKEN>

Response:
{
  "success": true,
  "categories": [...],
  "pagination": {...}
}
```

---

## 🔐 AUTHENTICATION REQUIREMENTS

### **Protected Endpoints (Require Token)**
```
Authorization: Bearer <JWT_TOKEN>
```

Endpoints requiring this header:
- All `/api/v1/products` POST, PUT, DELETE
- All `/api/v1/user/*`
- All `/api/v1/categories` POST, PUT, DELETE

### **Admin-Only Endpoints**
Additionally require `req.user.isAdmin === true`:
- POST `/api/v1/products`
- PUT `/api/v1/products/:id`
- DELETE `/api/v1/products/:id`
- GET `/api/v1/products/admin/*`
- POST `/api/v1/categories`
- PUT `/api/v1/categories/:id`
- DELETE `/api/v1/categories/:id`
- GET `/api/v1/user/admin/all-users`

---

## ⚙️ SETUP INSTRUCTIONS

### **Step 1: Database Migration**

```bash
cd C:\Users\hussa\luxora-backend
mysql -u root -p < DATABASE_MIGRATION_PRODUCTS.sql
```

Expected output:
```
Query OK, 10 rows affected
Query OK, 6 rows affected
```

### **Step 2: Verify Routes Registered**

Check `src/app.js` has:
```javascript
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
```

✅ Already done for you!

### **Step 3: Restart Backend**

```bash
cd C:\Users\hussa\luxora-backend
npm run dev
```

You should see:
```
✔ Backend listening on port 5000
✔ Database connected
✔ All routes registered
```

### **Step 4: Test Endpoints**

```bash
# Test public products endpoint
curl http://localhost:5000/api/v1/products

# Test user profile (replace TOKEN with actual JWT)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/user/profile

# Test categories
curl http://localhost:5000/api/v1/categories
```

---

## 📋 VALIDATION RULES

### **Product Creation**
- `name` - Required, 2+ characters, unique
- `price` - Required, numeric, >= 0
- `categoryId` - Required, valid category ID
- `stock` - Required, integer >= 0
- `description` - Optional
- `image` - Optional

### **User Profile Update**
- `fullName` - Optional, 2+ characters
- `phone` - Optional
- `profileImage` - Optional

### **Password Change**
- `currentPassword` - Required
- `newPassword` - Required, 6+ characters, must differ from current

### **Category Creation**
- `name` - Required, 2+ characters
- `slug` - Required, URL-safe slug format
- `description` - Optional
- `image` - Optional

---

## 🔍 ERROR RESPONSES

### **400 Bad Request**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "param": "name",
      "msg": "Name is required"
    }
  ]
}
```

### **401 Unauthorized**
```json
{
  "success": false,
  "message": "Token required"
}
```

### **403 Forbidden**
```json
{
  "success": false,
  "message": "Admin access required"
}
```

### **404 Not Found**
```json
{
  "success": false,
  "message": "Product not found"
}
```

### **500 Internal Server Error**
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 📊 DATA RELATIONSHIPS

```
categories (1) ───────────── (N) products
   ├─ category_id in products

users (1) ─────────────────── (N) saved_cards
       ├─ user_id

users (1) ─────────────────── (N) wishlist
       ├─ user_id

users (1) ─────────────────── (N) reviews
       ├─ user_id

products (1) ────────────── (N) wishlist
         ├─ product_id

products (1) ────────────── (N) reviews
         ├─ product_id
```

---

## 🚀 TESTING WITH CURL

### **Test Create Product (Admin)**
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "name": "Gold Ring",
    "description": "Beautiful gold ring",
    "price": 3000,
    "categoryId": 1,
    "image": "/images/gold-ring.jpg",
    "stock": 15
  }'
```

### **Test Get All Products**
```bash
curl http://localhost:5000/api/v1/products
```

### **Test User Profile**
```bash
curl -H "Authorization: Bearer YOUR_USER_TOKEN" \
  http://localhost:5000/api/v1/user/profile
```

### **Test Categories**
```bash
curl http://localhost:5000/api/v1/categories?limit=10
```

---

## ✨ NEXT STEPS

After setting up Priority 2:

1. ✅ Run database migration
2. ✅ Restart backend
3. ✅ Test all endpoints with curl
4. ⏳ **PRIORITY 3** (Wishlist, Reviews, Cards):
   - Wishlist endpoints (add/remove/list)
   - Review system (create/list/update)
   - Saved card management

5. ⏳ **PRIORITY 4** (Advanced):
   - Advanced filters & search
   - Product recommendations
   - Analytics dashboard

---

## 🎯 QUICK REFERENCE

| Feature | Status | Endpoints | Notes |
|---------|--------|-----------|-------|
| Products | ✅ Done | 8 | Admin CRUD, public list |
| User Profile | ✅ Done | 4 | Profile, password, stats |
| Categories | ✅ Done | 6 | Admin CRUD, product count |
| Wishlist | ⏳ TODO | 3-4 | Next priority |
| Reviews | ⏳ TODO | 4-5 | Next priority |
| Saved Cards | ⏳ TODO | 5-6 | Next priority |

---

## 📞 TROUBLESHOOTING

### **Issue: Routes not found (404)**
✅ **Solution:** Verify routes registered in `src/app.js` and restart backend

### **Issue: Auth middleware not working**
✅ **Solution:** Check `src/middleware/auth.middleware.js` exists and properly validates JWT

### **Issue: Database tables missing**
✅ **Solution:** Run `DATABASE_MIGRATION_PRODUCTS.sql` in MySQL

### **Issue: Validation errors**
✅ **Solution:** Check request body matches validation rules above

---

**Ready to move to Priority 3 (Wishlist, Reviews, Cards)?** Let me know when you've tested these endpoints!
