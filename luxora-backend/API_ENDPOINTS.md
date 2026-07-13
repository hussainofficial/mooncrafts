# LUXORA Backend API Documentation

## API Base URL
```
http://localhost:5000/api/v1
```

## Authentication
All protected endpoints require:
```
Authorization: Bearer <access_token>
```

---

## 1. USER MANAGEMENT APIs

### Public Endpoints
- **Health Check** - `GET /users/health`
  - Response: `{ success: true, message: "User service is running" }`

### User Profile Endpoints (Requires Authentication)

- **Get Current User Profile** - `GET /users/profile`
  - Response: 
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

- **Get Single User** - `GET /users/:userId` (Admin or self)
  - Params: `userId` (integer)
  - Response: `{ success: true, user: {...} }`

- **Update Current Profile** - `PUT /users/profile`
  - Body: `{ fullName?, phone?, profileImage? }`
  - Response: `{ success: true, message: "Profile updated successfully", user: {...} }`

- **Update User** - `PUT /users/:userId` (Admin only)
  - Params: `userId` (integer)
  - Body: `{ name?, phone?, role?, status? }`
  - Note: role must be 'user' or 'admin', status must be 'active', 'inactive', or 'banned'
  - Response: `{ success: true, message: "User updated successfully", user: {...} }`

- **Change Password** - `PUT /users/password`
  - Body: `{ currentPassword, newPassword }`
  - Response: `{ success: true, message: "Password changed successfully" }`

- **Delete User** - `DELETE /users/:userId` (Admin only)
  - Params: `userId` (integer)
  - Response: `{ success: true, message: "User deleted successfully" }`

### Admin User Management Endpoints

- **Get All Users** - `GET /users?page=1&limit=20`
  - Query: `page`, `limit`
  - Response: 
  ```json
  {
    "success": true,
    "data": [
      { "id": 1, "email": "user@example.com", "name": "John", "phone": "1234567890", "role": "user", "status": "active" }
    ],
    "pagination": { "total": 100, "page": 1, "limit": 20, "pages": 5 }
  }
  ```

- **Search Users** - `GET /users/admin/search?q=john&page=1&limit=20`
  - Query: `q` (search term, min 2 chars), `page`, `limit`
  - Response: Same as Get All Users

- **Get Users by Role** - `GET /users/admin/by-role?role=admin&page=1&limit=20`
  - Query: `role` (user|admin), `page`, `limit`
  - Response: Same as Get All Users

- **Get Users by Status** - `GET /users/admin/by-status?status=active&page=1&limit=20`
  - Query: `status` (active|inactive|banned), `page`, `limit`
  - Response: Same as Get All Users

---

## 2. CATEGORY MANAGEMENT APIs

### Public Endpoints

- **List All Categories** - `GET /categories?page=1&limit=20`
  - Query: `page`, `limit`
  - Response: 
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "name": "Gold",
        "slug": "gold",
        "description": "Beautiful gold jewelry",
        "type": "material",
        "is_active": true,
        "product_count": 25
      }
    ],
    "pagination": { "total": 50, "page": 1, "limit": 20, "pages": 3 }
  }
  ```

- **Get Active Categories** - `GET /categories/active/list`
  - Response: Same as List All Categories (only active=true)

- **Get Categories by Type** - `GET /categories/by-type/:type?page=1&limit=20`
  - Params: `type` (material|type|collection)
  - Query: `page`, `limit`
  - Response: Same as List All Categories

- **Get Category by Slug** - `GET /categories/by-slug/:slug`
  - Params: `slug` (string)
  - Response: `{ success: true, data: {...} }`

- **Get Category by ID** - `GET /categories/:categoryId`
  - Params: `categoryId` (integer)
  - Response: `{ success: true, data: {...} }`

### Admin Endpoints (Requires Authentication & Admin Role)

- **Create Category** - `POST /categories`
  - Body: `{ name, slug, description?, type }`
  - Note: type must be 'material', 'type', or 'collection'
  - Response: `{ success: true, message: "Category created successfully", categoryId: 1 }`

- **Update Category** - `PUT /categories/:categoryId`
  - Params: `categoryId` (integer)
  - Body: `{ name?, slug?, description?, type?, is_active? }`
  - Response: `{ success: true, message: "Category updated successfully", data: {...} }`

- **Delete Category** - `DELETE /categories/:categoryId`
  - Params: `categoryId` (integer)
  - Response: `{ success: true, message: "Category deleted successfully" }`

- **Get All Categories (Admin)** - `GET /categories/admin/all?page=1&limit=20`
  - Query: `page`, `limit`
  - Response: Same as List All Categories

---

## 3. ORDER MANAGEMENT APIs

### User Endpoints (Requires Authentication)

- **Create Order** - `POST /orders`
  - Body: 
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
  - Response: 
  ```json
  {
    "success": true,
    "message": "Order created successfully",
    "data": {
      "id": 1,
      "user_id": 1,
      "status": "pending",
      "total_amount": 10000.00,
      "items": [...],
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
  ```

- **Get My Orders** - `GET /orders/user/my-orders?page=1&limit=20`
  - Query: `page`, `limit`
  - Response: 
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "status": "pending",
        "total_amount": 10000.00,
        "created_at": "2024-01-01T00:00:00Z",
        "items": [...]
      }
    ],
    "pagination": { "total": 10, "page": 1, "limit": 20, "pages": 1 }
  }
  ```

- **Get Order Details** - `GET /orders/:orderId`
  - Params: `orderId` (integer)
  - Response: `{ success: true, message: "Operation successful", data: {...} }`

- **Cancel Order** - `PUT /orders/:orderId/cancel`
  - Params: `orderId` (integer)
  - Note: Can only cancel pending or processing orders
  - Response: `{ success: true, message: "Order cancelled successfully", data: {...} }`

### Admin Endpoints (Requires Authentication & Admin Role)

- **Get All Orders** - `GET /orders/admin/all?page=1&limit=20&status=pending`
  - Query: `page`, `limit`, `status?` (pending|processing|shipped|delivered|cancelled)
  - Response: Same as Get My Orders

- **Update Order Status** - `PUT /orders/admin/:orderId/status`
  - Params: `orderId` (integer)
  - Body: `{ status }` (pending|processing|shipped|delivered|cancelled)
  - Response: `{ success: true, message: "Order status updated", data: {...} }`

- **Get Order Statistics** - `GET /orders/admin/stats`
  - Response: 
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": {
      "totalOrders": 100,
      "totalRevenue": 500000.00,
      "pendingCount": 10,
      "shippedCount": 20
    }
  }
  ```

---

## 4. PAYMENT MANAGEMENT APIs

### Public Endpoints

- **Get Payment Methods** - `GET /payments/methods`
  - Response: 
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": [
      { "id": "card", "name": "Credit/Debit Card", "icon": "💳" },
      { "id": "upi", "name": "UPI", "icon": "📱" },
      { "id": "netbanking", "name": "Net Banking", "icon": "🏦" },
      { "id": "wallet", "name": "Digital Wallet", "icon": "👛" },
      { "id": "cod", "name": "Cash on Delivery", "icon": "🚚" }
    ]
  }
  ```

