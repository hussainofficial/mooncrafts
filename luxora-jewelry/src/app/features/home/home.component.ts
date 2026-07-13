import { Component, OnInit, signal, Signal, effect, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { Product, Category } from '../../core/models';
import { AnnouncementBarComponent } from './components/announcement-bar.component';
import { HeaderComponent } from './components/header.component';
import { FooterComponent } from './components/footer.component';
import { HeroBannerComponent } from './sections/hero-banner.component';
import { CategorySliderComponent } from './sections/category-slider.component';
import { TrustSectionComponent } from './sections/trust-section.component';
import { CollectionsComponent } from './sections/collections.component';
import { MaterialGridComponent } from './sections/material-grid.component';
import { ReviewsCarouselComponent } from './sections/reviews-carousel.component';
import { NewsletterComponent } from './sections/newsletter.component';
import { ProductCarouselComponent } from '../../shared/components/product-carousel.component';
import { ProductGridComponent } from '../../shared/components/product-grid.component';
import { ProductDetailsPanelComponent } from '../../shared/components/product-details-panel.component';
import { WishlistPanelComponent } from '../../shared/components/wishlist-panel.component';
import { CartDrawerComponent } from '../../shared/components/cart-drawer.component';
import { WishlistDrawerComponent } from '../../shared/components/wishlist-drawer.component';
import { ScrollAnimateDirective } from '../../shared/directives/scroll-animate.directive';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ScrollAnimateDirective,
    AnnouncementBarComponent,
    HeaderComponent,
    FooterComponent,
    HeroBannerComponent,
    CategorySliderComponent,
    TrustSectionComponent,
    CollectionsComponent,
    MaterialGridComponent,
    ReviewsCarouselComponent,
    NewsletterComponent,
    ProductCarouselComponent,
    ProductGridComponent,
    ProductDetailsPanelComponent,
    WishlistPanelComponent,
    CartDrawerComponent,
    WishlistDrawerComponent,
  ],
  template: `
    <!-- Top Announcement Bar -->
    <app-announcement-bar></app-announcement-bar>

    <!-- Header -->
    <app-header
      [showWishlistPanel]="showWishlistPanel()"
      (toggleWishlist)="openWishlistPanel()"
      (openWishlistDrawer)="openWishlistDrawer()"
      (openCartDrawer)="openCartDrawer()">
    </app-header>

    <!-- Wishlist Side Panel -->
    <app-wishlist-panel
      [isOpen]="showWishlistPanel()"
      (closedPanel)="closeWishlistPanel()"
      (addedToCart)="onAddedToCart($event)">
    </app-wishlist-panel>

    <!-- Add to Cart Drawer (for single product) -->
    <app-cart-drawer
      [isOpen]="showAddToCartModal()"
      [currentProduct]="selectedProductForCart()"
      (closed)="closeAddToCartModal()">
    </app-cart-drawer>

    <!-- Full Cart View Drawer -->
    <div *ngIf="showCartDrawer()" (click)="closeCartDrawer()" class="fixed inset-0 bg-black/50 z-50">
      <div (click)="$event.stopPropagation()" class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg overflow-y-auto">
        <!-- Header -->
        <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 class="text-xl font-bold">Shopping Cart</h2>
          <button (click)="closeCartDrawer()" class="text-2xl text-gray-500 hover:text-gray-700">
            ×
          </button>
        </div>

        <!-- Cart Items -->
        <div class="p-4">
          <div *ngIf="cartService.getCartItems().length === 0" class="text-center py-8">
            <p class="text-gray-500">Your cart is empty</p>
            <button (click)="closeCartDrawer()" class="mt-4 bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600">
              Continue Shopping
            </button>
          </div>

          <div *ngIf="cartService.getCartItems().length > 0" class="space-y-4">
            <!-- Cart Items List -->
            <div *ngFor="let item of cartService.getCartItems()" class="border rounded-lg p-3">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-sm">{{ item.name }}</h3>
                <button (click)="cartService.removeFromCart(item.id)" class="text-red-500 hover:text-red-700">
                  🗑️
                </button>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Qty: {{ item.quantity }}</span>
                <span class="font-semibold">₹{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>

            <!-- Total -->
            <div class="border-t pt-4 mt-4">
              <div class="flex justify-between text-lg font-bold mb-4">
                <span>Total:</span>
                <span class="text-rose-500">₹{{ cartService.getCartTotal().toFixed(2) }}</span>
              </div>

              <!-- Checkout Button -->
              <button
                (click)="proceedToCheckout()"
                class="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 mb-2">
                Proceed to Checkout
              </button>
              <button (click)="closeCartDrawer()" class="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-50">
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Wishlist Drawer -->
    <app-wishlist-drawer
      [isOpen]="showWishlistDrawer()"
      (closed)="closeWishlistDrawer()"
      (openCart)="openCartFromWishlist()">
    </app-wishlist-drawer>

    <!-- Main Content -->
    <main id="home">
      <!-- Hero Banner -->
      <app-hero-banner id="hero"></app-hero-banner>

      <!-- Shop by Category -->
      <app-category-slider></app-category-slider>

      <!-- Trust Section -->
      <app-trust-section></app-trust-section>

      <!-- Trending Products -->
      <section id="trending" class="py-12 md:py-16 px-4 lg:px-8 bg-white" appScrollAnimate="slide-in-up">
        <div class="w-full max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Trending Now</h2>
              <p class="text-sm text-gray-600 mt-2">Most loved by our customers</p>
            </div>
            <a href="#trending" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-carousel
            [products]="trendingProducts()"
            (addToCart)="onAddToCart($event)"
          ></app-product-carousel>
        </div>
      </section>

      <!-- Shop by Collection -->
      <div id="collections" class="bg-rose-50" appScrollAnimate="fade-in">
        <app-collections></app-collections>
      </div>

      <!-- New Arrivals -->
      <section id="new-arrivals" class="py-12 md:py-16 px-4 lg:px-8 bg-white" appScrollAnimate="slide-in-up">
        <div class="w-full max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">New Arrivals</h2>
              <p class="text-sm text-gray-600 mt-2">Latest additions to our collection</p>
            </div>
            <a href="#new-arrivals" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-grid
            [products]="newArrivals()"
            (addToCart)="onAddToCart($event)"
          ></app-product-grid>
        </div>
      </section>

      <!-- Best Sellers -->
      <section id="best-sellers" class="py-12 md:py-16 px-4 lg:px-8 bg-rose-50" appScrollAnimate="slide-in-up">
        <div class="w-full max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Best Sellers</h2>
              <p class="text-sm text-gray-600 mt-2">Customer favorites</p>
            </div>
            <a href="#best-sellers" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-grid
            [products]="bestSellers()"
            (addToCart)="onAddToCart($event)"
          ></app-product-grid>
        </div>
      </section>

      <!-- Featured Products -->
      <section id="featured-products" class="py-12 md:py-16 px-4 lg:px-8 bg-white" appScrollAnimate="slide-in-up">
        <div class="w-full max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Featured Products</h2>
              <p class="text-sm text-gray-600 mt-2">Handpicked for you</p>
            </div>
            <a href="#featured-products" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-grid
            [products]="featuredProducts()"
            (addToCart)="onAddToCart($event)"
          ></app-product-grid>
        </div>
      </section>

      <!-- Shop by Material -->
      <div class="bg-rose-50" appScrollAnimate="fade-in">
        <app-material-grid></app-material-grid>
      </div>

      <!-- Category Sections (Dynamic) -->
      <section *ngFor="let category of categories(); let i = index" [id]="category.slug" class="py-12 md:py-16 px-4 lg:px-8" [ngClass]="{ 'bg-rose-50': (i % 2) === 1 }" appScrollAnimate="slide-in-up">
        <div class="w-full max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">{{ category.name }}</h2>
              <p class="text-sm text-gray-600 mt-2">{{ category.description }}</p>
            </div>
            <a [href]="'#' + category.slug" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-grid
            [products]="getProductsByCategory(category.slug)"
            (addToCart)="onAddToCart($event)"
          ></app-product-grid>
        </div>
      </section>

      <!-- Customer Reviews -->
      <div id="reviews" appScrollAnimate="fade-in">
        <app-reviews-carousel></app-reviews-carousel>
      </div>

      <!-- Instagram Gallery Section -->
      <section class="py-12 md:py-16 px-4 lg:px-8 bg-white" appScrollAnimate="fade-in">
        <div class="w-full max-w-7xl mx-auto">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Follow Us on Instagram</h2>
            <p class="text-sm text-gray-600">@luxora.jewelry</p>
          </div>
          <!-- Instagram Gallery Grid -->
          <div class="grid grid-cols-3 md:grid-cols-6 gap-4">
            <div *ngFor="let i of [1,2,3,4,5,6]; let idx = index"
              class="aspect-square bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
              [style.animation-delay]="(idx * 50) + 'ms'">
              <img
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop"
                alt="Instagram post"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <div id="newsletter" appScrollAnimate="scale-in">
        <app-newsletter></app-newsletter>
      </div>
    </main>

    <!-- Product Details Side Panel -->
    <app-product-details-panel
      [product]="selectedProduct()"
      [isOpen]="showProductDetails()"
      (closePanel)="closeProductDetails()">
    </app-product-details-panel>

    <!-- Footer -->
    <app-footer></app-footer>
  `,
})
export class HomeComponent implements OnInit {
  trendingProducts = signal<Product[]>([]);
  newArrivals = signal<Product[]>([]);
  bestSellers = signal<Product[]>([]);
  featuredProducts = signal<Product[]>([]);
  categories = signal<Category[]>([]);

