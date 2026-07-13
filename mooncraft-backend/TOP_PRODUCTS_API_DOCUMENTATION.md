# Top Products API Endpoint Documentation

## Overview
The Top Products endpoint provides a way to retrieve the highest-value or highest-rated products from the database with complete details including category and rating information. This endpoint is designed for admin dashboards and frontend showcase sections.

## Endpoint Details

### Route
```
GET /api/v1/products/admin/top-products
```

### Authentication
- **Required**: Yes
- **Type**: JWT Bearer Token
- **Role Required**: Admin

### Query Parameters

| Parameter | Type | Default | Description | Constraints |
|-----------|------|---------|-------------|-------------|
| `limit` | integer | 10 | Number of products to return | 1-100 |
| `sortBy` | string | 'price' | Field to sort by | 'price', 'rating', 'reviews', 'stock', 'created_at' |
| `order` | string | 'DESC' | Sort order | 'ASC' or 'DESC' |

### Example Requests

#### Get top 10 most expensive products (default)
```bash
GET /api/v1/products/admin/top-products
Authorization: Bearer <jwt_token>
```

#### Get top 5 highest-rated products
```bash
GET /api/v1/products/admin/top-products?limit=5&sortBy=rating&order=DESC
Authorization: Bearer <jwt_token>
```

#### Get top 20 products with most reviews
```bash
GET /api/v1/products/admin/top-products?limit=20&sortBy=reviews&order=DESC
Authorization: Bearer <jwt_token>
```

