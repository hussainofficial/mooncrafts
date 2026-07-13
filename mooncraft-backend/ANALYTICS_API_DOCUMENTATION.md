# MOONCRAFT Analytics API Documentation

## Overview

The Analytics API provides comprehensive metrics and aggregated data for the admin dashboard. All analytics endpoints require authentication and admin role authorization.

**Base URL:** `http://localhost:5000/api/v1`

**Authentication:** All endpoints require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

**Authorization:** Only admin users can access these endpoints.

---

## Response Format

All responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // endpoint-specific data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

---

## Order Analytics

### Get Order Statistics
**Endpoint:** `GET /api/v1/orders/admin/analytics`

**Description:** Get aggregated order statistics including order counts by status and revenue metrics.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "total": 50,
    "pending": 5,
    "processing": 10,
    "shipped": 15,
    "delivered": 18,
    "cancelled": 2,
    "totalRevenue": 125000,
    "averageOrderValue": 2500
  }
}
```

**Response Fields:**
- `total` (number): Total number of orders
- `pending` (number): Count of pending orders
- `processing` (number): Count of processing orders
- `shipped` (number): Count of shipped orders
- `delivered` (number): Count of delivered orders
- `cancelled` (number): Count of cancelled orders
- `totalRevenue` (number): Sum of order amounts excluding cancelled orders
- `averageOrderValue` (number): Average order value excluding cancelled orders

---

## Payment Analytics

### Get Payment Statistics
**Endpoint:** `GET /api/v1/payments/admin/analytics`

**Description:** Get aggregated payment statistics including payment counts by status and payment method breakdown.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "total": 50,
    "completed": 45,
    "pending": 3,
    "failed": 1,
    "refunded": 1,
    "totalRevenue": 125000,
    "paymentMethods": {
      "creditCard": 20,
      "debitCard": 15,
      "upi": 10,
      "wallet": 5
    }
  }
}
```

**Response Fields:**
- `total` (number): Total number of payment records
- `completed` (number): Count of completed payments
- `pending` (number): Count of pending payments
- `failed` (number): Count of failed payments
- `refunded` (number): Count of refunded payments
- `totalRevenue` (number): Sum of completed payment amounts
- `paymentMethods` (object): Payment method breakdown
  - `creditCard` (number): Credit card payments
  - `debitCard` (number): Debit card payments
  - `upi` (number): UPI payments
  - `wallet` (number): Wallet payments

---

### Get Payment Method Breakdown
**Endpoint:** `GET /api/v1/analytics/payments/methods`

**Description:** Get detailed breakdown of payment methods with counts and amounts.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "method": "credit_card",
      "count": 20,
      "totalAmount": 50000,
      "averageAmount": 2500
    },
    {
      "method": "debit_card",
      "count": 15,
      "totalAmount": 37500,
      "averageAmount": 2500
    },
    {
      "method": "upi",
      "count": 10,
      "totalAmount": 25000,
      "averageAmount": 2500
    },
    {
      "method": "wallet",
      "count": 5,
      "totalAmount": 12500,
      "averageAmount": 2500
    }
  ]
}
```

---

### Get Daily Revenue
**Endpoint:** `GET /api/v1/analytics/payments/daily-revenue`

**Description:** Get daily revenue data for a specified number of days.

**Parameters:**
- `days` (query, optional, default: 30, range: 1-365): Number of days to retrieve

**Example Request:**
```
GET /api/v1/analytics/payments/daily-revenue?days=30
```

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "date": "2024-01-15",
      "transactionCount": 5,
      "dailyTotal": 12500
    },
    {
      "date": "2024-01-14",
      "transactionCount": 3,
      "dailyTotal": 7500
    }
  ]
}
```

---

## Product Analytics

### Get Product Statistics
**Endpoint:** `GET /api/v1/products/admin/analytics`

