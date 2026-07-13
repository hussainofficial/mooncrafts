# 🚀 API Implementation Setup Guide

## ✅ COMPLETED - PRIORITY 1 APIs

### **Created Files:**

#### **Database Migration**
- `DATABASE_MIGRATION_ORDERS.sql` - Creates all required tables:
  - orders (with status tracking)
  - order_items (with product pricing)
  - payments (with transaction tracking)
  - addresses (with location references)
  - saved_cards (for payment methods)
  - wishlist (for user wishlist)
  - reviews (for product reviews)
  - categories (for product categories)

#### **Repositories** (Database Access Layer)
- `src/repositories/order.repository.js` - Order CRUD + stats
- `src/repositories/address.repository.js` - Address CRUD
- `src/repositories/payment.repository.js` - Payment CRUD + analytics

#### **Controllers** (Business Logic)
- `src/controllers/order.controller.js` - Order endpoints
- `src/controllers/address.controller.js` - Address endpoints
- `src/controllers/payment.controller.js` - Payment endpoints

#### **Routes** (API Endpoints)
- `src/routes/order.routes.js` - Order endpoints
- `src/routes/address.routes.js` - Address endpoints
- `src/routes/payment.routes.js` - Payment endpoints

#### **Updated Files**
- `src/app.js` - Added route registrations

---

## 📊 API ENDPOINTS CREATED

### **Order Endpoints**
```
POST   /api/v1/orders                     - Create order
GET    /api/v1/orders/my-orders           - Get user orders
GET    /api/v1/orders/:orderId            - Get order details
PUT    /api/v1/orders/:orderId/cancel     - Cancel order (user)
GET    /api/v1/orders/admin/all           - Get all orders (admin)
PUT    /api/v1/orders/:orderId/status     - Update order status (admin)
GET    /api/v1/orders/admin/stats         - Get dashboard stats (admin)
```

### **Address Endpoints**
```
GET    /api/v1/addresses                  - Get user addresses
POST   /api/v1/addresses                  - Create address
GET    /api/v1/addresses/:addressId       - Get address details
PUT    /api/v1/addresses/:addressId       - Update address
DELETE /api/v1/addresses/:addressId       - Delete address
GET    /api/v1/addresses/default          - Get default address
PUT    /api/v1/addresses/:addressId/default - Set as default
```

### **Payment Endpoints**
```
GET    /api/v1/payments/methods           - Get payment methods (public)
GET    /api/v1/payments/upi-apps          - Get UPI apps (public)
POST   /api/v1/payments/process           - Process payment
GET    /api/v1/payments/verify/:txnId     - Verify payment
GET    /api/v1/payments/order/:orderId    - Get payment for order
GET    /api/v1/payments/user/payments     - Get user payments
GET    /api/v1/payments/admin/all         - Get all payments (admin)
GET    /api/v1/payments/admin/stats       - Get payment stats (admin)
```

---

## 🔧 SETUP INSTRUCTIONS

### **Step 1: Create Database Tables**

```bash
# In MySQL Workbench:
# File → Open SQL Script
# Select: C:\Users\hussa\mooncraft-backend\DATABASE_MIGRATION_ORDERS.sql
# Click Execute
```

Or via command line:
```bash
mysql -u root -p < C:\Users\hussa\mooncraft-backend\DATABASE_MIGRATION_ORDERS.sql
```

### **Step 2: Verify Routes Are Registered**

```bash
# Check that src/app.js has these lines:
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/addresses', addressRoutes);
app.use('/api/v1/payments', paymentRoutes);
```

### **Step 3: Restart Backend**

```bash
cd C:\Users\hussa\mooncraft-backend
npm run dev
```

You should see:
```
✔ Backend listening on port 5000
✔ Database connected
✔ Order routes registered
✔ Address routes registered
✔ Payment routes registered
```

### **Step 4: Test Endpoints**

```bash
# Test Order Endpoints
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [{"productId": 1, "quantity": 2, "price": 5000}],
    "shippingAddressId": 1,
    "billingAddressId": 1,
    "paymentMethod": "card",
    "totalAmount": 10000
  }'

# Test Address Endpoints
curl -X GET http://localhost:5000/api/v1/addresses \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Payment Endpoints
curl -X POST http://localhost:5000/api/v1/payments/process \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": 1,
    "amount": 10000,
    "paymentMethod": "card",
    "transactionId": "txn_12345"
  }'
```

