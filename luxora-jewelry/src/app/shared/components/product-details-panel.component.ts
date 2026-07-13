import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-product-details-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div *ngIf="isOpen" class="fixed inset-0 bg-black/50 z-40" (click)="close()"></div>

    <!-- Side Panel -->
    <div [class.translate-x-full]="!isOpen"
      class="fixed right-0 top-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 overflow-y-auto transition-transform duration-300">

      <!-- Close Button -->
      <button (click)="close()" class="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg z-10">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <!-- Product Content -->
      <div *ngIf="product" class="p-6">
        <!-- Image -->
        <img [src]="product.image" [alt]="product.name" class="w-full h-80 object-cover rounded-lg mb-6">

        <!-- Title -->
        <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ product.name }}</h2>

        <!-- Rating -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex gap-0.5">
            <span *ngFor="let i of [1,2,3,4,5]" class="text-sm">
              <span *ngIf="i <= Math.floor(product.rating)" class="text-yellow-400">★</span>
              <span *ngIf="i > product.rating" class="text-gray-300">★</span>
            </span>
          </div>
          <span class="text-sm text-gray-600">({{ product.reviews }} reviews)</span>
        </div>

        <!-- Price -->
        <div class="flex items-center gap-2 mb-6">
          <span class="text-3xl font-bold text-gray-900">₹{{ product.price }}</span>
          <span *ngIf="product.originalPrice" class="text-lg text-gray-500 line-through">
            ₹{{ product.originalPrice }}
          </span>
          <span *ngIf="product.discount" class="ml-2 bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            -{{ product.discount }}%
          </span>
        </div>

        <!-- Description -->
        <div class="mb-6">
          <h3 class="font-semibold text-gray-900 mb-2">Description</h3>
          <p class="text-gray-600">{{ product.description }}</p>
        </div>

        <!-- Details -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <p class="text-sm text-gray-600">Category</p>
            <p class="font-semibold text-gray-900">{{ product.category }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Material</p>
            <p class="font-semibold text-gray-900">{{ product.material }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Stock</p>
            <p class="font-semibold" [class.text-green-600]="product.inStock" [class.text-red-600]="!product.inStock">
              {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
            </p>
          </div>
          <div *ngIf="product.collection">
            <p class="text-sm text-gray-600">Collection</p>
            <p class="font-semibold text-gray-900">{{ product.collection }}</p>
          </div>
        </div>

        <!-- Quantity Selector -->
        <div class="mb-6">
          <label class="block text-sm font-semibold text-gray-900 mb-2">Quantity</label>
          <div class="flex items-center border border-gray-300 rounded-lg w-fit">
            <button (click)="quantity.update(q => Math.max(1, q - 1))" class="px-3 py-2 hover:bg-gray-100">-</button>
            <input type="number" [ngModel]="quantity()" (ngModelChange)="quantity.set($event)"
              class="w-12 text-center border-0 focus:ring-0" min="1">
            <button (click)="quantity.update(q => q + 1)" class="px-3 py-2 hover:bg-gray-100">+</button>
          </div>
        </div>

        <!-- Add to Cart Button -->
        <button (click)="addToCart()" [disabled]="!product.inStock"
          class="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors mb-3">
          {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
        </button>

        <!-- Wishlist Button -->
        <button (click)="toggleWishlist()"
          class="w-full border-2 border-rose-500 text-rose-500 py-3 rounded-lg font-semibold hover:bg-rose-50 transition-colors">
          {{ isWishlisted() ? '♥ Remove from Wishlist' : '♡ Add to Wishlist' }}
        </button>

        <!-- Success Message -->
        <div *ngIf="addedToCart()" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700">
          ✓ Added to cart successfully!
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductDetailsPanelComponent {
  @Input() product: Product | null = null;
  @Input() isOpen = false;
  @Output() closePanel = new EventEmitter<void>();

  quantity = signal(1);
  addedToCart = signal(false);
  isWishlisted = signal(false);
  Math = Math;

  constructor(private cartService: CartService) {}

  addToCart() {
    if (this.product && this.product.inStock) {
      this.cartService.addToCart(this.product, this.quantity());
      this.addedToCart.set(true);

      setTimeout(() => {
        this.addedToCart.set(false);
      }, 2000);

      this.quantity.set(1);
    }
  }

  toggleWishlist() {
    this.isWishlisted.update(v => !v);
  }

  close() {
    this.quantity.set(1);
    this.closePanel.emit();
  }
}