#### Get products sorted by stock (ascending)
```bash
GET /api/v1/products/admin/top-products?limit=15&sortBy=stock&order=ASC
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Diamond Ring",
      "price": 50000.00,
      "category": "Rings",
      "image": "https://example.com/images/diamond-ring.jpg",
      "rating": 4.5,
      "reviews": 120,
      "inStock": true,
      "stock": 10,
      "description": "Beautiful premium diamond ring with elegant design..."
    },
    {
      "id": 2,
      "name": "Gold Necklace",
      "price": 45000.00,
      "category": "Necklaces",
      "image": "https://example.com/images/gold-necklace.jpg",
      "rating": 4.3,
      "reviews": 95,
      "inStock": true,
      "stock": 15,
      "description": "Elegant 18K gold necklace with sophisticated design..."
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

### Error Responses

#### Invalid limit parameter (400 Bad Request)
```json
{
  "success": false,
  "message": "Limit must be between 1 and 100"
}
```

#### Invalid sortBy parameter (400 Bad Request)
```json
{
  "success": false,
  "message": "sortBy must be one of: price, rating, reviews, stock, created_at"
}
```

#### Invalid order parameter (400 Bad Request)
```json
{
  "success": false,
  "message": "order must be ASC or DESC"
}
```

#### Unauthorized (401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

#### Forbidden - Not Admin (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

#### Server Error (500 Internal Server Error)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Response Fields Explanation

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Indicates if the request was successful |
| `data` | array | Array of product objects |
| `data[].id` | integer | Product unique identifier |
| `data[].name` | string | Product name |
| `data[].price` | number | Product price in base currency |
| `data[].category` | string | Category name (from categories table) |
| `data[].image` | string | Product image URL |
| `data[].rating` | number | Average rating (0-5) |
| `data[].reviews` | integer | Total number of reviews |
| `data[].inStock` | boolean | Product availability status |
| `data[].stock` | integer | Current stock quantity |
| `data[].description` | string | Full product description |
| `count` | integer | Number of products returned |
| `pagination` | object | Pagination and sorting information |
| `pagination.limit` | integer | Limit applied to the request |
| `pagination.sortBy` | string | Field used for sorting |
| `pagination.order` | string | Sort direction (ASC/DESC) |

## Implementation Details

### Database Query
The endpoint uses the following SQL logic:
1. Joins `products` table with `categories` to get category names
2. Left joins with `reviews` table to calculate average rating and review count
3. Filters for active products only (`is_active = TRUE`)
4. Groups by product to aggregate review data
5. Sorts by the specified field
6. Limits results to the specified count

### Security Measures
- Requires JWT authentication
- Requires admin role
- Validates all query parameters
- Prevents SQL injection through parameterized queries
- Limits maximum results to 100 products
- Enforces positive limit values

### Performance Considerations
- Uses database indexes on `category_id` and `material_id`
- Groups and aggregates reviews at database level
- Limits result set to prevent large data transfers
- Uses LEFT JOIN for optional review data

## Code Location

### Repository Method
**File**: `src/repositories/product.repository.js`
**Method**: `getTopProducts(limit, sortBy, order)`

### Controller Handler
**File**: `src/controllers/product.controller.js`
**Function**: `getTopProducts(req, res, next)`

### Route Definition
**File**: `src/routes/product.routes.js`
**Route**: `GET /admin/top-products`

## Material Support

### Current Implementation
Products are linked to categories via `category_id`. Categories can have a type of 'material', 'type', or 'collection'.

### Future Enhancement
A migration file `DATABASE_MIGRATION_MATERIAL_SUPPORT.sql` is available to add a dedicated `material_id` field to the products table. This allows:
- Products to have both a type category and a material category
- Better separation of material information
- Easier filtering by material

To enable material support, run the migration:
```sql
source DATABASE_MIGRATION_MATERIAL_SUPPORT.sql;
```

This will add:
- `material_id` column to products table
- Foreign key constraint to categories table
- Index for query performance

## Usage Examples

### Frontend Integration Example
```javascript
// JavaScript/TypeScript example
async function getTopProducts(limit = 10, sortBy = 'price', order = 'DESC') {
  const response = await fetch(
    `/api/v1/products/admin/top-products?limit=${limit}&sortBy=${sortBy}&order=${order}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// Usage
try {
  const topProducts = await getTopProducts(10, 'rating', 'DESC');
  console.log('Top rated products:', topProducts.data);
} catch (error) {
  console.error('Failed to fetch top products:', error);
}
```

### cURL Example
```bash
# Get top 10 most expensive products
curl -X GET \
  'http://localhost:3000/api/v1/products/admin/top-products' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

# Get top 5 highest-rated products
curl -X GET \
  'http://localhost:3000/api/v1/products/admin/top-products?limit=5&sortBy=rating&order=DESC' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

### PowerShell Example
```powershell
$headers = @{
    'Authorization' = 'Bearer your_jwt_token_here'
}

$response = Invoke-WebRequest `
  -Uri 'http://localhost:3000/api/v1/products/admin/top-products?limit=10&sortBy=price&order=DESC' `
  -Headers $headers `
  -Method GET

$products = $response.Content | ConvertFrom-Json
$products.data | Format-Table -AutoSize
```

## Testing Checklist

- [ ] Endpoint returns correct products sorted by price (default)
- [ ] Sorting by rating works correctly
- [ ] Sorting by reviews count works correctly
- [ ] Sorting by stock works correctly
- [ ] Limit parameter restricts results correctly
- [ ] ASC/DESC order works for all sort fields
- [ ] Invalid limit returns 400 error
- [ ] Invalid sortBy returns 400 error
- [ ] Invalid order returns 400 error
- [ ] Unauthorized requests return 401 error
- [ ] Non-admin users return 403 error
- [ ] Rating calculation is accurate
- [ ] Review count is accurate
- [ ] InStock status is correct based on stock > 0
- [ ] Category names are included correctly
- [ ] Images URLs are returned properly
- [ ] Product descriptions are included

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-06 | Initial implementation with price, rating, reviews, stock sorting |

## Related Endpoints

- `GET /api/v1/products` - List all products with pagination
- `GET /api/v1/products/:productId` - Get single product details
- `GET /api/v1/products/admin/stats` - Get product statistics
- `GET /api/v1/products/admin/low-stock` - Get low stock products
