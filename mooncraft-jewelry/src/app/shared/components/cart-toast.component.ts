import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-cart-toast',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:right-4 sm:bottom-4 z-[60] flex justify-center sm:justify-end pointer-events-none px-4 pb-4 sm:px-0 sm:pb-0">
      <div
        class="pointer-events-auto w-full sm:w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-300"
        [ngClass]="cartService.showAddedToast() ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 invisible'"
      >
        <div class="p-4 flex gap-3">
          <img
            *ngIf="cartService.lastAddedProduct()"
            [src]="cartService.lastAddedProduct()!.image"
            [alt]="cartService.lastAddedProduct()!.name"
            class="w-12 h-12 rounded-lg object-cover flex-shrink-0"
          />
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-gray-900 text-sm flex items-center gap-1">
              <span class="text-green-500">✓</span> Item added to your cart!
            </p>
            <p *ngIf="cartService.lastAddedProduct()" class="text-xs text-gray-500 mt-0.5 truncate">
              {{ cartService.lastAddedProduct()!.name }}
            </p>
            <div class="flex gap-2 mt-3">
              <button
                (click)="openCart()"
                class="text-xs font-semibold bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg transition-colors">
                Open Cart
              </button>
              <button
                (click)="continueShopping()"
                class="text-xs font-semibold text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                Back to Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CartToastComponent {
  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  openCart() {
    this.cartService.dismissAddedToast();
    this.router.navigate(['/cart']);
  }

  continueShopping() {
    this.cartService.dismissAddedToast();
  }
}
