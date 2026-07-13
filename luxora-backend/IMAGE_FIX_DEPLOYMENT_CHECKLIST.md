# Image Storage Fix - Deployment Checklist

## Pre-Deployment

### Code Review
- [ ] Review changes in `src/controllers/product.controller.js`
- [ ] Review changes in `src/repositories/product.repository.js`
- [ ] Review changes in `src/routes/product.routes.js`
- [ ] Review database migration files
- [ ] Verify Express is configured with 50MB payload limit
- [ ] Check that all validation logic is in place

### Database Preparation
- [ ] Backup existing database
  ```bash
  mysqldump -u root -p luxora_db > backup_$(date +%Y%m%d).sql
  ```
- [ ] Verify MySQL `max_allowed_packet` setting
  ```sql
  SHOW VARIABLES LIKE 'max_allowed_packet';
  ```
- [ ] If needed, increase to 64MB+
  ```sql
  SET GLOBAL max_allowed_packet=67108864;
  ```

### Testing Environment
- [ ] Set up test environment with latest code
- [ ] Create test database from backup
- [ ] Run all database migrations
- [ ] Verify table schema

## Deployment

### Step 1: Code Deployment
- [ ] Deploy updated code to backend server:
  - [ ] `src/controllers/product.controller.js`
  - [ ] `src/repositories/product.repository.js`
  - [ ] `src/routes/product.routes.js`
- [ ] Run `npm install` if needed
- [ ] Verify no syntax errors: `npm run lint`

### Step 2: Database Migration
**For New Installations:**
```bash
mysql -u root -p luxora_db < DATABASE_MIGRATION_PRODUCTS.sql
```

**For Existing Installations:**
```bash
# Run the migration script
mysql -u root -p luxora_db < DATABASE_MIGRATION_IMAGE_FIX.sql

# Or manually execute:
mysql -u root -p luxora_db -e "ALTER TABLE products MODIFY COLUMN image LONGTEXT NULL;"
mysql -u root -p luxora_db -e "ALTER TABLE products ADD COLUMN IF NOT EXISTS image_data LONGBLOB NULL;"
```

- [ ] Verify migration completed successfully
- [ ] Check table structure:
  ```sql
  DESC products;
  -- Verify image is LONGTEXT
  -- Verify image_data exists as LONGBLOB
  ```

### Step 3: Backend Restart
- [ ] Stop backend service
- [ ] Verify service stopped
- [ ] Start backend service
- [ ] Check logs for errors
- [ ] Verify API is responding: `curl http://localhost:5000/api/health`

## Post-Deployment Verification

### API Testing
- [ ] Test product creation with base64 image
  ```bash
  curl -X POST http://localhost:5000/api/v1/products \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Test Product",
      "description": "Test",
      "price": 100,
      "categoryId": 1,
      "stock": 5,
      "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
    }'
  ```
  - [ ] Status code: 201
  - [ ] Response includes productId
  - [ ] Response includes created product data with image

- [ ] Test product retrieval
  ```bash
  curl http://localhost:5000/api/v1/products/PRODUCT_ID
  ```
  - [ ] Status code: 200
  - [ ] Image field contains base64 data URL
  - [ ] Image is not null/placeholder

- [ ] Test dedicated image endpoint
  ```bash
  curl http://localhost:5000/api/v1/products/PRODUCT_ID/image
  ```
  - [ ] Status code: 200
  - [ ] Returns base64 image data

- [ ] Test product update with new image
  ```bash
  curl -X PUT http://localhost:5000/api/v1/products/PRODUCT_ID \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "image": "data:image/png;base64,NEW_BASE64_DATA"
    }'
  ```
  - [ ] Status code: 200
  - [ ] Image updated in database
  - [ ] Other fields unchanged

- [ ] Test product update without image
  ```bash
  curl -X PUT http://localhost:5000/api/v1/products/PRODUCT_ID \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Updated Name"
    }'
  ```
  - [ ] Status code: 200
  - [ ] Name updated
  - [ ] Image unchanged (preserved)

### Database Verification
- [ ] Check data storage
  ```sql
  SELECT id, name, LENGTH(image) as image_size, 
         image LIKE 'data:image%' as is_data_url
  FROM products 
  WHERE image IS NOT NULL 
  LIMIT 5;
  ```
  - [ ] All images are data URLs
  - [ ] All images have reasonable size
  - [ ] No NULL images for products with images

- [ ] Verify migration didn't break existing data
  ```sql
  -- Check products created before and after
  SELECT COUNT(*) as total_products FROM products;
  SELECT COUNT(*) as products_with_images FROM products WHERE image IS NOT NULL;
  
  -- Verify no data corruption
  SELECT * FROM products WHERE image LIKE '<%' LIMIT 1;
  ```

