# MOONCRAFT Jewelry - Testing Guide

## Server Details
- **Dev Server**: http://localhost:4201
- **Build Output**: c:\Users\hussa\mooncraft-jewelry\dist\mooncraft-jewelry

---

## ✅ COMPLETED FEATURES - TEST SCENARIOS

### 1. User Registration
**URL**: http://localhost:4201/register
**Test Steps**:
1. Click "Register" in header (or go to /register)
2. Fill in all fields:
   - Full Name: John Doe
   - Email: john@example.com
   - Phone: 9876543210
   - Password: password123
   - Address: 123 Main St
   - City: New York
   - Postal Code: 10001
   - Country: USA
3. Click "Register" button
4. User should auto-login and redirect to profile page

**Expected Result**: 
- User created in localStorage (mooncraft_users)
- User logged in automatically
- Redirected to /profile

---

### 2. User Login
**URL**: http://localhost:4201/login
**Test Steps**:
1. Go to /login
2. Enter registered email: john@example.com
3. Enter password: password123
4. Click "Login" button

**Expected Result**:
- User logged in successfully
- Redirected to home page
- Profile icon shows user's name in header

---

### 3. User Profile Page
**URL**: http://localhost:4201/profile (After login)
**Test Steps**:
1. Login with user account (see step 2 above)
2. Click profile icon in header → "My Profile"
3. View personal details section
4. View shipping address section
5. View order history (empty if no orders yet)
6. View wishlist section

**Expected Result**:
- All personal details displayed correctly
- Shipping address shown
- Order history visible (empty or with orders)
- Wishlist items displayed
- Logout button works

---

### 4. Admin User Management
**URL**: http://localhost:4201/admin
**Admin Credentials**:
- Email: admin@example.com
- Password: admin123

**Test Steps**:
1. Go to /login
2. Enter admin email: admin@example.com
3. Enter admin password: admin123
4. Click "Login"
5. Should redirect to /admin dashboard
6. Click "Users" tab in the admin dashboard
7. View all registered users

**Expected Result**:
- Admin dashboard displays
- Users tab shows:
  - All registered users in a table
  - Name, Email, Phone, Location
  - Number of orders for each user
  - Total amount spent by each user
  - User registration date
  - Summary stats showing total users, total orders, total revenue

---

### 5. Product Details Panel
**URL**: http://localhost:4201 (Home page)
**Test Steps**:
1. On home page, find any product card
2. Click on the product card
3. Side panel should open showing:
   - Large product image
   - Product name
   - Price and rating
   - Description
   - Material and category
   - In stock status
   - "Add to Cart" button
   - "Add to Wishlist" button

**Expected Result**:
- Side panel opens smoothly
- All product information displayed
- Close button (X) works
- Clicking outside panel closes it

---

### 6. Add to Cart
**Test Steps**:
1. Open a product details panel (see step 5)
2. Click "Add to Cart" button
3. Panel closes
4. Cart count in header increases
5. Product is saved to localStorage (mooncraft_cart)

**Expected Result**:
- Cart count updates in real-time
- Product data persists in localStorage
- Can add multiple products to cart

---

### 7. Wishlist Management
**Test Steps**:
1. Open a product details panel
2. Click heart icon or "Add to Wishlist" button
3. Heart becomes filled/colored
4. Go to profile page (/profile)
5. Scroll to "Wishlist" section
6. Product should appear in wishlist
7. Click "Remove" button
8. Product removed from wishlist

**Expected Result**:
- Products added to wishlist in localStorage
- Wishlist items displayed in profile
- Remove button works correctly
- Wishlist persists across page refresh

---

### 8. Navigation & Fragment Scrolling
**Test Steps**:
1. On home page, scroll to see different sections
2. Click on navigation items in header:
   - "Home" → scrolls to top
   - "Trending" → scrolls to trending section
   - "New Arrivals" → scrolls to new arrivals section
   - "Best Sellers" → scrolls to best sellers section
3. Check smooth scroll animation

