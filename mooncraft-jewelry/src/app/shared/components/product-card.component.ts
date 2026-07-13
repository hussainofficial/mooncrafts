import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer">
      <!-- Image Container - Compact -->
      <a [routerLink]="['/product', product.id]" class="block relative overflow-hidden bg-gray-100 h-40 md:h-48">
        <img
          [src]="product.image"
          [alt]="product.name"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />

        <!-- Discount Badge - Smaller -->
        <div *ngIf="product.discount" class="absolute top-2 right-2 bg-rose-500 text-white px-2 py-0.5 rounded-full text-xs font-bold">
          -{{ product.discount }}%
        </div>

        <!-- Wishlist Button - Smaller -->
        <button
          class="absolute top-2 left-2 p-1.5 bg-white rounded-full shadow-sm hover:bg-rose-100 transition-colors"
          (click)="onWishlistToggle()"
        >
          <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </button>
      </a>

      <!-- Content - Minimal Padding -->
      <div class="p-2">
        <!-- Name -->
        <h3 class="text-xs font-semibold text-gray-900 line-clamp-2 mb-1">
          {{ product.name }}
        </h3>

        <!-- Category/Type -->
        <p class="text-xs text-gray-500 mb-1">{{ product.category || 'Jewelry' }}</p>

        <!-- Rating -->
        <div class="flex items-center gap-0.5 mb-1.5">
          <div class="flex gap-0.5">
            <span *ngFor="let i of [1,2,3,4,5]" class="text-xs leading-none">
              <span *ngIf="i <= Math.floor(product.rating)" class="text-yellow-400">★</span>
              <span *ngIf="i > product.rating" class="text-gray-300">★</span>
            </span>
          </div>
          <span class="text-xs text-gray-500">({{ product.reviews }})</span>
        </div>

        <!-- Price -->
        <div class="flex items-center gap-1 mb-2">
          <span class="text-xs font-bold text-gray-900">₹{{ product.price }}</span>
          <span *ngIf="product.originalPrice" class="text-xs text-gray-400 line-through">
            ₹{{ product.originalPrice }}
          </span>
        </div>

        <!-- Add to Cart -->
        <button
          class="w-full bg-rose-500 text-white py-1 text-xs rounded font-semibold hover:bg-rose-600 transition-colors"
          (click)="onAddToCart()"
        >
          Add to Cart
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() quickView = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();

  Math = Math;

  onQuickView() {
    this.quickView.emit(this.product);
  }

  onAddToCart() {
    this.addToCart.emit(this.product);
  }

  onWishlistToggle() {
    this.wishlistToggle.emit(this.product);
  }

  onCardClick() {
    this.quickView.emit(this.product);
  }
}