- **Get UPI Apps** - `GET /payments/upi-apps`
  - Response: List of UPI applications

### User Endpoints (Requires Authentication)

- **Process Payment** - `POST /payments/process`
  - Body: 
  ```json
  {
    "orderId": 1,
    "amount": 10000.00,
    "paymentMethod": "card",
    "transactionId": "txn_12345" (optional)
  }
  ```
  - Response: 
  ```json
  {
    "success": true,
    "message": "Payment processed successfully",
    "data": {
      "id": 1,
      "order_id": 1,
      "amount": 10000.00,
      "status": "completed",
      "payment_method": "card",
      "transaction_id": "txn_12345",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
  ```

- **Verify Payment** - `GET /payments/verify/:transactionId`
  - Params: `transactionId` (string)
  - Response: 
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": {
      "id": 1,
      "status": "completed",
      "amount": 10000.00,
      "method": "card",
      "transactionId": "txn_12345",
      "orderId": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

- **Get Payment by Order** - `GET /payments/order/:orderId`
  - Params: `orderId` (integer)
  - Response: `{ success: true, message: "Operation successful", data: {...} }`

- **Get My Payments** - `GET /payments/user/list?page=1&limit=20`
  - Query: `page`, `limit`
  - Response: 
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": [
      {
        "id": 1,
        "order_id": 1,
        "amount": 10000.00,
        "status": "completed",
        "payment_method": "card",
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": { "total": 10, "page": 1, "limit": 20, "pages": 1 }
  }
  ```

### Admin Endpoints (Requires Authentication & Admin Role)

- **Get All Payments** - `GET /payments/admin/all?page=1&limit=20&status=completed`
  - Query: `page`, `limit`, `status?` (pending|completed|failed|cancelled)
  - Response: Same as Get My Payments

- **Get Payment Statistics** - `GET /payments/admin/stats`
  - Response: 
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": {
      "totalPayments": 50,
      "totalRevenue": 500000.00,
      "pendingCount": 5,
      "failedCount": 2
    }
  }
  ```

- **Get Daily Revenue** - `GET /payments/admin/revenue?days=30`
  - Query: `days?` (default: 30)
  - Response: 
  ```json
  {
    "success": true,
    "message": "Operation successful",
    "data": [
      {
        "date": "2024-01-01",
        "transaction_count": 10,
        "daily_total": 50000.00
      }
    ]
  }
  ```

---

## Error Responses

All endpoints return error responses in the format:
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- `200 OK` - Successful GET/PUT requests
- `201 CREATED` - Successful POST requests
- `400 BAD REQUEST` - Invalid input or validation errors
- `401 UNAUTHORIZED` - Missing or invalid authentication token
- `403 FORBIDDEN` - Insufficient permissions (not admin for admin endpoints)
- `404 NOT FOUND` - Resource not found
- `409 CONFLICT` - Resource already exists (e.g., duplicate slug)
- `500 INTERNAL SERVER ERROR` - Server error

---

## Validation Rules

### User
- **name**: Minimum 2 characters
- **phone**: Valid phone number format
- **role**: Must be 'user' or 'admin'
- **status**: Must be 'active', 'inactive', or 'banned'

### Category
- **name**: Minimum 2 characters
- **slug**: Must be a valid slug format
- **type**: Must be 'material', 'type', or 'collection'

### Order
- **items**: Array with at least 1 item
- **items[].productId**: Valid integer
- **items[].quantity**: Integer >= 1
- **items[].price**: Float >= 0
- **totalAmount**: Float >= 0
- **paymentMethod**: Valid payment method

### Payment
- **orderId**: Valid integer
- **amount**: Float >= 0
- **paymentMethod**: Must be valid (card|upi|netbanking|wallet|cod)

---

## Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Admin endpoints: 1000 requests per 15 minutes

## Pagination
All list endpoints support:
- `page` (default: 1)
- `limit` (default: 20, max: 100)

Response includes:
```json
{
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "pages": 5
  }
}
```

---

## Environment Variables Required
```
DATABASE_HOST=localhost
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=luxora_jewelry
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:4200
PORT=5000
```
