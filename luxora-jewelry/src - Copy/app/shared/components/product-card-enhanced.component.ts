import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-card-enhanced',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="card product-card-hover h-full border-0 shadow-sm transition-all duration-300 group">
      <!-- Image Container with Wishlist -->
      <a [routerLink]="['/product', product.id]" class="block relative overflow-hidden bg-gray-100 aspect-square position-relative">
        <img
          [src]="product.image"
          [alt]="product.name"
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        <!-- Discount Badge -->
        <div *ngIf="product.discount" class="position-absolute top-3 end-3">
          <span class="badge badge-rose">-{{ product.discount }}%</span>
        </div>

        <!-- Wishlist Button with Heart Animation -->
        <button
          class="position-absolute top-3 start-3 btn btn-light btn-sm rounded-circle p-2 wishlist-btn transition-all"
          [class.liked]="isWishlisted()"
          (click)="onWishlistToggle(); $event.preventDefault()"
          [attr.aria-label]="isWishlisted() ? 'Remove from wishlist' : 'Add to wishlist'"
        >
          <svg class="w-5 h-5" [class.text-rose-500]="isWishlisted()" [class.text-gray-400]="!isWishlisted()" fill="currentColor" viewBox="0 0 24 24">
            <path *ngIf="isWishlisted()" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            <path *ngIf="!isWishlisted()" stroke="currentColor" stroke-width="2" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        <!-- Quick View Button -->
        <button
          class="position-absolute bottom-3 start-50 translate-middle-x btn btn-sm btn-primary opacity-0 group-hover:opacity-100 transition-all duration-300"
          (click)="onQuickView(); $event.preventDefault()"
        >
          Quick View
        </button>
      </a>

      <!-- Card Body with Better Spacing -->
      <div class="card-body d-flex flex-column flex-grow-1">
        <!-- Product Name -->
        <h5 class="card-title text-sm font-bold text-gray-900 mb-2 line-clamp-2">
          {{ product.name }}
        </h5>

        <!-- Star Rating with Tooltip -->
        <div class="d-flex align-items-center gap-2 mb-3 rating-stars">
          <div class="d-flex gap-1">
            <span *ngFor="let i of [1,2,3,4,5]" class="text-sm">
              <span *ngIf="i <= Math.floor(product.rating)" class="text-warning">★</span>
              <span *ngIf="i > product.rating" class="text-secondary-50">★</span>
            </span>
          </div>
          <small class="text-muted">({{ product.reviews }})</small>
        </div>

        <!-- Price Section -->
        <div class="mb-3">
          <div class="product-price">
            ₹{{ product.price }}
            <span *ngIf="product.originalPrice" class="original-price">
              ₹{{ product.originalPrice }}
            </span>
          </div>
        </div>

        <!-- Add to Cart Button - Prominent CTA -->
        <button
          class="btn btn-primary w-100 mt-auto font-semibold py-2"
          (click)="onAddToCart()"
        >
          <i class="bi bi-cart-plus me-2"></i>
          Add to Cart
        </button>
      </div>

      <!-- Hover Info Tooltip -->
      <div class="position-absolute bottom-0 end-0 p-2 d-none"
        [class.d-block]="showTooltip()"
        role="tooltip"
        class="tooltip-content bg-rose-500 text-white rounded text-xs p-2">
        Available in stock
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }

    .card {
      border-radius: 1rem;
      overflow: hidden;
    }

    .card:hover {
      box-shadow: 0 20px 40px rgba(236, 72, 153, 0.15);
    }

    .badge-rose {
      background-color: #ec4899;
      color: white;
      font-weight: 600;
      padding: 6px 12px;
    }

    .btn-light {
      background-color: rgba(255, 255, 255, 0.95);
      border: none;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .btn-light:hover {
      background-color: white;
      transform: scale(1.1);
    }

    .rating-stars .star {
      transition: transform 0.2s ease;
    }

    .rating-stars .star:hover {
      transform: scale(1.2);
    }
  `]
})
export class ProductCardEnhancedComponent {
  @Input() product!: Product;
  @Output() quickView = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();

  showTooltip = signal(false);
  wishlisted = signal(false);

  Math = Math;

  isWishlisted(): boolean {
    return this.wishlisted();
  }

  onQuickView() {
    this.quickView.emit(this.product);
  }

  onAddToCart() {
    this.addToCart.emit(this.product);
  }

  onWishlistToggle() {
    this.wishlisted.update(val => !val);
    this.wishlistToggle.emit(this.product);
  }
}
