# Analytics API - Quick Reference Guide

## Overview
Complete analytics endpoints for admin dashboard with 14+ specialized endpoints and 1 comprehensive dashboard endpoint.

---

## Quick Start

### Authentication
All endpoints require admin JWT token:
```bash
Authorization: Bearer <admin_token>
```

### Base URL
```
http://localhost:5000/api/v1
```

---

## Essential Endpoints (Top 5)

### 1. Dashboard Overview
```bash
GET /analytics/dashboard
```
**Returns:** All key metrics in one response (orders, payments, products, users, top items)

### 2. Order Statistics
```bash
GET /orders/admin/analytics
```
**Returns:** Order counts by status + revenue metrics

### 3. Payment Statistics
```bash
GET /payments/admin/analytics
```
**Returns:** Payment counts by status + payment method breakdown

### 4. Product Statistics
```bash
GET /products/admin/analytics
```
**Returns:** Product count, stock levels, inventory value, pricing

### 5. User Statistics
```bash
GET /users/admin/analytics
```
**Returns:** User counts by status/role + active users

---

## Complete Endpoint Reference

### Orders
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/orders/admin/analytics` | GET | Order stats & revenue |

### Payments
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/payments/admin/analytics` | GET | Payment stats |
| `/analytics/payments/methods` | GET | Payment method breakdown |
| `/analytics/payments/daily-revenue?days=30` | GET | Daily revenue trends |

### Products
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/products/admin/analytics` | GET | Product stats & inventory |
| `/analytics/products/top?sortBy=price&limit=10` | GET | Top products (3 sort options) |

### Users
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/users/admin/analytics` | GET | User stats |
| `/analytics/users/top-customers?limit=10` | GET | Top customers by spending |
| `/analytics/users/daily-registrations?days=30` | GET | Daily registration trends |

### Categories
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analytics/categories` | GET | Category performance |
| `/analytics/inventory` | GET | Inventory value by category |

### Sales
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analytics/monthly-revenue?months=12` | GET | Monthly revenue trends |
| `/analytics/conversion` | GET | User to customer conversion |

### Dashboard
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/analytics/dashboard` | GET | Complete dashboard data |

---

## Query Parameters

### Days Parameter
- **Default:** 30
- **Range:** 1-365
- **Used In:**
  - `/analytics/payments/daily-revenue?days=30`
  - `/analytics/users/daily-registrations?days=30`

### Months Parameter
- **Default:** 12
- **Range:** 1-24
- **Used In:**
  - `/analytics/monthly-revenue?months=12`

### Limit Parameter
- **Default:** 10
- **Range:** 1-50
- **Used In:**
  - `/analytics/products/top?limit=10`
  - `/analytics/users/top-customers?limit=10`

### SortBy Parameter
- **Default:** price
- **Options:** 'price', 'sales', 'stock'
- **Used In:**
  - `/analytics/products/top?sortBy=sales`

---

## Response Format

### Success
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* endpoint-specific data */ }
}
```

### Error
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Common Response Examples

### Order Analytics
```json
{
  "total": 50,
  "pending": 5,
  "processing": 10,
  "shipped": 15,
  "delivered": 18,
  "cancelled": 2,
  "totalRevenue": 125000,
  "averageOrderValue": 2500
}
```

### Payment Analytics
```json
{
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
```

### Product Analytics
```json
{
  "totalProducts": 100,
  "inStock": 85,
  "outOfStock": 15,
  "stockPercentage": "85.00",
  "totalInventoryValue": 5000000,
  "averagePrice": 50000,
  "maxPrice": 500000,
  "minPrice": 5000
}
```

### User Analytics
```json
{
  "total": 500,
  "active": 450,
  "inactive": 40,
  "banned": 10,
  "admins": 5,
  "regularUsers": 495
}
```

---

## JavaScript Examples

