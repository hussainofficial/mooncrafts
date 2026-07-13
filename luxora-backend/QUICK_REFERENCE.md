# LUXORA API - Quick Reference Guide

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication Header
```
Authorization: Bearer <your_jwt_token>
```

---

## USER ENDPOINTS

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/users/health` | ❌ | ❌ | Health check |
| GET | `/users/profile` | ✅ | ❌ | Get current user profile |
| GET | `/users/:userId` | ✅ | ❌ | Get user (self/admin) |
| PUT | `/users/profile` | ✅ | ❌ | Update current profile |
| PUT | `/users/password` | ✅ | ❌ | Change password |
| PUT | `/users/:userId` | ✅ | ✅ | Update user |
| DELETE | `/users/:userId` | ✅ | ✅ | Delete user |
| GET | `/users` | ✅ | ✅ | List all users |
| GET | `/users/admin/search?q=term` | ✅ | ✅ | Search users |
| GET | `/users/admin/by-role?role=admin` | ✅ | ✅ | Filter by role |
| GET | `/users/admin/by-status?status=active` | ✅ | ✅ | Filter by status |

---

## CATEGORY ENDPOINTS

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/categories` | ❌ | ❌ | List categories |
| GET | `/categories/active/list` | ❌ | ❌ | Active categories only |
| GET | `/categories/by-type/:type` | ❌ | ❌ | Filter by type |
| GET | `/categories/by-slug/:slug` | ❌ | ❌ | Get by slug |
| GET | `/categories/:categoryId` | ❌ | ❌ | Get single category |
| POST | `/categories` | ✅ | ✅ | Create category |
| PUT | `/categories/:categoryId` | ✅ | ✅ | Update category |
| DELETE | `/categories/:categoryId` | ✅ | ✅ | Delete category |
| GET | `/categories/admin/all` | ✅ | ✅ | Admin view (all) |

---

## ORDER ENDPOINTS

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| POST | `/orders` | ✅ | ❌ | Create order |
| GET | `/orders/user/my-orders` | ✅ | ❌ | Get my orders |
| GET | `/orders/:orderId` | ✅ | ❌ | Get order details |
| PUT | `/orders/:orderId/cancel` | ✅ | ❌ | Cancel order |
| GET | `/orders/admin/all` | ✅ | ✅ | List all orders |
| PUT | `/orders/admin/:orderId/status` | ✅ | ✅ | Update status |
| GET | `/orders/admin/stats` | ✅ | ✅ | Order statistics |

---

## PAYMENT ENDPOINTS

| Method | Endpoint | Auth | Admin | Description |
|--------|----------|------|-------|-------------|
| GET | `/payments/methods` | ❌ | ❌ | Payment methods |
| GET | `/payments/upi-apps` | ❌ | ❌ | UPI apps |
| POST | `/payments/process` | ✅ | ❌ | Process payment |
| GET | `/payments/verify/:transactionId` | ✅ | ❌ | Verify payment |
| GET | `/payments/order/:orderId` | ✅ | ❌ | Get payment by order |
| GET | `/payments/user/list` | ✅ | ❌ | My payments |
| GET | `/payments/admin/all` | ✅ | ✅ | All payments |
| GET | `/payments/admin/stats` | ✅ | ✅ | Payment stats |
| GET | `/payments/admin/revenue` | ✅ | ✅ | Daily revenue |

---

## COMMON QUERY PARAMETERS

### Pagination
```
?page=1&limit=20
```

### Filters
```
# Orders
?status=pending

# Payments
?status=completed&days=30

# Categories
?type=material

# Users
?q=john (search)
?role=admin
?status=active
```

---

## REQUEST BODY EXAMPLES

### Create Order
```json
{
  "items": [
    { "productId": 1, "quantity": 2, "price": 5000.00 }
  ],
  "shippingAddressId": 1,
  "billingAddressId": 1,
  "paymentMethod": "card",
  "totalAmount": 10000.00
}
```

### Process Payment
```json
{
  "orderId": 1,
  "amount": 10000.00,
  "paymentMethod": "card",
  "transactionId": "txn_12345"
}
```

### Create Category
```json
{
  "name": "Gold",
  "slug": "gold",
  "description": "Gold jewelry collection",
  "type": "material"
}
```

### Update User
```json
{
  "name": "John Doe",
  "phone": "9876543210",
  "role": "user",
  "status": "active"
}
```

---

## RESPONSE STATUS CODES

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Server Error |

---

## CURL EXAMPLES

