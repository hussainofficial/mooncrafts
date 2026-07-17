import { Component, signal, Output, EventEmitter, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { CategoryManagementService } from '../../../core/services/category-management.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models';
import { WishlistDrawerComponent } from '../../../shared/components/wishlist-drawer.component';

interface NavItem {
  label: string;
  href: string;
  showMegaMenu?: boolean;
  categories?: Category[];
  isRouterLink?: boolean;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, WishlistDrawerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6">
        <div class="flex items-center justify-between h-14 sm:h-16">
          <!-- Logo -->
          <a href="/" class="flex-shrink-0">
            <span class="text-xl sm:text-2xl font-bold text-rose-500 whitespace-nowrap">MOONCRAFT</span>
          </a>

          <!-- Desktop Navigation -->
          <nav class="hidden lg:flex items-center gap-6 xl:gap-8 ml-8 flex-1">
            <a
              *ngFor="let item of navItems"
              [routerLink]="item.isRouterLink ? item.href : '/'"
              [fragment]="item.isRouterLink ? undefined : item.href.substring(1)"
              (click)="item.isRouterLink ? null : closeMenu()"
              class="text-sm text-gray-700 hover:text-rose-500 font-medium transition-colors relative group whitespace-nowrap">
              {{ item.label }}

              <!-- Mega Menu for Products -->
              <div *ngIf="item.showMegaMenu"
                class="mega-menu absolute left-0 top-full z-50 opacity-0 invisible transition-all duration-300 bg-white shadow-2xl rounded-lg mt-0 w-max max-h-96 overflow-y-auto">
                <div class="p-6">
                  <div class="grid grid-cols-5 gap-6">
                    <!-- Categories Column 1 - By Material (Dynamic) -->
                    <div>
                      <h3 class="font-bold text-gray-900 mb-3">By Material</h3>
                      <ul class="space-y-2 text-sm text-gray-600">
                        <li *ngFor="let cat of getMaterialCategories()">
                          <a (click)="navigateToFragment(cat.slug)" class="hover:text-rose-500 cursor-pointer">{{ cat.name }}</a>
                        </li>
                      </ul>
                      <p *ngIf="getMaterialCategories().length === 0" class="text-xs text-gray-400 italic mt-2">
                        No categories added yet
                      </p>
                    </div>

                    <!-- Categories Column 2 - By Type (Dynamic) -->
                    <div>
                      <h3 class="font-bold text-gray-900 mb-3">By Type</h3>
                      <ul class="space-y-2 text-sm text-gray-600">
                        <li *ngFor="let cat of getTypeCategories()">
                          <a (click)="navigateToFragment(cat.slug)" class="hover:text-rose-500 cursor-pointer">{{ cat.name }}</a>
                        </li>
                      </ul>
                      <p *ngIf="getTypeCategories().length === 0" class="text-xs text-gray-400 italic mt-2">
                        No categories added yet
                      </p>
                    </div>

                    <!-- Categories Column 3 - Quick Links -->
                    <div>
                      <h3 class="font-bold text-gray-900 mb-3">Quick Links</h3>
                      <ul class="space-y-2 text-sm text-gray-600">
                        <li><a (click)="navigateToFragment('trending')" class="hover:text-rose-500 cursor-pointer">Trending Now</a></li>
                        <li><a (click)="navigateToFragment('new-arrivals')" class="hover:text-rose-500 cursor-pointer">New Arrivals</a></li>
                        <li><a (click)="navigateToFragment('best-sellers')" class="hover:text-rose-500 cursor-pointer">Best Sellers</a></li>
                        <li><a (click)="navigateToFragment('featured-products')" class="hover:text-rose-500 cursor-pointer">Featured</a></li>
                      </ul>
                    </div>

                    <!-- Column 4 - Featured Products Grid -->
                    <div>
                      <h3 class="font-bold text-gray-900 mb-3">✨ Featured</h3>
                      <div class="space-y-3">
                        <div *ngFor="let product of getFeaturedProductsForMenu()"
                          (click)="goToProduct(product.id)"
                          class="flex gap-3 hover:bg-rose-50 p-2 rounded cursor-pointer transition-colors">
                          <img [src]="product.image" [alt]="product.name" class="w-12 h-12 object-cover rounded">
                          <div class="flex-1">
                            <p class="text-xs font-semibold text-gray-900 line-clamp-2">{{ product.name }}</p>
                            <p class="text-xs text-rose-600 font-bold">₹{{ product.price }}</p>
                          </div>
                        </div>
                        <p *ngIf="getFeaturedProductsForMenu().length === 0" class="text-xs text-gray-400 italic">
                          No featured products yet
                        </p>
                      </div>
                    </div>

                    <!-- Column 5 - Browse All -->
                    <div class="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-4 text-center space-y-3 h-fit">
                      <div>
                        <h4 class="font-bold text-gray-900 mb-2">Browse All</h4>
                        <p class="text-sm text-gray-600 mb-3">Premium Jewelry<br>Collection</p>
                        <a routerLink="/shop" class="inline-block bg-rose-500 text-white px-3 py-2 rounded text-xs font-semibold hover:bg-rose-600 transition-colors">
                          Shop All →
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          </nav>

          <!-- Right Section: Icons + Auth Buttons -->
          <div class="flex items-center gap-1 sm:gap-2 md:gap-3">
            <!-- Search -->
            <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>

            <!-- Wishlist -->
            <button
              (click)="goToWishlist()"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span class="absolute top-0 right-0 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none">{{ userService.wishlistCount() }}</span>
            </button>

            <!-- Cart -->
            <button
              (click)="goToCart()"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <svg class="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <span class="absolute top-0 right-0 bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center text-xs leading-none">{{ cartService.cartCount() }}</span>
            </button>

            <!-- Auth Buttons (Mobile: hidden, Desktop: visible) -->
            <div *ngIf="!(authService.isLoggedIn() || userService.currentUserProfile())" class="hidden sm:flex items-center gap-1 md:gap-2">
              <a
                routerLink="/signin"
                class="auth-btn-signin text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2">
                Sign In
              </a>
              <a
                routerLink="/signup"
                class="auth-btn-signup text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2">
                Sign Up
              </a>
            </div>

            <!-- Profile Icon (Logged in users only - hidden on small mobile) -->
            <div class="relative hidden sm:block" *ngIf="authService.isLoggedIn() || userService.currentUserProfile()">
              <button
                (click)="showProfileMenu.update(v => !v)"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center font-bold text-sm hover:from-rose-500 hover:to-rose-700 transition-all">
                  {{ getFirstLetter() }}
                </div>
              </button>

              <!-- Profile Dropdown Menu -->
              <div *ngIf="showProfileMenu()" class="absolute right-0 top-12 bg-white shadow-lg rounded-lg p-2 min-w-48 z-50">
                <div class="px-4 py-2 border-b">
                  <p class="text-sm font-semibold text-gray-900">{{ userService.currentUserProfile()?.name || authService.currentUser()?.name }}</p>
                  <p class="text-xs text-gray-600">{{ authService.currentUser()?.role === 'admin' ? 'Admin' : 'User' }}</p>
                </div>
                <a
                  routerLink="/profile"
                  routerLinkActive="bg-rose-100 text-rose-700"
                  [routerLinkActiveOptions]="{ exact: true }"
                  (click)="showProfileMenu.set(false)"
                  class="block px-4 py-2 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors">
                  My Profile
                </a>
                <a
                  routerLink="/orders"
                  routerLinkActive="bg-rose-100 text-rose-700"
                  [routerLinkActiveOptions]="{ exact: true }"
                  (click)="showProfileMenu.set(false)"
                  class="block px-4 py-2 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors">
                  My Orders
                </a>
                <a
                  *ngIf="authService.isAdmin()"
                  routerLink="/admin"
                  routerLinkActive="bg-rose-100 text-rose-700"
                  [routerLinkActiveOptions]="{ exact: true }"
                  (click)="showProfileMenu.set(false)"
                  class="block px-4 py-2 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors">
                  Dashboard
                </a>
                <button
                  (click)="authService.logout(); showProfileMenu.set(false)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-semibold text-sm">
                  Logout
                </button>
              </div>
            </div>

            <!-- Mobile Menu Button -->
            <button
              (click)="showMobileMenu.update(v => !v)"
              class="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors ml-1">
              <svg *ngIf="!showMobileMenu()" class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
              <svg *ngIf="showMobileMenu()" class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Navigation Menu -->
        <div *ngIf="showMobileMenu()" class="lg:hidden bg-white border-t border-gray-200 py-4 space-y-2">
          <a
            *ngFor="let item of navItems"
            [routerLink]="item.isRouterLink ? item.href : '/'"
            [fragment]="item.isRouterLink ? undefined : item.href.substring(1)"
            (click)="showMobileMenu.set(false)"
            class="block px-4 py-2 text-gray-700 hover:text-rose-500 hover:bg-gray-50 font-medium transition-colors text-sm">
            {{ item.label }}
          </a>

          <!-- Mobile Auth Buttons -->
          <div *ngIf="!(authService.isLoggedIn() || userService.currentUserProfile())" class="sm:hidden border-t border-gray-200 pt-3 mt-3 px-4 space-y-2">
            <a
              routerLink="/signin"
              (click)="showMobileMenu.set(false)"
              class="block text-center auth-btn-signin text-sm py-2">
              Sign In
            </a>
            <a
              routerLink="/signup"
              (click)="showMobileMenu.set(false)"
              class="block text-center auth-btn-signup text-sm py-2">
              Sign Up
            </a>
          </div>

          <!-- Mobile Profile Menu -->
          <div *ngIf="authService.isLoggedIn() || userService.currentUserProfile()" class="sm:hidden border-t border-gray-200 pt-3 mt-3 px-4 space-y-2">
            <a
              routerLink="/profile"
              (click)="showMobileMenu.set(false)"
              class="block px-2 py-2 text-gray-700 hover:text-rose-500 hover:bg-gray-50 text-sm">
              My Profile
            </a>
            <a
              routerLink="/orders"
              (click)="showMobileMenu.set(false)"
              class="block px-2 py-2 text-gray-700 hover:text-rose-500 hover:bg-gray-50 text-sm">
              My Orders
            </a>
            <a
              *ngIf="authService.isAdmin()"
              routerLink="/admin"
              (click)="showMobileMenu.set(false)"
              class="block px-2 py-2 text-gray-700 hover:text-rose-500 hover:bg-gray-50 text-sm">
              Dashboard
            </a>
            <button
              (click)="authService.logout(); showMobileMenu.set(false)"
              class="w-full text-left px-2 py-2 text-red-600 hover:bg-red-50 text-sm">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Cart Drawer -->
    <div *ngIf="showCartDrawer()" (click)="closeCartDrawer()" class="fixed inset-0 bg-black/50 z-50">
      <div (click)="$event.stopPropagation()" class="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-lg overflow-y-auto">
        <div class="p-4 border-b flex items-center justify-between sticky top-0 bg-white">
          <h2 class="text-xl font-bold">Shopping Cart</h2>
          <button (click)="closeCartDrawer()" class="text-2xl text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div class="p-4">
          <div *ngIf="cartService.getCartItems().length === 0" class="text-center py-8">
            <p class="text-gray-500">Your cart is empty</p>
            <button (click)="closeCartDrawer()" class="mt-4 bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600">
              Continue Shopping
            </button>
          </div>
          <div *ngIf="cartService.getCartItems().length > 0" class="space-y-4">
            <div *ngFor="let item of cartService.getCartItems()" class="border rounded-lg p-3">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-semibold text-sm">{{ item.name }}</h3>
                <button (click)="cartService.removeFromCart(item.id)" class="text-red-500 hover:text-red-700">🗑️</button>
              </div>
              <div class="flex justify-between text-sm text-gray-600">
                <span>Qty: {{ item.quantity }}</span>
                <span class="font-semibold">₹{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
            <div class="border-t pt-4 mt-4">
              <div class="flex justify-between text-lg font-bold mb-4">
                <span>Total:</span>
                <span class="text-rose-500">₹{{ cartService.getCartTotal().toFixed(2) }}</span>
              </div>
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
      (closed)="closeWishlistDrawer()">
    </app-wishlist-drawer>
  `,
  styles: [`
    :host ::ng-deep .group:hover .mega-menu {
      opacity: 1 !important;
      visibility: visible !important;
    }

    .auth-btn-signin {
      color: #ec4899;
      font-weight: 600;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      border: 1px solid #ec4899;
      display: inline-block;
    }

    .auth-btn-signin:hover {
      background-color: #fce7f3;
      color: #be185d;
    }

    .auth-btn-signup {
      background-color: #ec4899;
      color: white;
      font-weight: 600;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      display: inline-block;
    }

    .auth-btn-signup:hover {
      background-color: #db2777;
      color: white;
    }
  `]
})
export class HeaderComponent {
  @Input() showWishlistPanel = false;
  @Output() toggleWishlist = new EventEmitter<void>();
  @Output() openWishlistDrawer = new EventEmitter<void>();
  @Output() openCartDrawer = new EventEmitter<void>();

  navItems: NavItem[] = [
    { label: 'Home', href: '/', isRouterLink: true },
    { label: 'Products', href: '#', showMegaMenu: true },
    { label: 'Collections', href: '#collections' },
    { label: 'New Arrivals', href: '#new-arrivals' },
    { label: 'Best Sellers', href: '#best-sellers' },
    { label: 'Featured', href: '#featured-products' },
    { label: 'Reviews', href: '#reviews' },
  ];

  showProfileMenu = signal(false);
  showCartDrawer = signal(false);
  showWishlistDrawer = signal(false);
  showMobileMenu = signal(false);

  constructor(
    public cartService: CartService,
    public authService: AuthService,
    public userService: UserService,
    public categoryManagementService: CategoryManagementService,
    public categoryService: CategoryService,
    public productService: ProductService,
    private router: Router
  ) {}

  goToCart() {
    this.showCartDrawer.set(true);
    this.openCartDrawer.emit();
  }

  goToWishlist() {
    this.showWishlistDrawer.set(true);
  }

  closeWishlistDrawer() {
    this.showWishlistDrawer.set(false);
  }

  getFirstLetter(): string {
    const name = this.userService.currentUserProfile()?.name || this.authService.currentUser()?.name || '';
    return name.charAt(0).toUpperCase();
  }

  closeMenu() {
    // Close any open menus after navigation
    // This allows smooth scroll to section without menu staying open
  }

  navigateToFragment(fragment: string) {
    this.router.navigate([], { fragment: fragment });
  }

  getMaterialCategories() {
    return this.categoryService.getMaterials();
  }

  getTypeCategories() {
    return this.categoryService.getCategories();
  }

  getCollectionCategories() {
    return this.categoryManagementService.getCategoriesByType('collection');
  }

  getFeaturedProductsForMenu() {
    return this.productService.getProducts().filter(p => p.isFeatured).slice(0, 5);
  }

  goToProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  closeCartDrawer() {
    this.showCartDrawer.set(false);
  }

  proceedToCheckout() {
    this.closeCartDrawer();
    this.router.navigate(['/checkout']);
  }
}
