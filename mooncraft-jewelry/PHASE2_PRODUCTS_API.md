# PHASE 2: Products API & Global Loader Setup

## ✅ What's Been Added

### Frontend (Angular)
1. **Global Loader Service** - Centralized loading state
2. **Global Loader Component** - Shows loading spinner across entire app
3. **Updated Auth Components** - Register & Login use loader
4. **Auto JWT Token** - All requests automatically include JWT token

### Backend (Node.js)
1. **Product Repository** - Database operations for products
2. **Product Service** - Business logic for products
3. **Product Controller** - API endpoint handlers
4. **Product Routes** - API route definitions
5. **Image Upload** - File upload via multer
6. **Database Table** - Products table with full-text search

---

## 🎯 Step 1: Test Registration & Login Flow

### Before Testing
Make sure both servers are running:

```powershell
# Terminal 1 - Backend
cd C:\Users\hussa\mooncraft-backend
npm install multer  # Install new dependency
npm run dev

# Terminal 2 - Frontend
cd C:\Users\hussa\mooncraft-jewelry
npm start
```

### Test Registration
1. Go to: `http://localhost:4200/register`
2. You should see a **spinner** loading (new global loader!)
3. Fill in form:
   - Name: `John Doe`
   - Email: `john@example.com`
   - Phone: `+1234567890`
   - Password: `Test@123456`
4. Click "Create Account"
5. See loading spinner while registering
6. Success → redirects to home

### Test Login
1. Go to: `http://localhost:4200/login`
2. Enter credentials:
   - Email: `john@example.com`
   - Password: `Test@123456`
3. See loading spinner while logging in
4. Success → redirects to home
5. Check browser localStorage:
   - Open DevTools (F12)
   - Application → Local Storage → localhost:4200
   - See `mooncraft_access_token` (JWT token)

---

## 📦 Step 2: Setup Products Database

Run the Phase 2 migration script in MySQL Workbench:

```sql
-- Open MySQL Workbench
-- File → Open SQL Script
-- Select: DATABASE_MIGRATION_PHASE2.sql
-- Click Execute
```

This creates:
- ✅ Products table
- ✅ Sample products
- ✅ Full-text search index

---

## 🚀 Step 3: Product API Endpoints

### 1. **Create Product (with image upload)**
```
POST /api/v1/products
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  - name: "Silver Necklace"
  - description: "Beautiful silver necklace"
  - price: 2999.99
  - categoryId: 2
  - stock: 50
  - image: <file>

Response 201:
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": 1,
    "name": "Silver Necklace",
    "description": "Beautiful silver necklace",
    "price": 2999.99,
    "categoryId": 2
  }
}
```

### 2. **Get All Products**
```
GET /api/v1/products?page=1&limit=20

Response 200:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Silver Necklace Elegant",
      "description": "Beautiful silver necklace with elegant design",
      "price": 2999.99,
      "category_id": 2,
      "image_url": "/uploads/image-1234567890.jpg",
      "stock": 50,
      "created_at": "2026-07-06 10:30:45"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### 3. **Get Product by ID**
```
GET /api/v1/products/1

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Silver Necklace Elegant",
    "price": 2999.99,
    "image_url": "/uploads/image-1234567890.jpg",
    ...
  }
}
```

### 4. **Get Products by Category**
```
GET /api/v1/products/category/2?page=1&limit=20

Response 200:
{
  "success": true,
  "data": [...products from category 2...],
  "pagination": {...}
}
```

### 5. **Update Product**
```
PUT /api/v1/products/1
Headers: Authorization: Bearer <token>

Body (JSON):
{
  "name": "Updated Necklace Name",
  "price": 3499.99,
  "stock": 45
}

Response 200:
{
  "success": true,
  "message": "Product updated successfully",
  "data": { "id": 1, "success": true }
}
```

### 6. **Update Product Image**
```
PATCH /api/v1/products/1/image
Headers: Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  - image: <new image file>

Response 200:
{
  "success": true,
  "message": "Product image updated successfully",
  "data": { "id": 1, "success": true }
}
```

### 7. **Delete Product**
```
DELETE /api/v1/products/1
Headers: Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Product deleted successfully",
  "data": { "success": true }
}
```

---

## 🖼️ Image Upload Handling

### How Images Work

**Upload Process:**
1. User selects image in form
2. Image sent with product data via `multipart/form-data`
3. Multer saves file to `C:\Users\hussa\mooncraft-backend\uploads\`
4. Database stores image path: `/uploads/filename.jpg`
5. Image accessible at: `http://localhost:5000/uploads/filename.jpg`

