# Analytics API - Setup & Deployment Guide

## Pre-Deployment Checklist

### Database Requirements
- [ ] MySQL database is running
- [ ] Database connection configured in `config/database.js`
- [ ] All required tables exist:
  - `orders` - with columns: id, user_id, status, total_amount, created_at
  - `payments` - with columns: id, order_id, amount, payment_method, status, created_at
  - `products` - with columns: id, name, price, stock, category_id
  - `users` - with columns: id, email, name, role, status, created_at
  - `categories` - with columns: id, name

### Backend Requirements
- [ ] Node.js 14+ installed
- [ ] Express.js dependencies installed (`npm install`)
- [ ] Environment variables configured (`.env` file)
- [ ] Port 5000 available (or configured port)

### Authentication
- [ ] JWT secret configured
- [ ] Admin user created in database
- [ ] Auth middleware working

---

## Deployment Steps

### Step 1: Verify File Placement

All analytics files should be in place:

```
src/
├── repositories/
│   └── analytics.repository.js          ✓
├── services/
│   └── analytics.service.js             ✓
├── controllers/
│   └── analytics.controller.js          ✓
├── routes/
│   ├── analytics.routes.js              ✓
│   ├── order.routes.js                  ✓ (updated)
│   ├── payment.routes.js                ✓ (updated)
│   ├── product.routes.js                ✓ (updated)
│   ├── user.routes.js                   ✓ (updated)
│   └── ... other routes
└── app.js                               ✓ (updated)
```

### Step 2: Verify Database Connection

Test database connectivity:

```bash
# In backend directory
node -e "
const db = require('./config/database');
db.getConnection().then(conn => {
  console.log('✓ Database connected');
  conn.release();
  process.exit(0);
}).catch(err => {
  console.log('✗ Database connection failed:', err);
  process.exit(1);
});
"
```

### Step 3: Verify Tables & Data

Check that database tables have the required columns:

```sql
-- Check tables exist
SHOW TABLES LIKE 'orders';
SHOW TABLES LIKE 'payments';
SHOW TABLES LIKE 'products';
SHOW TABLES LIKE 'users';
SHOW TABLES LIKE 'categories';

-- Check for sample data
SELECT COUNT(*) as order_count FROM orders;
SELECT COUNT(*) as payment_count FROM payments;
SELECT COUNT(*) as product_count FROM products;
SELECT COUNT(*) as user_count FROM users;

-- Check for admin user
SELECT id, email, role FROM users WHERE role = 'admin' LIMIT 1;
```

### Step 4: Install Dependencies

Ensure all required packages are installed:

```bash
npm install
```

Required packages (verify in package.json):
- `express` - Web framework
- `mysql2` - Database driver
- `express-validator` - Input validation
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables
- `cors` - Cross-origin requests
- `helmet` - Security headers
- `morgan` - HTTP logging

### Step 5: Test Server Start

Start the backend server:

```bash
npm start
# or
node server.js
```

Expected output:
```
✓ Server running on port 5000
✓ Database connected
✓ CORS enabled
```

Check health endpoint:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

### Step 6: Create Test Token

Generate an admin JWT token for testing:

```bash
node -e "
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { id: 1, email: 'admin@example.com', role: 'admin' },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '1h' }
);
console.log('Test Token:', token);
"
```

Or use an existing admin user:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'
```

### Step 7: Test Analytics Endpoints

Run basic endpoint tests:

#### Using Curl
```bash
# Get order analytics
TOKEN="your_token_here"

curl -X GET "http://localhost:5000/api/v1/orders/admin/analytics" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"

# Get dashboard
curl -X GET "http://localhost:5000/api/v1/analytics/dashboard" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

#### Using Test Scripts
```bash
# Bash
chmod +x ANALYTICS_API_TEST_EXAMPLES.sh
./ANALYTICS_API_TEST_EXAMPLES.sh

# PowerShell
.\ANALYTICS_API_TEST_EXAMPLES.ps1
```

#### Expected Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* endpoint-specific data */ }
}
```

### Step 8: Verify All Endpoints

Quick endpoint verification:

```bash
# Variables
TOKEN="your_admin_token"
BASE_URL="http://localhost:5000/api/v1"

# Test 5 key endpoints
echo "Testing Order Analytics..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/orders/admin/analytics" | jq '.success'

