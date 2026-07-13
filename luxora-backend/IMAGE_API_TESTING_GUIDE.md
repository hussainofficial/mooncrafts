# Image API Testing Guide

## Overview
The product API now properly stores and retrieves base64/blob image data in the `image` column.

## Database Schema Changes

### Old Schema (Broken)
```sql
ALTER TABLE products MODIFY COLUMN image VARCHAR(500);
-- No image_data column
```

### New Schema (Fixed)
```sql
ALTER TABLE products MODIFY COLUMN image LONGTEXT;
ADD COLUMN IF NOT EXISTS image_data LONGBLOB NULL;
```

The `image` column now stores:
- Full base64 data URLs: `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA...`
- Or image file paths if needed

## API Endpoints

### Create Product with Image
**Endpoint:** `POST /api/v1/products`
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "Diamond Ring",
  "description": "Beautiful solitaire diamond ring",
  "price": 5000.00,
  "categoryId": 1,
  "stock": 10,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "productId": 123,
  "data": {
    "id": 123,
    "name": "Diamond Ring",
    "description": "Beautiful solitaire diamond ring",
    "price": 5000.00,
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA...",
    "stock": 10,
    "category_id": 1,
    "status": "active",
    "created_at": "2026-07-07T10:00:00.000Z"
  }
}
```

### Get Product
**Endpoint:** `GET /api/v1/products/:productId`

**Response:**
```json
{
  "success": true,
  "product": {
    "id": 123,
    "name": "Diamond Ring",
    "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA...",
    "price": 5000.00,
    "stock": 10,
    "description": "Beautiful solitaire diamond ring"
  }
}
```

### Get Product Image (Dedicated Endpoint)
**Endpoint:** `GET /api/v1/products/:productId/image`

**Response:**
```json
{
  "success": true,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA..."
}
```

### Update Product with Image
**Endpoint:** `PUT /api/v1/products/:productId`
**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body (with new image):**
```json
{
  "name": "Premium Diamond Ring",
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAA..."
}
```

**Request Body (without image - keeps existing):**
```json
{
  "name": "Premium Diamond Ring",
  "price": 5500.00
}
```

## Testing with cURL

### 1. Create a Sample Base64 Image
Use this small PNG base64 string for testing:
```
data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==
```

### 2. Create Product with Image
```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Diamond Ring",
    "description": "A beautiful diamond ring",
    "price": 5000,
    "categoryId": 1,
    "stock": 10,
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }'
```

### 3. Retrieve Product with Image
```bash
curl http://localhost:5000/api/v1/products/1 \
  -H "Content-Type: application/json"
```

### 4. Get Just the Image
```bash
curl http://localhost:5000/api/v1/products/1/image \
  -H "Content-Type: application/json"
```

### 5. Update Product Image
```bash
curl -X PUT http://localhost:5000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
  }'
```

## Frontend Integration

### Example: Creating Product from File
```typescript
// In Angular
const file = inputElement.files[0];
const reader = new FileReader();

reader.onload = (event) => {
  const base64Image = event.target.result as string;
  
  this.http.post('/api/v1/products', {
    name: 'Diamond Ring',
    description: 'Beautiful ring',
    price: 5000,
    categoryId: 1,
    stock: 10,
    image: base64Image  // Already in data:image/jpeg;base64,XXX format
  }).subscribe(response => {
    console.log('Product created:', response.data);
    // Image is stored and returned as-is
  });
};

reader.readAsDataURL(file);
```

### Example: Displaying Product Image
```typescript
// In Angular component
product: any;
imageUrl: SafeUrl;

constructor(private sanitizer: DomSanitizer) {}