**Description:** Get aggregated product statistics including inventory and pricing information.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "totalProducts": 100,
    "inStock": 85,
    "outOfStock": 15,
    "stockPercentage": "85.00",
    "totalInventoryValue": 5000000,
    "averagePrice": 50000,
    "maxPrice": 500000,
    "minPrice": 5000
  }
}
```

**Response Fields:**
- `totalProducts` (number): Total number of products
- `inStock` (number): Number of products with stock > 0
- `outOfStock` (number): Number of products with stock = 0
- `stockPercentage` (string): Percentage of products in stock
- `totalInventoryValue` (number): Total value of all inventory
- `averagePrice` (number): Average product price
- `maxPrice` (number): Maximum product price
- `minPrice` (number): Minimum product price

---

### Get Top Products
**Endpoint:** `GET /api/v1/analytics/products/top`

**Description:** Get top products sorted by various metrics.

**Parameters:**
- `sortBy` (query, optional, default: 'price', values: 'price', 'sales', 'stock'): Sort metric
- `limit` (query, optional, default: 10, range: 1-50): Number of products to retrieve

**Example Requests:**
```
GET /api/v1/analytics/products/top?sortBy=price&limit=10
GET /api/v1/analytics/products/top?sortBy=sales&limit=5
```

**Response (sorted by price):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": 1,
      "name": "Premium Diamond Ring",
      "price": 500000,
      "stock": 5,
      "categoryId": 1,
      "inStock": true
    }
  ]
}
```

**Response (sorted by sales):**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": 2,
      "name": "Gold Necklace",
      "price": 50000,
      "stock": 10,
      "categoryId": 2,
      "totalSold": 150,
      "totalQuantity": 150,
      "totalRevenue": 7500000
    }
  ]
}
```

---

## User Analytics

### Get User Statistics
**Endpoint:** `GET /api/v1/users/admin/analytics`

**Description:** Get aggregated user statistics including counts by status and role.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "total": 500,
    "active": 450,
    "inactive": 40,
    "banned": 10,
    "admins": 5,
    "regularUsers": 495
  }
}
```

**Response Fields:**
- `total` (number): Total number of users
- `active` (number): Count of active users
- `inactive` (number): Count of inactive users
- `banned` (number): Count of banned users
- `admins` (number): Count of admin users
- `regularUsers` (number): Count of regular users

---

### Get Top Customers
**Endpoint:** `GET /api/v1/analytics/users/top-customers`

**Description:** Get top customers sorted by spending.

**Parameters:**
- `limit` (query, optional, default: 10, range: 1-50): Number of customers to retrieve

**Example Request:**
```
GET /api/v1/analytics/users/top-customers?limit=10
```

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "orderCount": 10,
      "totalSpent": 50000,
      "averageOrderValue": 5000
    }
  ]
}
```

---

### Get Daily Registrations
**Endpoint:** `GET /api/v1/analytics/users/daily-registrations`

**Description:** Get daily user registration data for a specified number of days.

**Parameters:**
- `days` (query, optional, default: 30, range: 1-365): Number of days to retrieve

**Example Request:**
```
GET /api/v1/analytics/users/daily-registrations?days=30
```

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "date": "2024-01-15",
      "registrations": 5
    },
    {
      "date": "2024-01-14",
      "registrations": 3
    }
  ]
}
```

---

## Category Analytics

### Get Category Analytics
**Endpoint:** `GET /api/v1/analytics/categories`

**Description:** Get category performance metrics including product counts and sales data.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": 1,
      "name": "Rings",
      "productCount": 25,
      "totalStock": 150,
      "inStockCount": 23,
      "averagePrice": 50000,
      "totalUnitsSold": 500
    },
    {
      "id": 2,
      "name": "Necklaces",
      "productCount": 20,
      "totalStock": 100,
      "inStockCount": 18,
      "averagePrice": 75000,
      "totalUnitsSold": 300
    }
  ]
}
```

---

### Get Inventory Value by Category
**Endpoint:** `GET /api/v1/analytics/inventory`

**Description:** Get inventory value breakdown by category.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "id": 1,
      "name": "Rings",
      "productCount": 25,
      "totalUnits": 150,
      "totalValue": 7500000,
      "averagePrice": 50000
    }
  ]
}
```

---

## Sales Analytics

### Get Monthly Revenue
**Endpoint:** `GET /api/v1/analytics/monthly-revenue`

**Description:** Get monthly revenue data.

**Parameters:**
- `months` (query, optional, default: 12, range: 1-24): Number of months to retrieve

**Example Request:**
```
GET /api/v1/analytics/monthly-revenue?months=12
```

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": [
    {
      "month": "2024-01",
      "orderCount": 50,
      "totalRevenue": 125000,
      "averageOrderValue": 2500
    }
  ]
}
```

---

### Get Conversion Metrics
**Endpoint:** `GET /api/v1/analytics/conversion`

**Description:** Get conversion metrics showing percentage of users who became customers.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "totalUsers": 500,
    "totalCustomers": 150,
    "conversionRate": "30.00"
  }
}
```

**Response Fields:**
- `totalUsers` (number): Total registered users
- `totalCustomers` (number): Users who have made at least one purchase
- `conversionRate` (string): Conversion rate as percentage