  selectedProduct = signal<Product | null>(null);
  showProductDetails = signal(false);
  showWishlistPanel = signal(false);
  selectedProductForCart = signal<Product | null>(null);
  showAddToCartModal = signal(false);
  showWishlistDrawer = signal(false);
  showCartDrawer = signal(false);

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    public cartService: CartService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    // Set up reactive updates for products when they load from API
    effect(() => {
      const allProducts = this.productService.getProducts();
      if (allProducts.length > 0) {
        this.trendingProducts.set(allProducts.filter(p => p.isTrending));
        this.newArrivals.set(allProducts.filter(p => p.isNewArrival));
        this.bestSellers.set(allProducts.filter(p => p.isBestSeller));
        this.featuredProducts.set(allProducts.filter(p => p.isFeatured));
        this.categories.set(this.categoryService.getCategories() as any as Category[]);
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit() {
    // Initial load - set products if already available
    const allProducts = this.productService.getProducts();
    if (allProducts.length > 0) {
      this.trendingProducts.set(allProducts.filter(p => p.isTrending));
      this.newArrivals.set(allProducts.filter(p => p.isNewArrival));
      this.bestSellers.set(allProducts.filter(p => p.isBestSeller));
      this.featuredProducts.set(allProducts.filter(p => p.isFeatured));
      this.categories.set(this.categoryService.getCategories() as any as Category[]);
      this.cdr.markForCheck();
    }

    // Handle smooth scroll to fragment
    this.activatedRoute.fragment.subscribe((fragment) => {
      if (fragment) {
        setTimeout(() => {
          const element = document.getElementById(fragment);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
      }
    });
  }

  getProductsByCategory(categorySlug: string): Product[] {
    return this.productService.getProducts()
      .filter(p => p.category.toLowerCase() === categorySlug.toLowerCase())
      .slice(0, 8);
  }

  onAddToCart(product: Product) {
    this.cartService.addToCart(product);
    this.selectedProductForCart.set(product);
    this.showAddToCartModal.set(true);
  }

  closeAddToCartModal() {
    this.showAddToCartModal.set(false);
    setTimeout(() => {
      this.selectedProductForCart.set(null);
    }, 300);
  }

  openProductDetails(product: Product) {
    this.selectedProduct.set(product);
    this.showProductDetails.set(true);
  }

  closeProductDetails() {
    this.showProductDetails.set(false);
    setTimeout(() => {
      this.selectedProduct.set(null);
    }, 300);
  }

  openWishlistPanel() {
    this.showWishlistPanel.set(true);
  }

  closeWishlistPanel() {
    this.showWishlistPanel.set(false);
  }

  onAddedToCart(product: Product) {
    this.cartService.addToCart(product);
    this.closeWishlistPanel();
  }

  openWishlistDrawer() {
    this.showWishlistDrawer.set(true);
  }

  closeWishlistDrawer() {
    this.showWishlistDrawer.set(false);
  }

  openCartFromWishlist() {
    this.showWishlistDrawer.set(false);
    this.showAddToCartModal.set(true);
  }

  openCartDrawer() {
    this.showCartDrawer.set(true);
  }

  closeCartDrawer() {
    this.showCartDrawer.set(false);
  }

  proceedToCheckout() {
    this.closeCartDrawer();
    this.router.navigate(['/checkout']);
  }
}
