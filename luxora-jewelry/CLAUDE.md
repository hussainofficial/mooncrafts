# LUXORA Jewelry E-Commerce Platform

## Project Overview

LUXORA is a premium, elegant, female-focused jewelry e-commerce website built with Angular 17+, Signals, and Tailwind CSS. The project follows enterprise-level architecture with reusable components, scalable services, and clean separation of concerns.

## Architecture

### Folder Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # Data interfaces (Product, Category, etc.)
│   │   ├── services/        # Business logic (MockDataService)
│   │   ├── guards/          # Route guards (Future: auth guards)
│   │   └── interceptors/    # HTTP interceptors (Future)
│   ├── shared/
│   │   ├── components/      # Reusable components
│   │   ├── pipes/           # Custom pipes (Future)
│   │   └── directives/      # Custom directives (Future)
│   ├── features/
│   │   └── home/
│   │       ├── components/  # Page-specific components (Header, Footer, etc.)
│   │       ├── sections/    # Homepage sections (Hero, Category Slider, etc.)
│   │       └── home.component.ts  # Main homepage orchestrator
│   ├── app.ts              # Root component with RouterOutlet
│   ├── app.routes.ts       # Route definitions
│   └── app.config.ts       # App configuration
├── styles.scss             # Global styles + Tailwind directives
└── index.html              # Main HTML file
```

### Component Hierarchy

#### Page-Level Components
- **HomeComponent**: Orchestrates all homepage sections

#### Layout Components
- **AnnouncementBarComponent**: Sticky top announcement bar
- **HeaderComponent**: Navigation with mega menu
- **FooterComponent**: Footer with links and info

#### Section Components
- **HeroBannerComponent**: Full-width carousel banner
- **CategorySliderComponent**: Horizontal scrollable categories
- **TrustSectionComponent**: Trust badges section
- **CollectionsComponent**: Shop by collection cards
- **MaterialGridComponent**: Shop by material
- **ReviewsCarouselComponent**: Customer reviews carousel
- **NewsletterComponent**: Newsletter signup form

#### Reusable Components
- **ProductCardComponent**: Single product card with image, price, rating
- **ProductGridComponent**: Responsive grid layout for products
- **ProductCarouselComponent**: Desktop carousel with navigation arrows

### Data Flow

```
MockDataService (Mock Data)
    ↓
Components (Get Data via ngOnInit)
    ↓
Signals (Angular 17 Signals for reactive state)
    ↓
Templates (Render with ngIf, ngFor, etc.)
```

### Services

#### MockDataService
Provides all mock data for the application. Currently returns hardcoded product, category, and collection data. Will be replaced with HTTP calls to backend API.

**Key Methods:**
- `getProducts()` - All products
- `getCategories()` - All categories
- `getCollections()` - All collections
- `getTrendingProducts()` - Filtered trending products
- `getBestSellers()` - Filtered best sellers
- `getNewArrivals()` - Filtered new arrivals
- `getFeaturedProducts()` - Filtered featured products
- `getProductsByCategory()` - Products by category slug
- `getProductsByMaterial()` - Products by material slug

## Design System

### Color Palette
- **Primary**: Rose/Pink (#ec4899 and variants)
- **Neutral**: White, grays
- **Accents**: Rose gold, blush tones

### Typography
- **Headings**: Bold, 2xl-4xl sizes
- **Body**: Regular weight, readable sans-serif

### Components Style
- Rounded corners (2xl radius)
- Soft shadows on cards
- Smooth hover transitions (300ms)
- Large product images
- Plenty of whitespace

### Responsive Design
- **Mobile**: 2-column grids for products
- **Tablet**: 3-column grids
- **Desktop**: 4-column grids
- Horizontal scrollable carousels (mobile-friendly)

## Key Technologies

- **Angular 17+** - Latest Angular framework
- **Signals** - Reactive state management (Angular 17+)
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Standalone Components** - Modern Angular components

## Development Guidelines

### Component Creation
1. Use standalone components (`standalone: true`)
2. Import CommonModule for structural directives
3. Use Signals for reactive state
4. Emit outputs for parent communication
5. Keep components focused and reusable

### Styling
- Use Tailwind utility classes
- Use SCSS only for complex pseudo-selectors or animations
- Follow the color palette defined in tailwind.config.js
- Keep components responsive with tailwind breakpoints

### Data Management
- Use MockDataService for mock data
- Will transition to HTTP service for backend
- Use Signals for component-level state
- Emit events for parent-child communication

## Next Steps for Completion

### Phase 1: Core Implementation (Current)
- ✅ Project structure and component scaffolding
- ✅ Reusable components created
- ✅ Mock data service
- ✅ All 17 sections scaffolded
- TODO: Refine component styles
- TODO: Add smooth scroll functionality

### Phase 2: Enhancements
- Add HTTP service for backend integration
- Implement shopping cart functionality
- Add product quick view modal
- Implement wishlist functionality
- Add search functionality
- Create product detail page
- Add authentication/login

### Phase 3: Advanced Features
- Implement filters and sorting
- Add shopping cart with checkout
- User account management
- Order tracking
- Payment integration
- Admin panel for managing products

## Styling Notes

### Tailwind Configuration
- Custom colors configured in `tailwind.config.js`
- Line clamp plugin installed for text truncation
- Responsive breakpoints: sm, md, lg, xl, 2xl

### Component-Level Styling
- ProductCard: Premium rounded cards with hover effects
- ProductCarousel: Desktop navigation with arrows
- Hero Banner: Full-width carousel with auto-slide
- Category Slider: Horizontal scroll with gradient scrollbar

## Future Considerations

1. **API Integration**: Replace MockDataService with HttpService
2. **State Management**: Consider NgRx for complex state
3. **Performance**: Lazy loading, image optimization, code splitting
4. **Accessibility**: ARIA labels, keyboard navigation
5. **Testing**: Unit tests, E2E tests
6. **SEO**: Meta tags, structured data

## Running the Project

```bash
npm install
npm start
# Navigate to http://localhost:4200
```

## Building for Production

```bash
npm run build
# Output in dist/
```
