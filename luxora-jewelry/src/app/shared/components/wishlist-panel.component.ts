import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models';

@Component({
  selector: 'app-wishlist-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div
      *ngIf="isOpen"
      (click)="close()"
      class="fixed inset-0 bg-black/30 z-30 transition-opacity"
      [class.opacity-0]="!isOpen"
      [class.pointer-events-none]="!isOpen">
    </div>

    <!-- Side Panel -->
    <div
      class="fixed right-0 top-0 h-screen w-96 bg-white shadow-2xl z-40 flex flex-col transition-transform duration-300"
      [class.translate-x-full]="!isOpen">

      <!-- Header -->
      <div class="border-b p-6 flex items-center justify-between">
        <h2 class="text-xl font-bold text-rose-500">Wishlist ({{ wishlistProducts.length }})</h2>
        <button
          (click)="close()"
          class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Empty State -->
        <div *ngIf="wishlistProducts.length === 0" class="p-6 text-center py-12">
          <p class="text-gray-600 mb-4">Your wishlist is empty</p>
          <button
            (click)="close()"
            class="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold">
            Continue Shopping
          </button>
        </div>

        <!-- Wishlist Items -->
        <div class="divide-y">
          <div *ngFor="let product of wishlistProducts" class="p-4 hover:bg-gray-50">
            <!-- Product Image -->
            <div class="mb-3">
              <img [src]="product.image" [alt]="product.name" class="w-full h-32 object-cover rounded-lg">
            </div>

            <!-- Product Info -->
            <h3 class="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">{{ product.name }}</h3>

            <div class="flex items-center justify-between mb-3">
              <span class="text-lg font-bold text-rose-600">₹{{ product.price }}</span>
              <span class="text-xs px-2 py-1 rounded-full"
                [class.bg-green-100]="product.inStock"
                [class.text-green-700]="product.inStock"
                [class.bg-red-100]="!product.inStock"
                [class.text-red-700]="!product.inStock">
                {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-2">
              <button
                (click)="addToCart(product)"
                [disabled]="!product.inStock"
                class="flex-1 bg-rose-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-rose-600 disabled:bg-gray-400 transition-colors">
                Add to Cart
              </button>
              <button
                (click)="removeFromWishlist(product.id)"
                class="flex-1 bg-red-100 text-red-600 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t p-6">
        <button
          (click)="close()"
          class="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-colors">
          Continue Shopping
        </button>
      </div>
    </div>
  `,
})
export class WishlistPanelComponent implements OnInit {
  @Input() isOpen = false;
  @Output() closedPanel = new EventEmitter<void>();
  @Output() addedToCart = new EventEmitter<Product>();

  wishlistProducts: Product[] = [];

  constructor(
    public userService: UserService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadWishlistProducts();
  }

  ngOnChanges() {
    this.loadWishlistProducts();
  }

  loadWishlistProducts() {
    const wishlistIds = this.userService.getWishlistItems();
    const allProducts = this.productService.getProducts();
    this.wishlistProducts = allProducts.filter(p => wishlistIds.includes(p.id));
  }

  close() {
    this.closedPanel.emit();
  }

  removeFromWishlist(productId: string) {
    this.userService.removeFromWishlist(productId);
    this.loadWishlistProducts();
  }

  addToCart(product: Product) {
    this.addedToCart.emit(product);
  }
}