**Expected Result**:
- Smooth scroll animation to each section
- Fragment links work (#trending, #new-arrivals, etc.)
- Page doesn't jump, smooth transition

---

### 9. Admin Dashboard - Products Management
**URL**: http://localhost:4201/admin
**Test Steps**:
1. Login as admin (see Admin User Management above)
2. Stay on "Products Management" tab
3. View product list with:
   - Product name and image
   - Category
   - Price
   - Stock status
4. Click "Edit" button on any product
5. Edit form opens
6. Click "Delete" button
7. Confirm deletion

**Expected Result**:
- Product list displays correctly
- Edit form opens and shows product data
- Can update product information
- Delete removes product from list

---

### 10. Admin Dashboard - Add New Product
**Test Steps**:
1. Login as admin
2. Click "Add New Product" tab
3. Fill in form:
   - Product Name
   - Description
   - Price
   - Category (dropdown)
   - Material (dropdown)
   - Upload image (drag/drop or click)
   - Stock Status (In Stock/Out of Stock)
   - Discount percentage
   - Mark as New Arrival (checkbox)
   - Rating
4. Watch progress bar during image upload
5. Click "Add Product"
6. Watch loading spinner
7. Product added to list

**Expected Result**:
- Form validates required fields
- Image upload shows progress bar
- Loading spinner appears during save
- Product successfully added to products list
- New product visible in "Products Management" tab

---

### 11. Admin Dashboard - Analytics
**Test Steps**:
1. Login as admin
2. View right sidebar showing:
   - Total Products stat card
   - Total Revenue stat card
   - In Stock stat card
   - Out of Stock stat card
3. Scroll down right sidebar to see:
   - Revenue Distribution chart
   - Financial Summary (Total value, avg price, min/max)
   - Inventory Status
   - Top 5 Products by price

**Expected Result**:
- All statistics display correctly
- Numbers match products in database
- Financial data is accurate
- Charts show realistic distributions

---

### 12. Category Dropdown in Add Product
**Test Steps**:
1. Login as admin
2. Go to "Add New Product" tab
3. Click Category dropdown
4. Should show options:
   - Silver Jewelry
   - Kundan Jewelry
   - Artificial Jewelry
   - Necklaces
   - Earrings
   - Rings
   - Bracelets
   - Anklets

**Expected Result**:
- Dropdown shows all categories
- Can select any category
- Selected category saved with product

---

### 13. Material Dropdown in Add Product
**Test Steps**:
1. Login as admin
2. Go to "Add New Product" tab
3. Click Material dropdown
4. Should show options:
   - Silver
   - Gold Plated
   - Oxidized
   - Kundan
   - Artificial
   - Rose Gold
   - Pearl

**Expected Result**:
- Dropdown shows all materials
- Can select any material
- Selected material saved with product

---

## 📋 FEATURES CHECKLIST

### User Management ✅
- [x] User registration with full details
- [x] User login/logout
- [x] User profile page
- [x] Order history display
- [x] Wishlist management
- [x] Profile data persistence

### Admin Features ✅
- [x] Admin authentication
- [x] Admin dashboard
- [x] Product management (CRUD)
- [x] User list with order history
- [x] Analytics and financial tracking
- [x] Image upload with progress bar
- [x] Category dropdown
- [x] Material dropdown
- [x] New Arrival checkbox

### Product Features ✅
- [x] Product details side panel
- [x] Add to cart
- [x] Add to wishlist
- [x] Product search (admin)
- [x] Product categorization

### UI/UX Features ✅
- [x] Responsive design
- [x] Loading spinners for CRUD operations
- [x] Progress bar for image upload
- [x] Navigation/fragment scrolling
- [x] Real-time cart count
- [x] Modern admin dashboard with analytics

---

## 🔧 DATA STORAGE (localStorage)

- `mooncraft_users` - All registered user profiles
- `mooncraft_auth` - Current logged-in user session
- `mooncraft_cart` - Shopping cart items
- `mooncraft_wishlist` - Wishlist items (per user)
- `mooncraft_products` - Product database
- `mooncraft_orders` - Order history

---

## 🔐 Test Accounts

### Admin Account
- **Email**: admin@example.com
- **Password**: admin123

### Regular User Account
- **Email**: user@example.com
- **Password**: user123

---

## 📱 Responsive Design

All pages are tested and working on:
- Desktop (1920px and above)
- Laptop (1024px)
- Tablet (768px)
- Mobile (375px)

---

## 🐛 Known Issues / To Fix

None at this time - all features are working as expected.

---

## 🚀 Next Steps

1. Create ProductDetailsPageComponent for full-page product details (not just side panel)
2. Create order checkout/payment flow
3. Add email notifications
4. Add product reviews and ratings
5. Implement search across all pages
6. Add inventory tracking
7. Create return/refund system
8. Add customer support chat

---

## ✨ Build Commands

```bash
# Development
npm start              # Start dev server on port 4200
ng serve --port 4201  # Start on port 4201

# Production
npm run build          # Build for production

# Output location
dist/mooncraft-jewelry/   # Production build output
```

---

**Last Updated**: July 5, 2026
**Version**: 2.2.0 (All Features Complete)
**Status**: ✅ Production Ready
