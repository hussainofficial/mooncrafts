# Top Products API - Test Examples

## Overview
This document provides practical examples for testing the new `GET /api/v1/products/admin/top-products` endpoint using various tools and methods.

## Prerequisites

Before testing, ensure:
1. Backend server is running on `http://localhost:3000` (adjust port as needed)
2. You have a valid JWT token with admin role
3. Database has products and reviews data
4. Authentication middleware is configured

## Sample JWT Token
For testing, you'll need an admin JWT token. Example:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBsdXhvcmEuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzE5MTAxMjAwfQ.xxx
```

## Test Scenarios

### Scenario 1: Get Top 10 Most Expensive Products (Default)

#### cURL
```bash
curl -X GET "http://localhost:3000/api/v1/products/admin/top-products" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### PowerShell
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/v1/products/admin/top-products" `
  -Method Get `
  -Headers $headers

$products = $response.Content | ConvertFrom-Json
$products.data | Format-Table -Property id, name, price, category, rating, reviews
```

#### JavaScript/Fetch
```javascript
async function getTopProducts() {
  const token = 'YOUR_JWT_TOKEN_HERE';
  
  try {
    const response = await fetch('http://localhost:3000/api/v1/products/admin/top-products', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Top Products:', data.data);
    console.log('Count:', data.count);
    return data;
  } catch (error) {
    console.error('Error fetching top products:', error);
  }
}

getTopProducts();
```

#### Axios
```javascript
const axios = require('axios');

const token = 'YOUR_JWT_TOKEN_HERE';

axios.get('http://localhost:3000/api/v1/products/admin/top-products', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Top Products:', response.data.data);
})
.catch(error => {
  console.error('Error:', error.response?.data || error.message);
});
```

---

### Scenario 2: Get Top 5 Highest-Rated Products

#### cURL
```bash
curl -X GET "http://localhost:3000/api/v1/products/admin/top-products?limit=5&sortBy=rating&order=DESC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### PowerShell
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$uri = "http://localhost:3000/api/v1/products/admin/top-products?limit=5&sortBy=rating&order=DESC"

$response = Invoke-WebRequest `
  -Uri $uri `
  -Method Get `
  -Headers $headers