ngOnInit() {
  // Image is already a data URL string
  this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(this.product.image);
}
```

```html
<!-- In template -->
<img [src]="imageUrl" alt="Product">
```

## Validation Rules

### Image Format Validation
- Must be one of:
  1. Data URL: `data:image/<type>;base64,<base64_string>`
  2. Raw Base64: `<base64_string>` (converted to data URL automatically)
  3. Image Path: `/images/product.jpg` (file upload path)

### Image Size Limits
- Maximum payload size: **50MB** (configured in `app.js`)
- This accommodates large base64-encoded images
- Typical image: 100KB-2MB when base64 encoded

### Validation Implementation
```javascript
// Image validation in controller
if (image && typeof image === 'string') {
  if (image.startsWith('data:image') || /^[A-Za-z0-9+/=]+$/.test(image)) {
    // Valid format
  } else {
    return res.status(400).json({
      success: false,
      message: 'Invalid image format'
    });
  }
}
```

## Key Changes Made

### 1. Database Schema (`DATABASE_MIGRATION_PRODUCTS.sql`)
- Changed `image` column from `VARCHAR(500)` to `LONGTEXT`
- Added optional `image_data` column as `LONGBLOB`
- Allows storing full base64 data URLs

### 2. Product Controller (`product.controller.js`)
- **createProduct()**: Now stores full base64 data URL string instead of buffer
- **updateProduct()**: Handles image updates while preserving existing image if not provided
- **getProductImage()**: Returns stored image data as-is (no placeholder URLs)

### 3. Product Repository (`product.repository.js`)
- Updated queries to use `image` column instead of `image_data`
- Supports both data URLs and file paths

### 4. Product Routes (`product.routes.js`)
- Routes already support 50MB payload
- Added proper validation for image field
- Both POST and PUT routes accept image in request body

## Migration Steps for Existing Database

1. **Backup your database**
   ```bash
   mysqldump -u root -p luxora_db > backup.sql
   ```

2. **Run the migration**
   ```bash
   mysql -u root -p luxora_db < DATABASE_MIGRATION_IMAGE_FIX.sql
   ```

3. **Verify the changes**
   ```sql
   DESC products;
   -- Should show image as LONGTEXT and image_data as LONGBLOB
   ```

## Troubleshooting

### Issue: "Invalid image format"
- Ensure image is either:
  - Valid data URL: `data:image/jpeg;base64,XXX`
  - Valid base64 string without the prefix

### Issue: Image returns null
- Check if image was actually stored: `SELECT image FROM products WHERE id = 1;`
- If null, product was created without image
- Send image in next request using PUT /products/:id

### Issue: Image field too large error
- Increase MySQL `max_allowed_packet`:
  ```sql
  SET GLOBAL max_allowed_packet=67108864;  -- 64MB
  ```
- Or check your config in `/etc/mysql/my.cnf`:
  ```
  [mysqld]
  max_allowed_packet=67108864
  ```

### Issue: Payload too large error
- The Express limit is set to 50MB in `app.js`
- If you need larger, modify:
  ```javascript
  app.use(express.json({ limit: '100mb' }));
  ```

## Performance Considerations

### Storage
- Base64 encoded images are ~33% larger than binary
- Example: 1MB binary image = ~1.33MB when base64 encoded
- For large product catalogs, consider:
  - Storing images on cloud storage (S3, Google Cloud Storage)
  - Storing only image URLs/paths in database
  - Using dedicated image service/CDN

### Retrieval
- Current implementation returns full image data with product
- Consider pagination or lazy loading for product lists
- Use `/api/v1/products/:id/image` endpoint for image-only requests

### Database Size
Monitor your database growth:
```sql
SELECT 
  SUM(LENGTH(image)) / 1024 / 1024 AS size_mb 
FROM products 
WHERE image IS NOT NULL;
```

## Future Improvements

1. **Cloud Storage Integration**
   - Upload images to S3/Google Cloud Storage
   - Store URLs in database instead of full data

2. **Image Optimization**
   - Compress images before storing
   - Generate thumbnails
   - Support multiple image formats

3. **Caching Strategy**
   - Cache images in Redis
   - Implement image CDN
   - Browser caching with proper headers

4. **Image Validation**
   - Validate image MIME type
   - Check image dimensions
   - Scan for malicious content

5. **Batch Operations**
   - Support bulk product creation with images
   - Async image processing
   - Progress tracking for large uploads
