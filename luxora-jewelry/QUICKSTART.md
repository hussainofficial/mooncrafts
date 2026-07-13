# Quick Start Guide - LUXORA Jewelry E-Commerce

## Installation

```bash
cd luxora-jewelry
npm install
```

## Running the Development Server

```bash
ng serve --open
```

The application will open at `http://localhost:4200`

## Project Structure

### Key Directories

```
src/app/
├── core/
│   ├── models/              # TypeScript interfaces
│   └── services/
│       └── mock-data.service.ts    # Mock data provider
├── shared/
│   └── components/
│       ├── product-card.component.ts       # Reusable product card
│       ├── product-grid.component.ts       # Grid layout component
│       └── product-carousel.component.ts   # Carousel component
└── features/home/
    ├── components/
    │   ├── header.component.ts             # Navigation header
    │   ├── footer.component.ts             # Footer
    │   └── announcement-bar.component.ts   # Top bar
    └── sections/
        ├── hero-banner.component.ts        # Hero carousel
        ├── category-slider.component.ts    # Category section
        ├── trust-section.component.ts      # Trust badges
        ├── collections.component.ts        # Collections grid
        ├── material-grid.component.ts      # Materials grid
        ├── reviews-carousel.component.ts   # Reviews section
        └── newsletter.component.ts         # Newsletter signup
```

## Available Sections (All 17 Required Sections)

✅ **1. Announcement Bar** - Top sticky bar with announcements
✅ **2. Header** - Navigation with mega menu for Products
✅ **3. Hero Banner** - Full-width carousel with auto-slide
✅ **4. Shop by Category** - Horizontal scrollable categories
✅ **5. Trust Section** - 5 trust badges (Free Shipping, Secure Payment, etc.)
✅ **6. Trending Products** - Product carousel
✅ **7. Shop by Collection** - Collection cards (Bridal, Party Wear, etc.)
✅ **8. New Arrivals** - Grid of new products
✅ **9. Best Sellers** - Grid of best sellers
✅ **10. Featured Products** - Grid of featured products
✅ **11. Shop by Material** - Material grid (Silver, Gold, etc.)
✅ **12. Category Sections** - Dynamic sections for each category
✅ **13. Customer Reviews** - Reviews carousel
✅ **14. Instagram Gallery** - Gallery grid
✅ **15. Newsletter** - Email subscription form
✅ **16. Footer** - Footer with links
✅ **17. Mobile Responsive** - All sections responsive

## Styling

The project uses **Tailwind CSS** for styling. Configuration is in `tailwind.config.js`

### Key Classes Used
- `bg-rose-500` - Rose/pink colors (primary brand color)
- `rounded-2xl` - Large border radius
- `shadow-md`, `shadow-lg` - Soft shadows
- `group-hover:` - Hover states
- `transition-all duration-300` - Smooth animations

## Data Flow

All mock data comes from `src/app/core/services/mock-data.service.ts`

To switch to a real backend API:
1. Create `src/app/core/services/api.service.ts`
2. Replace MockDataService calls with API calls
3. Handle HTTP responses and errors

Example:
```typescript
// Instead of:
this.mockDataService.getProducts()

// Use:
this.apiService.getProducts()
```

## Component Communication

**Parent to Child:**
```typescript
@Input() products: Product[] = [];
```

**Child to Parent:**
```typescript
@Output() addToCart = new EventEmitter<Product>();
onAddToCart() {
  this.addToCart.emit(this.product);
}
```

## Responsive Breakpoints

Tailwind breakpoints used:
- **No prefix** - Mobile (< 640px)
- **md:** - Tablet (≥ 768px)
- **lg:** - Desktop (≥ 1024px)

## Signals (Angular 17+)

Components use Signals for reactive state:

```typescript
currentSlide = signal(0);

nextSlide() {
  this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
}
```

## Common Tasks

### Add a New Product
Edit `src/app/core/services/mock-data.service.ts` and add to the array returned by `getProducts()`.

### Change Colors
Edit `tailwind.config.js` in the `theme.extend.colors` section.

### Modify Product Card
Edit `src/app/shared/components/product-card.component.ts`

### Update Navigation Menu
Edit the `navItems` array in `src/app/features/home/components/header.component.ts`

## Performance Tips

1. **Image Optimization**: Compress images and use modern formats (WebP)
2. **Lazy Loading**: Can be added for sections below the fold
3. **Code Splitting**: Route-based code splitting for future pages
4. **Change Detection**: OnPush strategy for better performance

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Styles not applying?
```bash
npm run build
```

### Port 4200 already in use?
```bash
ng serve --port 4201
```

### Module not found errors?
```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Test in browser** - Run `ng serve` and check all sections
2. **Customize colors** - Update `tailwind.config.js`
3. **Replace mock data** - Connect to real backend API
4. **Add more products** - Update mock-data.service.ts
5. **Implement cart** - Create cart service and update components

## Support

For more details, see `CLAUDE.md` for architecture documentation.