### Get Current User
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/users/profile
```

### Create Order
```bash
curl -X POST http://localhost:5000/api/v1/orders \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [{"productId": 1, "quantity": 2, "price": 5000}],
    "shippingAddressId": 1,
    "billingAddressId": 1,
    "paymentMethod": "card",
    "totalAmount": 10000
  }'
```

### Create Category (Admin)
```bash
curl -X POST http://localhost:5000/api/v1/categories \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gold",
    "slug": "gold",
    "description": "Gold jewelry",
    "type": "material"
  }'
```

### Process Payment
```bash
curl -X POST http://localhost:5000/api/v1/payments/process \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": 1,
    "amount": 10000,
    "paymentMethod": "card",
    "transactionId": "txn_123"
  }'
```

### List Users (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:5000/api/v1/users?page=1&limit=20"
```

### Search Users (Admin)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:5000/api/v1/users/admin/search?q=john&page=1&limit=20"
```

---

## ENUMS & CONSTANTS

### User Roles
```
user
admin
```

### User Status
```
active
inactive
banned
```

### Category Types
```
material
type
collection
```

### Order Status
```
pending
processing
shipped
delivered
cancelled
```

### Payment Methods
```
card
upi
netbanking
wallet
cod
```

### Payment Status
```
pending
completed
failed
cancelled
```

---

## ERROR RESPONSE EXAMPLES

### Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

### Validation Error
```json
{
  "success": false,
  "message": "Bad request",
  "errors": [
    {
      "value": "",
      "msg": "Invalid value",
      "param": "name",
      "location": "body"
    }
  ]
}
```

### Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### Conflict
```json
{
  "success": false,
  "message": "Slug already exists"
}
```

---

## SUCCESS RESPONSE EXAMPLES

### Get Profile
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "1234567890",
    "role": "user",
    "status": "active",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "stats": {
    "total_orders": 5,
    "wishlist_count": 3,
    "review_count": 2,
    "total_spent": 5000.00
  }
}
```

### List Orders
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "total_amount": 10000.00,
      "status": "processing",
      "created_at": "2024-01-01T00:00:00Z",
      "items": [...]
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## TESTING WORKFLOW

### 1. Register & Get Token
```bash
# User registration (auth endpoint)
POST /api/v1/auth/register
# Returns { accessToken, refreshToken, user }
```

### 2. Get User Profile
```bash
GET /api/v1/users/profile
```

### 3. Create Order
```bash
POST /api/v1/orders
```

### 4. Process Payment
```bash
POST /api/v1/payments/process
```

### 5. Check Order Status
```bash
GET /api/v1/orders/:orderId
```

### 6. Admin: View All Orders
```bash
GET /api/v1/orders/admin/all
```

---

## TROUBLESHOOTING

### 401 Unauthorized
- Check if token is included
- Verify token hasn't expired
- Ensure header format: `Authorization: Bearer TOKEN`

### 403 Forbidden
- Check if user is admin
- Verify user role in database

### 404 Not Found
- Verify resource ID is correct
- Check if resource exists in database

### 400 Bad Request
- Check request body format
- Verify all required fields are present
- Review validation error messages

### 500 Server Error
- Check server logs
- Verify database connection
- Check .env configuration

---

## PAGINATION DEFAULTS

```
Default page: 1
Default limit: 20
Maximum limit: 100
Total results: calculated from database count
Total pages: Math.ceil(total / limit)
```

---

## VALIDATION CONSTRAINTS

### Text Fields
- Minimum 2 characters
- Maximum 255 characters
- No special characters (except spaces, hyphens)

### Email
- Valid email format
- Unique in database

### Phone
- Valid phone number format
- 10-20 characters

### Slug
- Lowercase with hyphens
- No spaces or special characters
- Unique in category table

### Amounts
- Float with 2 decimal places
- Minimum 0
- No negative values

### IDs
- Integer type
- Positive values only
- Must exist in database

---

## DATABASE INDEXES

Queries are optimized with indexes on:
- `users.email`
- `users.status`
- `categories.slug`
- `categories.type`
- `orders.user_id`
- `orders.status`
- `orders.created_at`
- `payments.order_id`
- `payments.status`
- `payments.transaction_id`

---

## PERFORMANCE TIPS

1. Always use pagination for list endpoints
2. Filter by status for faster queries
3. Use slug instead of ID for categories when possible
4. Cache frequently accessed categories
5. Implement request rate limiting for API protection

---

## DEPLOYMENT CHECKLIST

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Create admin user
- [ ] Test all endpoints
- [ ] Set up CORS properly
- [ ] Enable HTTPS
- [ ] Configure rate limiting
- [ ] Set up error logging
- [ ] Configure backup strategy
- [ ] Test authentication flow