---

## Dashboard Analytics

### Get Complete Dashboard Analytics
**Endpoint:** `GET /api/v1/analytics/dashboard`

**Description:** Get comprehensive dashboard analytics combining all key metrics and top performers.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "overview": {
      "totalRevenue": 125000,
      "totalOrders": 50,
      "totalUsers": 500,
      "conversionRate": "30.00"
    },
    "orders": {
      "total": 50,
      "pending": 5,
      "processing": 10,
      "shipped": 15,
      "delivered": 18,
      "cancelled": 2,
      "totalRevenue": 125000,
      "averageOrderValue": 2500
    },
    "payments": {
      "total": 50,
      "completed": 45,
      "pending": 3,
      "failed": 1,
      "refunded": 1,
      "totalRevenue": 125000,
      "paymentMethods": {
        "creditCard": 20,
        "debitCard": 15,
        "upi": 10,
        "wallet": 5
      }
    },
    "products": {
      "totalProducts": 100,
      "inStock": 85,
      "outOfStock": 15,
      "stockPercentage": "85.00",
      "totalInventoryValue": 5000000,
      "averagePrice": 50000,
      "maxPrice": 500000,
      "minPrice": 5000
    },
    "users": {
      "total": 500,
      "active": 450,
      "inactive": 40,
      "banned": 10,
      "admins": 5,
      "regularUsers": 495
    },
    "topProducts": [
      {
        "id": 1,
        "name": "Premium Diamond Ring",
        "price": 500000,
        "stock": 5,
        "categoryId": 1,
        "inStock": true
      }
    ],
    "topCustomers": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "orderCount": 10,
        "totalSpent": 50000,
        "averageOrderValue": 5000
      }
    ],
    "conversionMetrics": {
      "totalUsers": 500,
      "totalCustomers": 150,
      "conversionRate": "30.00"
    }
  }
}
```

---

## Error Handling

### Common Error Responses

**Unauthorized (Missing or Invalid Token):**
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```
Status Code: `401`

**Forbidden (Non-Admin User):**
```json
{
  "success": false,
  "message": "Admin access required"
}
```
Status Code: `403`

**Invalid Request:**
```json
{
  "success": false,
  "message": "Invalid request parameter"
}
```
Status Code: `400`

**Server Error:**
```json
{
  "success": false,
  "message": "Failed to get [resource]: error details"
}
```
Status Code: `500`

---

## Best Practices

### 1. Pagination
For date-range queries (daily revenue, registrations), consider implementing client-side pagination with the `days` parameter:
- Default: 30 days
- Maximum: 365 days
- For longer periods, query in chunks of 90 days

### 2. Caching
Consider caching dashboard analytics for 5-10 minutes to reduce database load during peak usage.

### 3. Rate Limiting
Implement rate limiting on analytics endpoints, especially the comprehensive dashboard endpoint.

### 4. Permission Checks
The backend automatically checks for admin role. Verify token validity on the frontend before making requests.

---

## Code Examples

### JavaScript/Fetch
```javascript
// Get dashboard analytics
const getDashboardAnalytics = async (token) => {
  const response = await fetch('http://localhost:5000/api/v1/analytics/dashboard', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};

// Get top products
const getTopProducts = async (token, sortBy = 'price', limit = 10) => {
  const params = new URLSearchParams({ sortBy, limit });
  const response = await fetch(
    `http://localhost:5000/api/v1/analytics/products/top?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
  
  return await response.json();
};
```

### Angular/HttpClient
```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = 'http://localhost:5000/api/v1';

  constructor(private http: HttpClient) {}

  getDashboardAnalytics() {
    return this.http.get(`${this.apiUrl}/analytics/dashboard`);
  }

  getTopProducts(sortBy: string = 'price', limit: number = 10) {
    return this.http.get(`${this.apiUrl}/analytics/products/top`, {
      params: { sortBy, limit: limit.toString() }
    });
  }

  getOrderAnalytics() {
    return this.http.get(`${this.apiUrl}/orders/admin/analytics`);
  }

  getPaymentAnalytics() {
    return this.http.get(`${this.apiUrl}/payments/admin/analytics`);
  }
}
```

---

## Version History

- **v1.0** - Initial release with core analytics endpoints
  - Order analytics
  - Payment analytics
  - Product analytics
  - User analytics
  - Category analytics
  - Sales analytics
  - Comprehensive dashboard endpoint

---

## Support

For issues or questions about the Analytics API, please contact the backend development team or create an issue in the project repository.
