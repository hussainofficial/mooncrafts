# LUXORA Jewelry - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Running

```bash
# Navigate to project directory
cd c:\Users\hussa\luxora-jewelry

# Install dependencies
npm install

# Start development server
npm start
# OR on a specific port if 4200 is taken:
ng serve --port 4201

# Navigate to http://localhost:4200 (or :4201 if using alternate port)
```

---

## 🎯 Quick Test Scenarios

### 1. User Registration & Profile (2 minutes)
```
1. Go to http://localhost:4200/register
2. Fill in form with any test data
3. Click Register
4. Auto-redirects to /profile
5. View your profile page
```

### 2. Login as Admin (1 minute)
```
1. Go to http://localhost:4200/login
2. Email: admin@example.com
3. Password: admin123
4. Should redirect to /admin dashboard
5. Click "Users" tab to see user management
```

### 3. Add Product to Cart (1 minute)
```
1. On home page, find any product card
2. Click the product
3. Side panel opens
4. Click "Add to Cart"
5. See cart count increase in header
```

### 4. Wishlist Management (1 minute)
```
1. Open product details panel
2. Click heart icon
3. Go to /profile
4. Scroll to Wishlist section
5. See product in wishlist
```

### 5. Admin Product Management (2 minutes)
```
1. Login as admin (see scenario 2)
2. Click "Products Management" tab
3. Click "Edit" on any product OR "Add New Product" tab
4. Fill form, upload image
5. Watch progress bar during upload
6. Click Save
7. Watch loading spinner
```

---

## 📌 Key URLs

| URL | Purpose | Access |
|-----|---------|--------|
| `/` | Home page | Public |
| `/register` | User registration | Public |
| `/login` | User login | Public |
| `/profile` | User profile (after login) | Authenticated Users |
| `/admin` | Admin dashboard | Admin Users Only |

---

## 🔐 Test Credentials

### Admin Account
```
Email:    admin@example.com
Password: admin123
```

### Sample User Account
```
Email:    user@example.com
Password: user123
```

### Or create your own
```
Go to /register and create a new account
```

---

## 🛠️ Build for Production

```bash
npm run build
# Output: dist/luxora-jewelry/

# Serve production build locally
cd dist/luxora-jewelry
python -m http.server 8000
# Navigate to http://localhost:8000
```

---

## 📂 Project Structure

```
luxora-jewelry/
├── src/
│   ├── app/
│   │   ├── core/              # Services, models, guards
│   │   ├── shared/            # Reusable components
│   │   ├── features/          # Page-specific components
│   │   ├── app.routes.ts      # Route definitions
│   │   └── app.config.ts      # App configuration
│   ├── styles.scss            # Global styles
│   └── index.html             # Main HTML
├── dist/                      # Production build output
├── CLAUDE.md                  # Project instructions
├── IMPLEMENTATION_SUMMARY.md  # Feature implementation details
├── TESTING_GUIDE.md          # Detailed testing guide
└── QUICK_START.md            # This file
```

---

## ✨ Main Features

### For Users
- ✅ Register and create account
- ✅ Login/logout
- ✅ View personal profile
- ✅ See order history
- ✅ Manage wishlist
- ✅ Add products to cart
- ✅ Browse products

### For Admins
- ✅ Full admin dashboard
- ✅ Create/edit/delete products
- ✅ Upload product images with progress tracking
- ✅ View all registered users
- ✅ View user order history
- ✅ See financial analytics
- ✅ Track inventory
- ✅ View revenue distribution

---

## 🐛 Troubleshooting

### Port 4200 already in use
```bash
# Use a different port
ng serve --port 4201
```

### Node modules issues
```bash
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### Build fails
```bash
# Clean build
ng build --configuration development
```

### localStorage issues
```javascript
// Clear all app data in browser console
localStorage.clear()
// Then refresh the page
```

---

## 📊 Data Storage

All data is stored in browser localStorage (no backend required for testing):

- **luxora_users** - User accounts
- **luxora_auth** - Current login session
- **luxora_products** - Product database
- **luxora_cart** - Shopping cart
- **luxora_wishlist** - Wishlist items

---

## 🎨 Technology Stack

- **Angular 17+** - Latest Angular framework
- **Signals** - Reactive state management
- **Tailwind CSS** - Utility-first styling
- **TypeScript** - Type-safe development
- **Standalone Components** - Modern component architecture

---

## 📞 Support

For detailed information on all features, see:
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- `TESTING_GUIDE.md` - Comprehensive testing guide
- `IMPLEMENTATION_COMPLETE.md` - Complete implementation details
- `CLAUDE.md` - Project architecture and guidelines

---

**Version:** 2.2.0
**Status:** ✅ Production Ready
**Last Updated:** July 5, 2026
