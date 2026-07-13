import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="relative">
      <!-- Products Container -->
      <div class="overflow-hidden">
        <div class="flex transition-transform duration-300" [style.transform]="'translateX(-' + (currentIndex() * itemWidth) + '%)'">
          <div *ngFor="let product of products" class="flex-shrink-0" [style.width.%]="itemWidth">
            <div class="px-1 sm:px-2">
              <app-product-card
                [product]="product"
                (quickView)="onQuickView($event)"
                (addToCart)="onAddToCart($event)"
                (wishlistToggle)="onWishlistToggle($event)"
              ></app-product-card>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Buttons -->
      <div class="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <button
          (click)="previousSlide()"
          class="p-2 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>
      </div>
      <div class="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
        <button
          (click)="nextSlide()"
          class="p-2 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-colors"
        >
          <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
})
export class ProductCarouselComponent {
  @Input() products: Product[] = [];
  @Output() quickView = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();

  currentIndex = signal(0);
  itemWidth = 20; // 5 items per view on desktop

  nextSlide() {
    this.currentIndex.set((this.currentIndex() + 1) % Math.ceil(this.products.length / 5));
  }

  previousSlide() {
    this.currentIndex.set(
      this.currentIndex() === 0 ? Math.ceil(this.products.length / 5) - 1 : this.currentIndex() - 1
    );
  }

  onQuickView(product: Product) {
    this.quickView.emit(product);
  }

  onAddToCart(product: Product) {
    this.addToCart.emit(product);
  }

  onWishlistToggle(product: Product) {
    this.wishlistToggle.emit(product);
  }
}