echo "Testing Payment Analytics..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/payments/admin/analytics" | jq '.success'

echo "Testing Product Analytics..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/products/admin/analytics" | jq '.success'

echo "Testing User Analytics..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/users/admin/analytics" | jq '.success'

echo "Testing Dashboard Analytics..."
curl -s -H "Authorization: Bearer $TOKEN" "$BASE_URL/analytics/dashboard" | jq '.success'
```

---

## Configuration

### Environment Variables

Ensure `.env` file contains:

```env
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=luxora
DB_PORT=3306

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRY=1h
REFRESH_TOKEN_EXPIRY=7d

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4200
```

### Database Pool Configuration

Check `config/database.js` for connection pool settings:

```javascript
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,  // Adjust based on load
  queueLimit: 0
});
```

---

## Performance Tuning

### Database Indexes

Create indexes for better query performance:

```sql
-- Order analytics optimization
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Payment analytics optimization
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_payment_method ON payments(payment_method);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Product analytics optimization
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_category ON products(category_id);

-- User analytics optimization
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Order items for product analytics
CREATE INDEX idx_order_items_product ON order_items(product_id);
```

### Query Optimization

The analytics queries are already optimized with:
- Database-level aggregations (SUM, COUNT, AVG)
- Conditional aggregations (CASE WHEN)
- Proper JOIN operations
- Indexed columns in WHERE clauses

### Connection Pooling

Monitor connection usage:

```javascript
// Add monitoring to database.js
pool.on('connection', () => {
  console.log('Database connection created');
});

pool.on('error', (error) => {
  console.error('Database pool error:', error);
});
```

---

## Monitoring & Logging

### Enable Request Logging

Morgan middleware logs all HTTP requests. Check logs:

```bash
# Tail application logs
tail -f logs/app.log

