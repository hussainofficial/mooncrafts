import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models';
import { ProductCardComponent } from './product-card.component';

@Component({
  selector: 'app-product-grid',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      <app-product-card
        *ngFor="let product of products"
        [product]="product"
        (quickView)="onQuickView($event)"
        (addToCart)="onAddToCart($event)"
        (wishlistToggle)="onWishlistToggle($event)"
      ></app-product-card>
    </div>
  `,
})
export class ProductGridComponent {
  @Input() products: Product[] = [];
  @Output() quickView = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();
  @Output() wishlistToggle = new EventEmitter<Product>();

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
