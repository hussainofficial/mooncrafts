import { Component, Input, Output, EventEmitter, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-wishlist-drawer',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Backdrop -->
    <div *ngIf="isOpen" (click)="close()" class="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"></div>

    <!-- Wishlist Drawer -->
    <div class="fixed right-0 top-0 h-screen z-50 transition-transform duration-300 bg-white shadow-2xl overflow-hidden flex flex-col"
      [class.translate-x-full]="!isOpen"
      [ngClass]="{ 'w-full md:w-[480px]': true }">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b bg-white sticky top-0">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">My Wishlist</h2>
          <p class="text-xs text-gray-500 mt-1">{{ wishlistProducts.length }} items</p>
        </div>
        <button (click)="close()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Loading State -->
        <div *ngIf="isOpen && wishlistProducts.length === 0 && isLoading" class="flex flex-col items-center justify-center py-16 px-6 text-center h-full">
          <p class="text-gray-600">Loading wishlist...</p>
        </div>

        <!-- Wishlist Items -->
        <div *ngIf="wishlistProducts.length > 0" class="divide-y">
          <div *ngFor="let product of wishlistProducts" class="p-6 border-b hover:bg-gray-50 transition-colors">
            <div class="flex gap-4">
              <!-- Product Image -->
              <div class="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                <img [src]="product.image" [alt]="product.name" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>

              <!-- Product Details -->
              <div class="flex-1">
                <!-- Name -->
                <h3 class="font-semibold text-gray-900 text-sm line-clamp-2">{{ product.name }}</h3>

                <!-- Rating -->
                <div class="flex items-center gap-2 mt-2">
                  <div class="flex gap-0.5">
                    <span *ngFor="let i of [1,2,3,4,5]" class="text-xs">
                      <span *ngIf="i <= Math.floor(product.rating)" class="text-yellow-400">★</span>
                      <span *ngIf="i > product.rating" class="text-gray-300">★</span>
                    </span>
                  </div>
                  <span class="text-xs text-gray-600">({{ product.reviews }})</span>
                </div>

                <!-- Price -->
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-lg font-bold text-gray-900">₹{{ product.price }}</span>
                  <span *ngIf="product.originalPrice" class="text-sm text-gray-500 line-through">₹{{ product.originalPrice }}</span>
                  <span *ngIf="product.discount" class="ml-2 bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">
                    -{{ product.discount }}%
                  </span>
                </div>

                <!-- Stock Status -->
                <div class="mt-3">
                  <span class="text-xs px-2 py-1 rounded-full font-semibold"
                    [class.bg-green-100]="product.inStock"
                    [class.text-green-700]="product.inStock"
                    [class.bg-red-100]="!product.inStock"
                    [class.text-red-700]="!product.inStock">
                    {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
                  </span>
                </div>

                <!-- Action Buttons -->
                <div class="mt-4 flex gap-2">
                  <button
                    (click)="addToCart(product)"
                    [disabled]="!product.inStock"
                    class="flex-1 bg-rose-500 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Add to Cart
                  </button>
                  <button
                    (click)="removeFromWishlist(product.id)"
                    class="flex-1 border border-red-300 text-red-600 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="wishlistProducts.length === 0" class="flex flex-col items-center justify-center py-16 px-6 text-center h-full">
          <svg class="w-20 h-20 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Your Wishlist is Empty</h3>
          <p class="text-gray-600 mb-6">Save items you love to your wishlist and purchase them later</p>
          <button
            (click)="continueShopping()"
            class="px-6 py-2 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors">
            Continue Shopping
          </button>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div *ngIf="wishlistProducts.length > 0" class="border-t bg-white p-6 space-y-4">
        <!-- Summary -->
        <div class="flex justify-between items-center pb-4 border-b">
          <span class="text-gray-600">Total Items</span>
          <span class="text-2xl font-bold text-gray-900">{{ wishlistProducts.length }}</span>
        </div>

        <!-- Continue Shopping Button -->
        <button
          (click)="continueShopping()"
          class="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg">
          Continue Shopping
        </button>
      </div>
    </div>
  `,
})
export class WishlistDrawerComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() openCart = new EventEmitter<void>();

  wishlistProducts: Product[] = [];
  isLoading = true;
  Math = Math;

  constructor(
    private userService: UserService,
    private cartService: CartService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadWishlistProducts();
  }

  ngOnChanges() {
    if (this.isOpen) {
      this.loadWishlistProducts();
    }
  }

  loadWishlistProducts() {
    this.isLoading = true;
    const wishlistIds = this.userService.getWishlistItems();
    const allProducts = this.productService.getProducts();
    this.wishlistProducts = allProducts.filter((p: Product) => wishlistIds.includes(p.id));
    this.isLoading = false;
  }

  addToCart(product: Product) {
    // Check if product already exists in cart
    const existingItem = this.cartService.cartItems().find(item => item.product.id === product.id);

    if (existingItem) {
      // If exists, increase quantity
      this.cartService.updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      // If not exists, add to cart
      this.cartService.addToCart(product);
    }

    // Emit event to open cart drawer
    this.openCart.emit();

    // Keep item in wishlist (do not remove automatically)
  }

  removeFromWishlist(productId: string) {
    this.userService.removeFromWishlist(productId);
    this.loadWishlistProducts();
  }

  continueShopping() {
    this.close();
  }

  close() {
    this.closed.emit();
  }
}
