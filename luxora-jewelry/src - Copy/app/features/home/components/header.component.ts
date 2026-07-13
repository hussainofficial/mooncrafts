import { Component, signal, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, RouterLinkActive } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { CategoryManagementService } from '../../../core/services/category-management.service';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { Category } from '../../../core/models';

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
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex items-center">
            <a href="/" class="text-2xl font-bold text-rose-500">LUXORA</a>
          </div>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-8 overflow-visible">
            <a
              *ngFor="let item of navItems"
              [routerLink]="item.isRouterLink ? item.href : '/'"
              [fragment]="item.isRouterLink ? undefined : item.href.substring(1)"
              (click)="item.isRouterLink ? null : closeMenu()"
              class="text-gray-700 hover:text-rose-500 font-medium transition-colors relative group">
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

          <!-- Right Icons -->
          <div class="flex items-center gap-4">
            <!-- Search -->
            <button class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </button>

            <!-- Wishlist -->
            <button
              (click)="goToWishlist()"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
              <span class="absolute top-1 right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{{ userService.wishlistCount() }}</span>
            </button>

            <!-- Cart -->
            <button
              (click)="goToCart()"
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
              <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
              <span class="absolute top-1 right-1 bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{{ cartService.cartCount() }}</span>
            </button>

            <!-- Profile -->
            <div class="relative">
              <button
                (click)="showProfileMenu.update(v => !v)"
                class="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                <!-- User Avatar with First Letter (if logged in) -->
                <div *ngIf="authService.isLoggedIn() || userService.currentUserProfile()"
                  class="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center font-bold text-sm hover:from-rose-500 hover:to-rose-700 transition-all">
                  {{ getFirstLetter() }}
                </div>

                <!-- Default User Icon (if not logged in) -->
                <svg *ngIf="!authService.isLoggedIn() && !userService.currentUserProfile()"
                  class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </button>

              <!-- Profile Dropdown / Auth Buttons -->
              <div *ngIf="showProfileMenu()" class="absolute right-0 top-12 bg-white shadow-lg rounded-lg p-2 min-w-48">
                <!-- Guest Menu (Not Logged In) -->
                <div *ngIf="!(authService.isLoggedIn() || userService.currentUserProfile())" class="space-y-2 p-2">
                  <a
                    routerLink="/signin"
                    (click)="showProfileMenu.set(false)"
                    class="block w-full px-4 py-2 text-center bg-rose-500 text-white rounded-lg font-semibold text-sm hover:bg-rose-600 transition-colors">
                    Sign In
                  </a>
                  <a
                    routerLink="/signup"
                    (click)="showProfileMenu.set(false)"
                    class="block w-full px-4 py-2 text-center border-2 border-rose-500 text-rose-500 rounded-lg font-semibold text-sm hover:bg-rose-50 transition-colors">
                    Sign Up
                  </a>
                </div>

                <!-- User Menu (Logged In) -->
                <div *ngIf="authService.isLoggedIn() || userService.currentUserProfile()">
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
                <div *ngIf="!authService.isLoggedIn()">
                  <a
                    routerLink="/login"
                    routerLinkActive="bg-rose-100 text-rose-700"
                    [routerLinkActiveOptions]="{ exact: true }"
                    (click)="showProfileMenu.set(false)"
                    class="block px-4 py-2 hover:bg-gray-100 text-gray-700 font-semibold text-sm transition-colors">
                    Login
                  </a>
                  <a
                    routerLink="/login"
                    routerLinkActive="bg-rose-100 text-rose-700"
                    [routerLinkActiveOptions]="{ exact: true }"
                    (click)="showProfileMenu.set(false)"
                    class="block px-4 py-2 hover:bg-gray-100 text-rose-500 font-semibold text-sm transition-colors">
                    Admin Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host ::ng-deep .group:hover .mega-menu {
      opacity: 1 !important;
      visibility: visible !important;
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
    this.openCartDrawer.emit();
  }

  goToWishlist() {
    this.openWishlistDrawer.emit();
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
}