# Or configure morgan output file
const fs = require('fs');
const stream = fs.createWriteStream('logs/app.log', { flags: 'a' });
app.use(morgan('combined', { stream }));
```

### Monitor Analytics Endpoints

Add endpoint usage tracking:

```javascript
// In analytics.controller.js
async getOrderAnalytics(req, res, next) {
  const startTime = Date.now();
  try {
    const data = await analyticsService.getOrderAnalytics();
    const duration = Date.now() - startTime;
    console.log(`Order Analytics query took ${duration}ms`);
    // ... rest of handler
  }
}
```

### Error Tracking

Errors are automatically caught and logged:

```javascript
catch (error) {
  console.error('Analytics Error:', error.message);
  res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: error.message
  });
}
```

---

## Integration with Frontend

### Update Angular Services

```typescript
// analytics.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private apiUrl = '/api/v1';

  constructor(private http: HttpClient) {}

  getDashboardAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/dashboard`);
  }

  getOrderAnalytics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/admin/analytics`);
  }

  getTopProducts(sortBy = 'price', limit = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/analytics/products/top`, {
      params: { sortBy, limit: limit.toString() }
    });
  }

  // ... more methods
}
```

### Update Angular Component

```typescript
// admin-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from 'src/app/services/analytics.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  dashboardData: any;
  loading = true;
  error: string | null = null;

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.analyticsService.getDashboardAnalytics().subscribe(
      (response) => {
        if (response.success) {
          this.dashboardData = response.data;
          this.loading = false;
        }
      },
      (error) => {
        this.error = 'Failed to load dashboard data';
        this.loading = false;
        console.error('Dashboard error:', error);
      }
    );
  }
}
```

---

## Troubleshooting

### Issue: Database Connection Fails

**Check:**
```bash
# Verify MySQL is running
mysql -h localhost -u root -p -e "SELECT 1"

# Check credentials in .env
cat .env | grep DB_

# Check database exists
mysql -h localhost -u root -p -e "SHOW DATABASES LIKE 'luxora';"
```

**Solution:**
- Start MySQL service
- Update `.env` with correct credentials
- Create database if missing: `CREATE DATABASE luxora;`

### Issue: 401 Unauthorized

**Check:**
```bash
# Verify token is valid
node -e "
const jwt = require('jsonwebtoken');
const token = 'your_token';
try {
  jwt.verify(token, process.env.JWT_SECRET || 'secret');
  console.log('Token valid');
} catch (e) {
  console.log('Token invalid:', e.message);
}
"
```

**Solution:**
- Generate new token
- Check JWT_SECRET matches
- Verify token not expired

### Issue: Empty Data Responses

**Check:**
```sql
-- Verify tables have data
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM payments;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM users;

-- Check if filtered correctly
SELECT * FROM orders WHERE status != 'cancelled' LIMIT 5;
```

**Solution:**
- Seed database with test data
- Check date ranges
- Verify status values are correct

### Issue: Slow Responses

**Check:**
```bash
# Monitor database slow queries
tail -f /var/log/mysql/slow.log

# Check indexes
SHOW INDEXES FROM orders;
SHOW INDEXES FROM payments;
```

**Solution:**
- Create recommended indexes (see above)
- Increase connection pool size
- Implement caching
- Monitor query execution times

---

## Production Deployment

### Pre-Production Checklist

- [ ] All analytics endpoints tested
- [ ] Database indexes created
- [ ] Error handling verified
- [ ] Security headers configured (Helmet)
- [ ] CORS properly configured
- [ ] JWT secrets in environment variables
- [ ] Request logging configured
- [ ] Performance tested with load
- [ ] Database backups configured
- [ ] Monitor/alert setup complete

### Production Configuration

```env
# Production Settings
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# Database
DB_POOL_SIZE=20
DB_QUEUE_LIMIT=0

# JWT
JWT_EXPIRY=24h
REFRESH_TOKEN_EXPIRY=30d

# CORS (adjust for frontend domain)
CORS_ORIGIN=https://luxora-frontend.com

# API Rate Limiting
RATE_LIMIT=100
RATE_WINDOW_MS=900000
```

### Deployment Commands

```bash
# Install dependencies
npm install --production

# Start server
npm start

# Or with PM2 for process management
npm install -g pm2
pm2 start server.js --name "luxora-api"
pm2 logs luxora-api

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## Verification After Deployment

Run final verification:

```bash
#!/bin/bash

BASE_URL="http://your-api-domain/api/v1"
TOKEN="your_admin_token"

echo "Running post-deployment verification..."

# Check 1: Health endpoint
echo -n "1. Health check... "
if curl -s $BASE_URL/health | grep -q "OK"; then
  echo "✓"
else
  echo "✗"
fi

# Check 2: Order analytics
echo -n "2. Order analytics... "
if curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/orders/admin/analytics | jq -e '.success' > /dev/null 2>&1; then
  echo "✓"
else
  echo "✗"
fi

# Check 3: Dashboard
echo -n "3. Dashboard analytics... "
if curl -s -H "Authorization: Bearer $TOKEN" $BASE_URL/analytics/dashboard | jq -e '.success' > /dev/null 2>&1; then
  echo "✓"
else
  echo "✗"
fi

# Check 4: Response time
echo -n "4. Response time... "
RESPONSE_TIME=$(curl -s -w "%{time_total}" -o /dev/null -H "Authorization: Bearer $TOKEN" $BASE_URL/analytics/dashboard)
if (( $(echo "$RESPONSE_TIME < 1" | bc -l) )); then
  echo "✓ (${RESPONSE_TIME}s)"
else
  echo "⚠ (${RESPONSE_TIME}s - slower than expected)"
fi

echo "Verification complete!"
```

---

## Support & Documentation

- **Quick Reference:** `ANALYTICS_QUICK_REFERENCE.md`
- **API Documentation:** `ANALYTICS_API_DOCUMENTATION.md`
- **Implementation Details:** `ANALYTICS_IMPLEMENTATION_SUMMARY.md`
- **Test Examples:** `ANALYTICS_API_TEST_EXAMPLES.sh` / `.ps1`

---

## Rollback Plan

If issues occur after deployment:

```bash
# Stop server
npm stop
# or
pm2 stop luxora-api

# Revert code to previous version
git checkout HEAD~1 src/routes/analytics.routes.js
git checkout HEAD~1 src/controllers/analytics.controller.js
git checkout HEAD~1 src/services/analytics.service.js
git checkout HEAD~1 src/repositories/analytics.repository.js
git checkout HEAD~1 src/app.js

# Restart
npm start
```

---

**Deployment Date:** [Your Date]  
**Deployed By:** [Your Name]  
**Version:** 1.0
