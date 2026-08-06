import { Component, OnInit, signal, Signal, effect, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
    RouterLink,
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
    ProductDetailsPanelComponent,
    WishlistPanelComponent,
    CartDrawerComponent,
    WishlistDrawerComponent,
  ],
  template: `
    <!-- Top Announcement Bar
    <app-announcement-bar></app-announcement-bar>
    -->
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
              Back to Shopping
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
                Back to Shopping
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

      <!-- Shop by Material -->
      <div class="bg-rose-50" appScrollAnimate="fade-in">
        <app-material-grid></app-material-grid>
      </div>

      <!-- Shop by Category -->
      <app-category-slider></app-category-slider>

      <!-- Shop by Collection -->
      <div id="collections" class="bg-rose-50" appScrollAnimate="fade-in">
        <app-collections></app-collections>
      </div>

      <!-- Trending Products -->
      <section id="trending" class="py-12 md:py-16 px-4 lg:px-8 bg-white" appScrollAnimate="slide-in-up">
        <div class="w-full max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Trending Now</h2>
              <p class="text-sm text-gray-600 mt-2">Most loved by our customers</p>
            </div>
            <a [routerLink]="['/products']" [queryParams]="{ filter: 'trending' }" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-carousel
            [products]="trendingProducts()"
            (addToCart)="onAddToCart($event)"
          ></app-product-carousel>
        </div>
      </section>

      <!-- New Arrivals -->
      <section id="new-arrivals" class="py-12 md:py-16 px-4 lg:px-8 bg-white" appScrollAnimate="slide-in-up">
        <div class="w-full max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">New Arrivals</h2>
              <p class="text-sm text-gray-600 mt-2">Latest additions to our collection</p>
            </div>
            <a [routerLink]="['/products']" [queryParams]="{ filter: 'new-arrivals' }" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-carousel
            [products]="newArrivals()"
            (addToCart)="onAddToCart($event)"
          ></app-product-carousel>
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
            <a [routerLink]="['/products']" [queryParams]="{ filter: 'best-sellers' }" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-carousel
            [products]="bestSellers()"
            (addToCart)="onAddToCart($event)"
          ></app-product-carousel>
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
            <a [routerLink]="['/products']" [queryParams]="{ filter: 'featured' }" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-carousel
            [products]="featuredProducts()"
            (addToCart)="onAddToCart($event)"
          ></app-product-carousel>
        </div>
      </section>

      <!-- Category Sections (Dynamic) -->
      <section *ngFor="let category of categories(); let i = index" [id]="category.slug" class="py-12 md:py-16 px-4 lg:px-8" [ngClass]="{ 'bg-rose-50': (i % 2) === 1 }" appScrollAnimate="slide-in-up">
        <div class="w-full max-w-7xl mx-auto">
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-3xl md:text-4xl font-bold text-gray-900">{{ category.name }}</h2>
              <p class="text-sm text-gray-600 mt-2">{{ category.description }}</p>
            </div>
            <a [routerLink]="['/category', category.id]" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
          </div>
          <app-product-carousel
            [products]="getProductsByCategory(category.slug)"
            (addToCart)="onAddToCart($event)"
          ></app-product-carousel>
        </div>
      </section>

      <!-- Customer Reviews -->
      <div id="reviews" appScrollAnimate="fade-in">
        <app-reviews-carousel></app-reviews-carousel>
      </div>

      <!-- Follow Us / Social Media Section -->
      <section class="py-12 md:py-16 px-4 lg:px-8 bg-white" appScrollAnimate="fade-in">
        <div class="w-full max-w-7xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Follow Us</h2>
          <p class="text-sm text-gray-600 mb-10">@mooncraft.jewelry</p>

          <!-- Social Media Icons -->
          <div class="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
            <a href="#" target="_blank" rel="noopener" aria-label="Instagram"
              class="w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110"
              style="background: radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%);">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 011.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772 4.915 4.915 0 01-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.065.217-1.79.465-2.428a4.88 4.88 0 011.153-1.772A4.897 4.897 0 015.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.25A3.25 3.25 0 1112 8.75a3.25 3.25 0 010 6.5zm5.25-9.5a1.15 1.15 0 100 2.3 1.15 1.15 0 000-2.3z"></path>
              </svg>
            </a>

            <a href="#" target="_blank" rel="noopener" aria-label="Facebook"
              class="w-14 h-14 rounded-full flex items-center justify-center text-white bg-[#1877F2] transition-transform hover:scale-110">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12z"></path>
              </svg>
            </a>

            <a href="#" target="_blank" rel="noopener" aria-label="X (Twitter)"
              class="w-14 h-14 rounded-full flex items-center justify-center text-white bg-black transition-transform hover:scale-110">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
              </svg>
            </a>

            <a href="#" target="_blank" rel="noopener" aria-label="Pinterest"
              class="w-14 h-14 rounded-full flex items-center justify-center text-white bg-[#E60023] transition-transform hover:scale-110">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.183-.78 1.182-4.97 1.182-4.97s-.301-.602-.301-1.492c0-1.397.81-2.44 1.818-2.44.858 0 1.272.643 1.272 1.414 0 .861-.548 2.15-.83 3.345-.236.997.5 1.81 1.483 1.81 1.78 0 3.148-1.876 3.148-4.58 0-2.395-1.72-4.07-4.177-4.07-2.845 0-4.515 2.135-4.515 4.34 0 .86.331 1.782.744 2.283a.3.3 0 01.069.287c-.076.316-.245.997-.278 1.136-.044.183-.145.222-.334.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.472 6.165 5.775 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.966-.526-2.292-1.148l-.623 2.378c-.226.869-.835 1.958-1.243 2.622A10 10 0 1012 2z"></path>
              </svg>
            </a>

            <a href="#" target="_blank" rel="noopener" aria-label="YouTube"
              class="w-14 h-14 rounded-full flex items-center justify-center text-white bg-[#FF0000] transition-transform hover:scale-110">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path>
              </svg>
            </a>
          </div>
        </div>
      </section>

      <!-- About Us -->
      <section id="about" class="py-12 md:py-16 px-4 lg:px-8 bg-rose-50" appScrollAnimate="fade-in">
        <div class="w-full max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-6">About Us</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            MOONCRAFT is a premium jewelry brand dedicated to celebrating life's special moments with
            elegant, timeless designs. Every piece in our collection is crafted with care, blending
            traditional craftsmanship with contemporary style.
          </p>
          <p class="text-gray-700 leading-relaxed">
            From everyday essentials to statement pieces for your biggest celebrations, we're here to
            help you find jewelry that feels as good as it looks. Thank you for being part of our story.
          </p>
        </div>
      </section>

      <!-- Contact Us -->
      <section id="contact" class="py-12 md:py-16 px-4 lg:px-8 bg-white" appScrollAnimate="fade-in">
        <div class="w-full max-w-4xl mx-auto text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Contact Us</h2>
          <p class="text-sm text-gray-600 mb-10">We'd love to hear from you</p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="text-3xl mb-3">📞</div>
              <p class="font-semibold text-gray-900">Phone</p>
              <p class="text-gray-600 text-sm mt-1">+91 98765 43210</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="text-3xl mb-3">📧</div>
              <p class="font-semibold text-gray-900">Email</p>
              <p class="text-gray-600 text-sm mt-1">hello&#64;mooncraft.jewelry</p>
            </div>
            <div class="bg-gray-50 rounded-xl p-6">
              <div class="text-3xl mb-3">📍</div>
              <p class="font-semibold text-gray-900">Address</p>
              <p class="text-gray-600 text-sm mt-1">Mumbai, Maharashtra, India</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <div id="newsletter" appScrollAnimate="scale-in">
        <app-newsletter></app-newsletter>
      </div>

      <!-- Trust Section -->
      <app-trust-section></app-trust-section>
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
