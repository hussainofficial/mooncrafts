import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { HeaderComponent } from '../home/components/header.component';
import { WishlistPanelComponent } from '../../shared/components/wishlist-panel.component';
import { WishlistDrawerComponent } from '../../shared/components/wishlist-drawer.component';
import { Product } from '../../core/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, HeaderComponent, WishlistPanelComponent, WishlistDrawerComponent],
  template: `
    <!-- Full Navigation Header -->
    <app-header
      [showWishlistPanel]="showWishlistPanel()"
      (toggleWishlist)="openWishlistPanel()"
      (openWishlistDrawer)="openWishlistDrawer()">
    </app-header>

    <!-- Wishlist Drawer -->
    <app-wishlist-drawer
      [isOpen]="showWishlistDrawer()"
      (closed)="closeWishlistDrawer()"
      (openCart)="closeWishlistDrawer()">
    </app-wishlist-drawer>

    <!-- Wishlist Side Panel -->
    <app-wishlist-panel
      [isOpen]="showWishlistPanel()"
      (closedPanel)="closeWishlistPanel()"
      (addedToCart)="onAddedToCart($event)">
    </app-wishlist-panel>

    <div class="min-h-screen bg-gray-50">
      <!-- Page Title -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-rose-500">Shopping Cart</h1>
          <a href="/" class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
            ← Continue Shopping
          </a>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-8">
        <div *ngIf="cartService.cartItems().length === 0" class="text-center py-16">
          <p class="text-gray-600 text-xl mb-4">Your cart is empty</p>
          <a href="/" class="inline-block px-8 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold">
            Start Shopping
          </a>
        </div>

        <div *ngIf="cartService.cartItems().length > 0" class="grid grid-cols-3 gap-8">
          <!-- Cart Items (Left - 2 columns) -->
          <div class="col-span-2">
            <div class="bg-white rounded-lg shadow">
              <div class="border-b p-6">
                <h2 class="text-xl font-bold">Items in Cart ({{ cartService.cartItems().length }})</h2>
              </div>

              <div class="divide-y">
                <div *ngFor="let cartItem of cartService.cartItems()" class="p-6 flex gap-6">
                  <!-- Product Image -->
                  <div class="w-32 h-32 flex-shrink-0">
                    <img [src]="cartItem.product.image" [alt]="cartItem.product.name" class="w-full h-full object-cover rounded-lg">
                  </div>

                  <!-- Product Details -->
                  <div class="flex-1">
                    <h3 class="text-lg font-bold text-gray-900 mb-2">{{ cartItem.product.name }}</h3>
                    <p class="text-sm text-gray-600 mb-4">{{ cartItem.product.description }}</p>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-4">
                        <!-- Price -->
                        <div>
                          <p class="text-sm text-gray-600">Price</p>
                          <p class="text-lg font-bold text-rose-600">₹{{ cartItem.product.price }}</p>
                        </div>

                        <!-- Quantity Controls -->
                        <div class="flex items-center border rounded-lg">
                          <button
                            (click)="decreaseQuantity(cartItem.product.id)"
                            class="px-3 py-2 hover:bg-gray-100 font-bold">
                            −
                          </button>
                          <input
                            type="number"
                            [value]="cartItem.quantity"
                            (change)="updateQuantity(cartItem.product.id, $event)"
                            class="w-12 text-center border-l border-r py-2"
                            min="1">
                          <button
                            (click)="increaseQuantity(cartItem.product.id)"
                            class="px-3 py-2 hover:bg-gray-100 font-bold">
                            +
                          </button>
                        </div>
                      </div>

                      <!-- Remove Button -->
                      <button
                        (click)="removeFromCart(cartItem.product.id)"
                        class="text-red-500 hover:text-red-700 font-semibold">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary (Right - 1 column) -->
          <div class="bg-white rounded-lg shadow p-6 h-fit">
            <h2 class="text-xl font-bold mb-6">Order Summary</h2>

            <div class="space-y-4 mb-6 pb-6 border-b">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-semibold">₹{{ getSubtotal() }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Shipping</span>
                <span class="font-semibold text-green-600">FREE</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tax (18%)</span>
                <span class="font-semibold">₹{{ getTax() }}</span>
              </div>
            </div>

            <div class="flex justify-between text-xl font-bold mb-6">
              <span>Total</span>
              <span class="text-rose-600">₹{{ getTotal() }}</span>
            </div>

            <button
              (click)="checkout()"
              class="w-full bg-rose-500 text-white py-3 rounded-lg font-bold hover:bg-rose-600 transition-colors mb-3">
              Proceed to Checkout
            </button>

            <a
              href="/"
              class="block w-full text-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold">
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CartComponent implements OnInit {
  showWishlistPanel = signal(false);
  showWishlistDrawer = signal(false);

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cart items are loaded from CartService
  }

  openWishlistPanel() {
    this.showWishlistPanel.set(true);
  }

  closeWishlistPanel() {
    this.showWishlistPanel.set(false);
  }

  onAddedToCart(product: Product) {
    this.cartService.addToCart(product);
    this.closeWishlistPanel();
  }

  updateQuantity(productId: string, event: any) {
    const quantity = parseInt(event.target.value) || 1;
    if (quantity > 0) {
      this.cartService.updateQuantity(productId, quantity);
    }
  }

  increaseQuantity(productId: string) {
    const item = this.cartService.cartItems().find(i => i.product.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseQuantity(productId: string) {
    const item = this.cartService.cartItems().find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  removeFromCart(productId: string) {
    this.cartService.removeFromCart(productId);
  }

  getSubtotal(): number {
    return this.cartService.cartItems().reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  }

  getTax(): number {
    return Math.round(this.getSubtotal() * 0.18);
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax();
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }

  openWishlistDrawer() {
    this.showWishlistDrawer.set(true);
  }

  closeWishlistDrawer() {
    this.showWishlistDrawer.set(false);
  }
}
