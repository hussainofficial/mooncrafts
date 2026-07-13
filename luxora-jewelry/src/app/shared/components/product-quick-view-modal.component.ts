import { Component, Input, Output, EventEmitter, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models';

@Component({
  selector: 'app-product-quick-view-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Bootstrap Modal -->
    <div class="modal fade modal-luxury" id="quickViewModal" tabindex="-1" [class.show]="isOpen()" [style.display]="isOpen() ? 'block' : 'none'">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
          <!-- Header with Gradient -->
          <div class="modal-header border-0">
            <h5 class="modal-title">Quick View</h5>
            <button type="button" class="btn-close btn-close-white" (click)="onClose()"></button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <div class="row g-4" *ngIf="product">
              <!-- Product Image -->
              <div class="col-md-6">
                <div class="product-image-container ratio ratio-1x1">
                  <img [src]="product.image" [alt]="product.name" class="object-fit-cover">
                </div>
              </div>

              <!-- Product Details -->
              <div class="col-md-6">
                <!-- Title -->
                <h3 class="mb-2">{{ product.name }}</h3>

                <!-- Rating -->
                <div class="d-flex align-items-center gap-2 mb-3">
                  <div class="d-flex gap-1">
                    <span *ngFor="let i of [1,2,3,4,5]" class="text-warning">★</span>
                  </div>
                  <small class="text-muted">({{ product.reviews }} reviews)</small>
                </div>

                <!-- Price Section with Discount -->
                <div class="mb-4">
                  <h4 class="text-primary fw-bold mb-2">
                    ₹{{ product.price }}
                    <small *ngIf="product.originalPrice" class="text-muted text-decoration-line-through">
                      ₹{{ product.originalPrice }}
                    </small>
                  </h4>
                  <p class="text-success small" *ngIf="product.discount">
                    <i class="bi bi-check-circle"></i> Save {{ product.discount }}%
                  </p>
                </div>

                <!-- Description -->
                <p class="text-muted mb-4">{{ product.description || 'Premium jewelry crafted with precision and elegance.' }}</p>

                <!-- Quantity Selector -->
                <div class="mb-4">
                  <label class="form-label fw-semibold">Quantity:</label>
                  <div class="quantity-selector">
                    <button class="btn btn-sm btn-outline-primary" (click)="decreaseQty()">−</button>
                    <input type="number" class="form-control text-center" [(ngModel)]="quantity" min="1" max="10" style="width: 60px;">
                    <button class="btn btn-sm btn-outline-primary" (click)="increaseQty()">+</button>
                  </div>
                </div>

                <!-- Features/Tags -->
                <div class="mb-4">
                  <h6 class="mb-2">Features:</h6>
                  <div class="d-flex flex-wrap gap-2">
                    <span class="badge badge-light-rose">Premium Quality</span>
                    <span class="badge badge-light-rose">Certified</span>
                    <span class="badge badge-light-rose">Free Shipping</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="d-grid gap-2">
                  <button type="button" class="btn btn-primary btn-lg fw-bold" (click)="onAddToCart()">
                    <i class="bi bi-cart-plus"></i> Add to Cart
                  </button>
                  <button type="button" class="btn btn-outline-primary" (click)="onWishlist()">
                    <i class="bi bi-heart"></i> Add to Wishlist
                  </button>
                </div>

                <!-- Trust Badges -->
                <div class="mt-4 pt-4 border-top">
                  <p class="text-xs text-muted">
                    <i class="bi bi-shield-check text-success"></i> Secure Payment
                    <i class="bi bi-truck text-success ms-3"></i> Fast Delivery
                    <i class="bi bi-arrow-counterclockwise text-success ms-3"></i> Easy Returns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Backdrop -->
    <div class="modal-backdrop fade" [class.show]="isOpen()" *ngIf="isOpen()"></div>
  `,
  styles: [`
    .modal-luxury .modal-content {
      border-radius: 1.25rem;
      border: none;
    }

    .modal-luxury .modal-header {
      background: linear-gradient(135deg, #ec4899 0%, #f472b6 100%);
      color: white;
      border-radius: 1.25rem 1.25rem 0 0;
    }

    .product-image-container {
      border-radius: 1rem;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(236, 72, 153, 0.1);
    }

    .quantity-selector {
      display: flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
    }

    .badge-light-rose {
      background-color: #fce7f3;
      color: #ec4899;
      font-weight: 600;
    }

    .btn-close-white {
      filter: brightness(0) invert(1);
    }
  `]
})
export class ProductQuickViewModalComponent {
  @Input() isOpen = signal(false);
  @Input() product: Product | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<{ product: Product; quantity: number }>();
  @Output() wishlist = new EventEmitter<Product>();

  quantity = 1;

  increaseQty() {
    if (this.quantity < 10) this.quantity++;
  }

  decreaseQty() {
    if (this.quantity > 1) this.quantity--;
  }

  onClose() {
    this.close.emit();
  }

  onAddToCart() {
    if (this.product) {
      this.addToCart.emit({ product: this.product, quantity: this.quantity });
      this.onClose();
    }
  }

  onWishlist() {
    if (this.product) {
      this.wishlist.emit(this.product);
    }
  }
}