---

## 📋 AUTHENTICATION REQUIREMENTS

All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
```

From `/api/v1/auth/login` response.

---

## 🛡️ MIDDLEWARE REQUIREMENTS

**Auth Middleware** (`authMiddleware`):
- Validates JWT token
- Sets `req.user` with user ID and role
- Required for all user endpoints

**Admin Middleware** (`adminMiddleware`):
- Validates user is admin
- Used for admin-only endpoints
- Required for dashboard endpoints

---

## 📅 NEXT PRIORITY APIs (TODO)

### **Priority 2: Product Management (Admin)**
```
POST   /api/v1/admin/products          - Create product
GET    /api/v1/admin/products          - List products
GET    /api/v1/admin/products/:id      - Get product
PUT    /api/v1/admin/products/:id      - Update product
DELETE /api/v1/admin/products/:id      - Delete product
```

### **Priority 2: User Profile**
```
GET    /api/v1/user/profile            - Get profile
PUT    /api/v1/user/profile            - Update profile
PUT    /api/v1/user/password           - Change password
```

### **Priority 2: Admin Categories**
```
GET    /api/v1/admin/categories        - List categories
POST   /api/v1/admin/categories        - Create category
PUT    /api/v1/admin/categories/:id    - Update category
DELETE /api/v1/admin/categories/:id    - Delete category
```

---

## 🧪 TESTING CHECKLIST

- [ ] Database tables created successfully
- [ ] Backend starts without errors
- [ ] All routes registered (check logs)
- [ ] POST /api/v1/orders works with valid data
- [ ] GET /api/v1/addresses returns user addresses
- [ ] POST /api/v1/payments/process creates payment
- [ ] Admin endpoints require auth + admin role
- [ ] User endpoints require auth only

---

## ⚠️ IMPORTANT NOTES

### **Auth Middleware Dependency**
Routes require `authMiddleware` which should:
- Validate JWT token from Authorization header
- Set `req.user = { id, isAdmin, email, ... }`
- Return 401 if invalid token

If `authMiddleware` doesn't exist, you need to create it:
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'Token required' });
  }
  // Verify token and set req.user
  // See existing auth.routes.js for implementation
};
```

### **Admin Middleware Dependency**
Routes require `adminMiddleware` which should:
- Check if `req.user.isAdmin === true`
- Return 403 if not admin

If `adminMiddleware` doesn't exist:
```javascript
const adminMiddleware = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};
```

---

## 📊 DATABASE RELATIONSHIPS

```
users (1) ────────────────────── (N) orders
         ├─ user_id in orders

orders (1) ───────────── (1) addresses (shipping)
        ├─ shipping_address_id

orders (1) ───────────── (1) addresses (billing)
        ├─ billing_address_id

orders (1) ──────────────── (N) order_items
        ├─ order_id

orders (1) ──────────────── (N) payments
        ├─ order_id

addresses ───────────── states (N:1)
        ├─ state_id

addresses ───────────── cities (N:1)
        ├─ city_id
```

---

## 🎯 PRODUCTION READINESS

### ✅ Ready for Dev/Test
- Database schema ✅
- API endpoints ✅
- Request validation ✅
- Response formatting ✅
- Error handling ✅

### ⚠️ Not Ready for Production
- No payment gateway integration (currently simulated)
- No email notifications
- No logging/monitoring
- No rate limiting
- No input sanitization (needs review)

### 🔒 Security Considerations
- Validate all user inputs
- Sanitize database queries (using prepared statements)
- Implement rate limiting
- Add HTTPS enforcement
- Use secure payment gateway (Stripe, Razorpay)
- Implement CORS properly
- Use environment variables for secrets

---

## 📞 Support

If you encounter issues:

1. Check backend logs: `npm run dev`
2. Verify database tables exist: `SHOW TABLES;`
3. Check route registrations in `src/app.js`
4. Ensure auth middleware is working
5. Check request/response format matches API docs

---

**Ready to move to Priority 2 APIs?** Let me know when the database migration is complete!
