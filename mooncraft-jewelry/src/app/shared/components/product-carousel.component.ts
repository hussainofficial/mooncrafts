import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="relative group/carousel">
      <!-- Scrollable Track -->
      <div
        #track
        class="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-1 px-1"
      >
        <div
          *ngFor="let product of products"
          class="flex-shrink-0 snap-start w-[46%] sm:w-[31%] md:w-[23%] lg:w-[18%]"
        >
          <app-product-card
            [product]="product"
            (quickView)="onQuickView($event)"
            (addToCart)="onAddToCart($event)"
            (wishlistToggle)="onWishlistToggle($event)"
          ></app-product-card>
        </div>
      </div>

      <!-- Navigation Buttons (desktop) -->
      <button
        (click)="scrollBy(-1)"
        class="hidden md:flex absolute -left-4 top-[38%] -translate-y-1/2 z-10 items-center justify-center p-2 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-colors"
        aria-label="Previous">
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
        </svg>
      </button>
      <button
        (click)="scrollBy(1)"
        class="hidden md:flex absolute -right-4 top-[38%] -translate-y-1/2 z-10 items-center justify-center p-2 bg-white rounded-full shadow-lg hover:bg-rose-50 transition-colors"
        aria-label="Next">
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    :host ::ng-deep .overflow-x-auto {
      scrollbar-width: none;
      -ms-overflow-style: none;
    }
    :host ::ng-deep .overflow-x-auto::-webkit-scrollbar {
      display: none;
    }
  `]
})
export class ProductCarouselComponent {
  @Input() products: Product[] = [];
  @Output() quickView = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();

  @ViewChild('track') track!: ElementRef<HTMLDivElement>;

  scrollBy(direction: 1 | -1) {
    const el = this.track.nativeElement;
    const amount = el.clientWidth * 0.8 * direction;
    el.scrollBy({ left: amount, behavior: 'smooth' });
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
