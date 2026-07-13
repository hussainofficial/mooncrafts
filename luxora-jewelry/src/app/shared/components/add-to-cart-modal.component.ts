import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models';

@Component({
  selector: 'app-add-to-cart-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Backdrop -->
    <div *ngIf="isOpen" (click)="close()" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <!-- Modal -->
      <div (click)="$event.stopPropagation()" class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        <!-- Close Button -->
        <button (click)="close()" class="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>

        <div *ngIf="product" class="text-center">
          <!-- Product Image -->
          <img [src]="product.image" [alt]="product.name" class="w-full h-48 object-cover rounded-lg mb-4">

          <!-- Product Name -->
          <h3 class="text-xl font-bold text-gray-900 mb-2">{{ product.name }}</h3>

          <!-- Product Price -->
          <p class="text-2xl font-bold text-rose-600 mb-4">₹{{ product.price }}</p>

          <!-- Message -->
          <p class="text-gray-600 mb-6">Add this item to your cart?</p>

          <!-- Action Buttons -->
          <div class="flex gap-4">
            <button (click)="close()" class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold">
              Cancel
            </button>
            <button (click)="addToCart()" class="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AddToCartModalComponent {
  @Input() isOpen = false;
  @Input() product: Product | null = null;
  @Output() confirmed = new EventEmitter<Product>();
  @Output() closed = new EventEmitter<void>();

  addToCart() {
    if (this.product) {
      this.confirmed.emit(this.product);
    }
  }

  close() {
    this.closed.emit();
  }
}