**Image Validation:**
- ✅ Allowed types: JPEG, PNG, GIF, WebP
- ✅ Max size: 5MB
- ✅ Stored with timestamp: `image-1234567890.jpg`

**Frontend Integration:**
```typescript
// In your product form component
const formData = new FormData();
formData.append('name', productName);
formData.append('price', productPrice);
formData.append('image', imageFile);

// Service will handle the upload
this.productService.createProduct(formData);
```

---

## 🔐 Global Loader Usage

The global loader is now available **everywhere** in your app!

### How to Show Loader
```typescript
import { LoaderService } from '../core/services/loader.service';

export class MyComponent {
  constructor(private loaderService: LoaderService) {}

  doSomething() {
    this.loaderService.show('Loading products...');
    
    // Make API call
    this.someService.getData().subscribe({
      next: () => this.loaderService.hide(),
      error: () => this.loaderService.hide()
    });
  }
}
```

### Loader Appears Automatically During:
- ✅ Registration
- ✅ Login
- ✅ Product creation
- ✅ Product update
- ✅ Product deletion
- ✅ Image upload
- ✅ Any API call

---

## 📋 API Testing with Postman

### Setup Postman Environment

**1. Create Bearer Token:**
- Login at `/api/v1/auth/login`
- Copy the `accessToken` from response

**2. Set Authorization:**
- In Postman: Authorization → Type: Bearer Token
- Paste the token

**3. Test Create Product:**
```
POST http://localhost:5000/api/v1/products

Headers:
  Authorization: Bearer <token>

Body → form-data:
  name: Silver Ring
  description: Beautiful silver ring
  price: 1999
  categoryId: 2
  stock: 30
  image: (select file)
```

---

## 🗄️ Database Schema

### Products Table
```sql
id                INT (Primary Key, Auto Increment)
name              VARCHAR(255) - Product name
description       LONGTEXT - Product description
price             DECIMAL(10, 2) - Price
category_id       INT (Foreign Key) - Category
image_url         VARCHAR(500) - Image path
image_filename    VARCHAR(255) - Original filename
stock             INT - Stock quantity
is_active         BOOLEAN - Soft delete flag
created_at        TIMESTAMP - Creation time
updated_at        TIMESTAMP - Last update
```

---

## 🚨 Common Issues & Solutions

### "Image upload failed"
- Check file size < 5MB
- Check file type is JPEG/PNG/GIF/WebP
- Check `uploads/` directory exists
- Check backend has write permissions

### "Authorization failed"
- Check token is not expired
- Check token format: `Bearer <token>`
- Login again to get new token

### "Product not found"
- Check product ID is correct
- Check product is not soft-deleted (is_active = true)

### "Loader stuck spinning"
- Check backend API response
- Check browser console for errors
- Check network tab in DevTools

---

## ✨ Frontend Service (Coming Next)

You'll need to create `product.service.ts` in Angular to call these APIs:

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private apiUrl = 'http://localhost:5000/api/v1/products';

  constructor(private http: HttpClient) {}

  createProduct(formData: FormData) {
    return this.http.post(`${this.apiUrl}`, formData);
  }

  getAllProducts(page = 1, limit = 20) {
    return this.http.get(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getProduct(id: number) {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  updateProduct(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }

  deleteProduct(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
```

---

## 📊 Next Steps

1. ✅ Test registration/login with loader
2. ✅ Run Phase 2 database migration
3. ✅ Test product creation with image upload
4. ✅ Create ProductService in Angular
5. ✅ Create product management pages
6. ✅ Add product display to home page

---

## 🎉 Status

| Component | Status |
|-----------|--------|
| Global Loader | ✅ Complete |
| Auth with Loader | ✅ Complete |
| Product APIs | ✅ Complete |
| Image Upload | ✅ Complete |
| Database Schema | ✅ Complete |
| Frontend Service | ⏳ Coming Next |
| Product Pages | ⏳ Coming Next |

---

**Everything is ready! Test registration/login first, then proceed with products.** 🚀