$products = $response.Content | ConvertFrom-Json
$products.data | Format-Table -Property name, rating, reviews
```

#### JavaScript with Query Parameters
```javascript
async function getTopRatedProducts(limit = 5) {
  const token = 'YOUR_JWT_TOKEN_HERE';
  const params = new URLSearchParams({
    limit: limit,
    sortBy: 'rating',
    order: 'DESC'
  });

  const response = await fetch(
    `http://localhost:3000/api/v1/products/admin/top-products?${params}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  return await response.json();
}

getTopRatedProducts(5).then(data => {
  console.log('Top Rated Products:', data.data);
});
```

---

### Scenario 3: Get Top 20 Most Reviewed Products

#### cURL
```bash
curl -X GET "http://localhost:3000/api/v1/products/admin/top-products?limit=20&sortBy=reviews&order=DESC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

#### PowerShell
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{ "Authorization" = "Bearer $token" }

$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/v1/products/admin/top-products?limit=20&sortBy=reviews&order=DESC" `
  -Method Get `
  -Headers $headers

$data = $response.Content | ConvertFrom-Json
$data.data | Sort-Object -Property reviews -Descending | Format-Table -Property name, reviews, rating
```

---

### Scenario 4: Get Lowest Stock Products (Ascending Order)

#### cURL
```bash
curl -X GET "http://localhost:3000/api/v1/products/admin/top-products?limit=15&sortBy=stock&order=ASC" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### PowerShell
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{ "Authorization" = "Bearer $token" }

$response = Invoke-WebRequest `
  -Uri "http://localhost:3000/api/v1/products/admin/top-products?limit=15&sortBy=stock&order=ASC" `
  -Method Get `
  -Headers $headers

$data = $response.Content | ConvertFrom-Json
$data.data | Format-Table -Property name, stock, inStock, price
```

---

### Scenario 5: Test Invalid Parameters

#### Test Invalid Limit (should return 400)
```bash
# Limit too high (> 100)
curl -X GET "http://localhost:3000/api/v1/products/admin/top-products?limit=150" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Expected Response:
# {
#   "success": false,
#   "message": "Limit must be between 1 and 100"
# }
```

#### Test Invalid sortBy
```bash
curl -X GET "http://localhost:3000/api/v1/products/admin/top-products?sortBy=invalid_field" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Expected Response:
# {
#   "success": false,
#   "message": "sortBy must be one of: price, rating, reviews, stock, created_at"
# }
```

#### Test Invalid Order
```bash
curl -X GET "http://localhost:3000/api/v1/products/admin/top-products?order=INVALID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"

# Expected Response:
# {
#   "success": false,
#   "message": "order must be ASC or DESC"
# }
```

---

### Scenario 6: Test Authentication

#### Missing Authorization Header
```bash
curl -X GET "http://localhost:3000/api/v1/products/admin/top-products"

# Expected Response (401):
# {
#   "success": false,
#   "message": "Unauthorized"
# }
```

#### Invalid JWT Token
```bash
curl -X GET "http://localhost:3000/api/v1/products/admin/top-products" \
  -H "Authorization: Bearer invalid_token"

# Expected Response (401):
# {
#   "success": false,
#   "message": "Invalid token"
# }
```

#### Non-Admin User Token
```bash
# If token is for a regular user (role: 'user'), should get:
# Expected Response (403):
# {
#   "success": false,
#   "message": "Access denied. Admin role required."
# }
```

---

## Test Automation

### Jest Test Suite Example
```javascript
// top-products.test.js
const request = require('supertest');
const app = require('../src/app');

describe('GET /api/v1/products/admin/top-products', () => {
  let adminToken;

  beforeAll(async () => {
    // Get admin token (implement based on your auth setup)
    adminToken = 'your_admin_token_here';
  });

  describe('Success Cases', () => {
    test('should return top 10 products by price', async () => {
      const response = await request(app)
        .get('/api/v1/products/admin/top-products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.count).toBeLessThanOrEqual(10);
    });

    test('should sort by rating descending', async () => {
      const response = await request(app)
        .get('/api/v1/products/admin/top-products')
        .query({ sortBy: 'rating', order: 'DESC' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const ratings = response.body.data.map(p => p.rating);
      expect(ratings).toEqual([...ratings].sort((a, b) => b - a));
    });

    test('should include category information', async () => {
      const response = await request(app)
        .get('/api/v1/products/admin/top-products')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      response.body.data.forEach(product => {
        expect(product).toHaveProperty('category');
        expect(product).toHaveProperty('rating');
        expect(product).toHaveProperty('reviews');
      });
    });
  });

  describe('Error Cases', () => {
    test('should return 400 for limit > 100', async () => {
      const response = await request(app)
        .get('/api/v1/products/admin/top-products')
        .query({ limit: 150 })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Limit must be between 1 and 100');
    });

    test('should return 400 for invalid sortBy', async () => {
      const response = await request(app)
        .get('/api/v1/products/admin/top-products')
        .query({ sortBy: 'invalid' })
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/products/admin/top-products')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});
```

---

### Postman Collection

Import this collection into Postman for easy testing:

```json
{
  "info": {
    "name": "Top Products API",
    "description": "Test collection for top products endpoint"
  },
  "item": [
    {
      "name": "Get Top 10 Products (Default)",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/api/v1/products/admin/top-products",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{jwt_token}}"
          }
        ]
      }
    },
    {
      "name": "Get Top 5 Highest Rated",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/v1/products/admin/top-products?limit=5&sortBy=rating&order=DESC",
          "host": ["{{base_url}}"],
          "path": ["api", "v1", "products", "admin", "top-products"],
          "query": [
            {"key": "limit", "value": "5"},
            {"key": "sortBy", "value": "rating"},
            {"key": "order", "value": "DESC"}
          ]
        },
        "header": [
          {"key": "Authorization", "value": "Bearer {{jwt_token}}"}
        ]
      }
    },
    {
      "name": "Get Most Reviewed Products",
      "request": {
        "method": "GET",
        "url": {
          "raw": "{{base_url}}/api/v1/products/admin/top-products?limit=20&sortBy=reviews&order=DESC"
        },
        "header": [
          {"key": "Authorization", "value": "Bearer {{jwt_token}}"}
        ]
      }
    }
  ]
}
```

---

## Performance Testing

### Load Testing with Apache Bench
```bash
# Test with 100 requests, 10 concurrent
ab -n 100 -c 10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3000/api/v1/products/admin/top-products
```

### Load Testing with Apache JMeter
1. Create a new Test Plan
2. Add HTTP Sampler:
   - Server Name: localhost
   - Port: 3000
   - Path: /api/v1/products/admin/top-products
   - Method: GET
3. Add HTTP Header Manager:
   - Authorization: Bearer YOUR_JWT_TOKEN
4. Add Listeners (View Results Tree, Aggregate Report)

---

## Response Analysis

### Sample Success Response
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Diamond Ring Premium",
      "price": 75000,
      "category": "Rings",
      "image": "https://example.com/diamond-ring.jpg",
      "rating": 4.8,
      "reviews": 156,
      "inStock": true,
      "stock": 8,
      "description": "Luxury diamond ring..."
    },
    {
      "id": 2,
      "name": "Gold Necklace Exclusive",
      "price": 65000,
      "category": "Necklaces",
      "image": "https://example.com/gold-necklace.jpg",
      "rating": 4.6,
      "reviews": 132,
      "inStock": true,
      "stock": 12,
      "description": "18K gold necklace..."
    }
  ],
  "count": 2,
  "pagination": {
    "limit": 10,
    "sortBy": "price",
    "order": "DESC"
  }
}
```

### Key Validations
- [ ] `success` is `true`
- [ ] `data` is an array
- [ ] Each product has all required fields
- [ ] `price` is a number
- [ ] `rating` is between 0-5
- [ ] `reviews` is a non-negative integer
- [ ] `inStock` matches `stock > 0`
- [ ] `count` matches array length
- [ ] `pagination` matches request parameters

---

## Troubleshooting Test Issues

### Issue: 401 Unauthorized
**Solution**:
- Verify JWT token is valid and not expired
- Check Authorization header format: `Bearer <token>`
- Ensure token has admin role

### Issue: 403 Forbidden
**Solution**:
- Token is valid but user is not admin
- Create admin user or get admin token

### Issue: 400 Bad Request
**Solution**:
- Check query parameters are valid
- Verify parameter types (numbers vs strings)
- Review error message for specific issue

### Issue: Slow Response
**Solution**:
- Check database performance
- Verify indexes are created
- Monitor server resources
- Check database query execution plan

### Issue: Inconsistent Sorting
**Solution**:
- Verify sorting field values in database
- Check for NULL values
- Review COALESCE logic for ratings
- Test with sample data

---

## Cleanup After Testing

### Reset Test Data
```sql
-- Clear reviews for testing
DELETE FROM reviews WHERE product_id IN (
  SELECT id FROM products WHERE name LIKE '%test%'
);

-- Delete test products
DELETE FROM products WHERE name LIKE '%test%';

-- Verify data
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM reviews;
```

---

## Next Steps

After successful testing:
1. Document any issues found
2. Update API documentation if needed
3. Deploy to staging environment
4. Conduct user acceptance testing
5. Deploy to production
6. Monitor performance in production