### Fetch API
```javascript
// Dashboard
const response = await fetch('http://localhost:5000/api/v1/analytics/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();

// Top Products
const topProductsResponse = await fetch(
  'http://localhost:5000/api/v1/analytics/products/top?sortBy=sales&limit=5',
  { headers: { 'Authorization': `Bearer ${token}` } }
);
const topProducts = await topProductsResponse.json();
```

### Axios
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: { 'Authorization': `Bearer ${token}` }
});

// Get dashboard
const dashboard = await api.get('/analytics/dashboard');

// Get top customers
const topCustomers = await api.get('/analytics/users/top-customers', {
  params: { limit: 10 }
});
```

### Angular HttpClient
```typescript
import { HttpClient } from '@angular/common/http';

export class AnalyticsService {
  constructor(private http: HttpClient) {}

  getDashboard() {
    return this.http.get('/api/v1/analytics/dashboard');
  }

  getTopProducts(sortBy = 'price', limit = 10) {
    return this.http.get('/api/v1/analytics/products/top', {
      params: { sortBy, limit }
    });
  }
}
```

---

## HTTP Status Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 200 | Success | Request processed successfully |
| 400 | Bad Request | Invalid parameters, check query params |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Non-admin user |
| 500 | Server Error | Database/server issue |

---

## Curl Examples

### Order Analytics
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/orders/admin/analytics
```

### Top Products
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/v1/analytics/products/top?sortBy=sales&limit=5"
```

### Dashboard
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/v1/analytics/dashboard
```

### Daily Revenue (Last 7 days)
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/v1/analytics/payments/daily-revenue?days=7"
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check token validity and 'Bearer' prefix |
| 403 Forbidden | Verify user has admin role |
| Empty data | Check if database has data in required tables |
| Slow response | Check database indexes on created_at, status columns |
| NaN values | Check for null data, divisions by zero handled |

---

## Performance Tips

1. **Cache Dashboard Data:** Cache for 5-10 minutes
2. **Limit Results:** Use limit parameter to reduce data transfer
3. **Time-based Queries:** Split large date ranges (e.g., 90-day chunks)
4. **Pagination:** Implement client-side pagination for trends data
5. **Compression:** Enable gzip compression in browser

---

## File Locations

| File | Purpose |
|------|---------|
| `src/repositories/analytics.repository.js` | Database queries |
| `src/services/analytics.service.js` | Business logic |
| `src/controllers/analytics.controller.js` | HTTP handlers |
| `src/routes/analytics.routes.js` | Route definitions |
| `ANALYTICS_API_DOCUMENTATION.md` | Full documentation |
| `ANALYTICS_API_TEST_EXAMPLES.sh` | Bash test examples |
| `ANALYTICS_API_TEST_EXAMPLES.ps1` | PowerShell tests |

---

## Data Calculations

### Revenue (Orders)
- Includes orders with status: processing, shipped, delivered
- Excludes cancelled orders

### Revenue (Payments)
- Only completed payments counted
- Excludes pending, failed, refunded

### Stock Percentage
- `(inStock / totalProducts) * 100`

### Conversion Rate
- `(totalCustomers / totalUsers) * 100`
- Customer = user with at least 1 non-cancelled order

---

## Best Practices

1. ✅ Always include Authorization header
2. ✅ Validate query parameters on frontend
3. ✅ Handle errors gracefully in frontend
4. ✅ Cache dashboard data
5. ✅ Use specific endpoints when possible
6. ✅ Limit result sets with limit parameter
7. ✅ Use date parameters for trends
8. ✅ Parse numeric values from response

---

## Support

For detailed information, see:
- **Full API Docs:** `ANALYTICS_API_DOCUMENTATION.md`
- **Implementation Details:** `ANALYTICS_IMPLEMENTATION_SUMMARY.md`
- **Test Examples:** `ANALYTICS_API_TEST_EXAMPLES.sh` or `.ps1`

---

**Last Updated:** January 2024  
**Version:** 1.0