### Frontend Testing
- [ ] Frontend can display product images
  - [ ] Test product listing page
  - [ ] Test product detail page
  - [ ] Verify no broken image icons
  - [ ] Check image displays correctly

- [ ] Frontend can create products with images
  - [ ] Upload image file
  - [ ] Convert to base64
  - [ ] Send to backend
  - [ ] Verify product created with image
  - [ ] Verify image displays in frontend

- [ ] Frontend can update products
  - [ ] Update product with new image
  - [ ] Verify new image displays
  - [ ] Update product without image change
  - [ ] Verify image unchanged

### Performance Check
- [ ] Monitor backend response times for product requests
  - [ ] Single product retrieval: < 100ms
  - [ ] Product list retrieval: < 500ms
  - [ ] Image endpoint: < 200ms

- [ ] Check database connection pool
  - [ ] No connection leaks
  - [ ] All connections returning properly

- [ ] Monitor disk/database size
  ```sql
  SELECT 
    SUM(LENGTH(image)) / 1024 / 1024 as image_storage_mb 
  FROM products;
  ```

## Rollback Plan (If Needed)

If critical issues occur:

### Option 1: Revert Code
```bash
# Revert to previous version
git checkout HEAD~1 -- src/controllers/product.controller.js
git checkout HEAD~1 -- src/repositories/product.repository.js
git checkout HEAD~1 -- src/routes/product.routes.js

# Restart backend
npm start
```

### Option 2: Restore Database
```bash
# Stop backend first
mysql -u root -p luxora_db < backup_20260707.sql
```

### Option 3: Undo Schema Changes (Keep Code)
```sql
-- Only revert if needed for compatibility
-- Existing data should be fine in LONGTEXT column
-- Just need to ensure code doesn't access image_data

ALTER TABLE products MODIFY COLUMN image VARCHAR(2000);
ALTER TABLE products DROP COLUMN image_data;
```

## Issue Resolution

### Issue: Image not storing
**Diagnosis:**
```sql
SELECT id, name, image FROM products WHERE id = LATEST_ID;
```

**If image is NULL:**
- Check request body was sent
- Check validation didn't reject it
- Check Express didn't truncate payload

**Solution:**
- Verify image data is being sent
- Check backend logs for validation errors
- Increase `max_allowed_packet` if needed

### Issue: Old products have no images
**Diagnosis:**
```sql
SELECT COUNT(*) FROM products WHERE image IS NULL;
```

**Solution:**
- This is expected if products were created before fix
- Can backfill later or regenerate products
- No data loss occurred

### Issue: Large images timing out
**Diagnosis:**
- Payload too large error
- Timeout during upload

**Solution:**
- Increase Express limit:
  ```javascript
  app.use(express.json({ limit: '100mb' }));
  ```
- Increase MySQL `max_allowed_packet`:
  ```sql
  SET GLOBAL max_allowed_packet=134217728;  -- 128MB
  ```

### Issue: Query execution error
**Diagnosis:**
```
ER_DATA_OUT_OF_RANGE or ER_DATA_TOO_LONG
```

**Solution:**
- MySQL packet size too small
- Or column was not properly altered
- Verify: `SHOW CREATE TABLE products\G`
- Re-run migration if needed

## Sign-Off

- [ ] All code changes reviewed and approved
- [ ] All tests passing
- [ ] Database migration successful
- [ ] API endpoints working correctly
- [ ] Frontend integration verified
- [ ] Performance acceptable
- [ ] Monitoring/alerts configured
- [ ] Documentation updated
- [ ] Team notified of changes

## Documentation

Generated documentation files:
- `IMAGE_FIX_QUICK_REFERENCE.md` - Quick reference for developers
- `IMAGE_API_TESTING_GUIDE.md` - Comprehensive testing and integration guide
- `IMAGE_STORAGE_FIX_SUMMARY.md` - Detailed technical summary
- `DATABASE_MIGRATION_IMAGE_FIX.sql` - Database migration script
- `DATABASE_MIGRATION_PRODUCTS.sql` - Updated schema definition

## Support & Monitoring

### Logs to Monitor
```bash
# Backend logs
tail -f logs/backend.log

# MySQL logs
tail -f /var/log/mysql/error.log

# Monitor queries
SHOW PROCESSLIST;
```

### Key Metrics
- Product creation latency
- Product retrieval latency
- Database size growth
- Image storage breakdown

### Escalation Contact
- Backend Lead: [Contact]
- Database Admin: [Contact]
- DevOps: [Contact]

## Timeline
- Deployment Date: [DATE]
- Testing Date: [DATE]
- Expected Rollout: [DATE]
- Estimated Downtime: 5-15 minutes (during migration)

## Notes
- Backend supports 50MB payloads (configurable)
- MySQL must have max_allowed_packet >= 64MB
- Images stored as base64 data URLs (not binary)
- No data loss expected in migration
- Backward compatible with existing code
