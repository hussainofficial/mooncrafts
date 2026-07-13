import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models';
import { CartService } from '../../core/services/cart.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { UserService } from '../../core/services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div *ngIf="isOpen" (click)="close()" class="fixed inset-0 bg-black/40 z-40 transition-opacity duration-300"></div>

    <!-- Cart Drawer -->
    <div class="fixed right-0 top-0 h-screen z-50 transition-transform duration-300 bg-white shadow-2xl overflow-hidden flex flex-col"
      [class.translate-x-full]="!isOpen"
      [ngClass]="{ 'w-full md:w-[480px]': true }">

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b bg-white sticky top-0">
        <h2 class="text-2xl font-bold text-gray-900">Shopping Cart</h2>
        <button (click)="close()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- Success Message (Animated) -->
      <div *ngIf="showSuccessMessage()" class="bg-green-50 border-l-4 border-green-500 p-4 mx-4 mt-4 rounded animate-in fade-in">
        <div class="flex items-center gap-2">
          <svg class="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
          <span class="text-green-700 font-semibold">Added to Cart ✓</span>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div class="flex-1 overflow-y-auto">
        <!-- Current Product Being Added (if any) -->
        <div *ngIf="currentProductSignal()" class="border-b bg-gray-50 p-6">
          <div class="flex gap-4">
            <!-- Product Image -->
            <div class="w-24 h-24 flex-shrink-0">
              <img [src]="currentProductSignal()!.image" [alt]="currentProductSignal()!.name" class="w-full h-full object-cover rounded-lg">
            </div>

            <!-- Product Details -->
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 text-sm">{{ currentProductSignal()!.name }}</h3>
              <p class="text-rose-600 font-bold text-lg mt-1">₹{{ currentProductSignal()!.price }}</p>

              <!-- Color Selector (if available) -->
              <div *ngIf="getAvailableColors().length > 0" class="mt-3">
                <label class="text-xs text-gray-600 block mb-2">Color</label>
                <select [(ngModel)]="selectedColor" class="w-full text-xs border rounded px-2 py-1 bg-white">
                  <option *ngFor="let color of getAvailableColors()" [value]="color">{{ color }}</option>
                </select>
              </div>

              <!-- Size Selector (if available) -->
              <div *ngIf="getAvailableSizes().length > 0" class="mt-3">
                <label class="text-xs text-gray-600 block mb-2">Size</label>
                <select [(ngModel)]="selectedSize" class="w-full text-xs border rounded px-2 py-1 bg-white">
                  <option *ngFor="let size of getAvailableSizes()" [value]="size">{{ size }}</option>
                </select>
              </div>

              <!-- Quantity Selector -->
              <div class="mt-3 flex items-center border rounded-lg w-fit">
                <button (click)="decreaseQuantity()" class="px-2 py-1 hover:bg-gray-100">−</button>
                <input type="number" [(ngModel)]="selectedQuantity" min="1" class="w-10 text-center border-l border-r py-1">
                <button (click)="increaseQuantity()" class="px-2 py-1 hover:bg-gray-100">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Items -->
        <div *ngIf="cartService.cartItems().length > 0" class="divide-y">
          <div *ngFor="let cartItem of cartService.cartItems()" class="p-6 border-b">
            <div class="flex gap-4">
              <!-- Product Image -->
              <div class="w-20 h-20 flex-shrink-0">
                <img [src]="cartItem.product.image" [alt]="cartItem.product.name" class="w-full h-full object-cover rounded-lg">
              </div>

              <!-- Product Details -->
              <div class="flex-1">
                <h3 class="font-semibold text-gray-900 text-sm">{{ cartItem.product.name }}</h3>
                <p class="text-gray-600 text-xs mt-1">₹{{ cartItem.product.price }} x {{ cartItem.quantity }}</p>
                <p class="text-rose-600 font-bold text-sm mt-2">₹{{ cartItem.product.price * cartItem.quantity }}</p>

                <!-- Quantity Controls -->
                <div class="mt-3 flex items-center border rounded-lg w-fit">
                  <button (click)="decreaseItemQuantity(cartItem.product.id)" class="px-2 py-1 hover:bg-gray-100 text-sm">−</button>
                  <span class="w-8 text-center text-sm">{{ cartItem.quantity }}</span>
                  <button (click)="increaseItemQuantity(cartItem.product.id)" class="px-2 py-1 hover:bg-gray-100 text-sm">+</button>
                </div>

                <!-- Actions -->
                <div class="mt-3 flex gap-2 text-xs">
                  <button (click)="moveToWishlist(cartItem.product.id)" class="text-rose-600 hover:text-rose-700 font-semibold">♥ Wishlist</button>
                  <span class="text-gray-300">•</span>
                  <button (click)="removeItem(cartItem.product.id)" class="text-red-600 hover:text-red-700 font-semibold">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty Cart -->
        <div *ngIf="cartService.cartItems().length === 0 && !currentProductSignal()" class="flex flex-col items-center justify-center py-12 px-6 text-center">
          <svg class="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
          </svg>
          <p class="text-gray-600 font-semibold">Your cart is empty</p>
          <p class="text-gray-500 text-sm mt-2">Add items to get started</p>
        </div>

        <!-- You May Also Like Section -->
        <div *ngIf="suggestedProducts.length > 0" class="border-t p-6">
          <h3 class="font-bold text-gray-900 mb-4">You May Also Like</h3>
          <div class="flex gap-3 overflow-x-auto">
            <div *ngFor="let product of suggestedProducts" class="flex-shrink-0 w-36 cursor-pointer" (click)="selectProduct(product)">
              <div class="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-2">
                <img [src]="product.image" [alt]="product.name" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>
              <p class="font-semibold text-gray-900 text-sm line-clamp-2">{{ product.name }}</p>
              <p class="text-rose-600 font-bold text-sm">₹{{ product.price }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Sticky Footer -->
      <div class="border-t bg-white p-6 space-y-4">
        <!-- Subtotal -->
        <div class="flex justify-between items-center pb-4 border-b">
          <span class="text-gray-600">Subtotal</span>
          <span class="text-2xl font-bold text-gray-900">₹{{ getCartSubtotal() }}</span>
        </div>

        <!-- Checkout Button -->
        <button
          (click)="checkout()"
          class="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 rounded-lg font-bold hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-md hover:shadow-lg">
          Proceed
        </button>

        <!-- Continue Shopping Button -->
        <button
          (click)="continueShopping()"
          class="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:border-gray-400 hover:bg-gray-50 transition-colors">
          Continue Shopping
        </button>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .animate-in {
      animation: fadeIn 0.3s ease-in;
    }
    .fade-in {
      animation: fadeIn 0.3s ease-in;
    }
  `]
})
export class CartDrawerComponent implements OnInit {
  @Input() isOpen = false;
  @Input() set currentProduct(product: Product | null) {
    this.currentProductSignal.set(product);
    if (product && this.isOpen) {
      this.showSuccessMessage.set(true);
      setTimeout(() => this.showSuccessMessage.set(false), 2000);
    }
  }
  @Output() closed = new EventEmitter<void>();

  currentProductSignal = signal<Product | null>(null);
  selectedColor = '';
  selectedSize = '';
  selectedQuantity = 1;
  suggestedProducts: Product[] = [];
  showSuccessMessage = signal(false);

  constructor(
    public cartService: CartService,
    private mockDataService: MockDataService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadSuggestedProducts();
  }

  loadSuggestedProducts() {
    const allProducts = this.mockDataService.getProducts();
    this.suggestedProducts = allProducts.filter(p => !this.cartService.cartItems().some(ci => ci.product.id === p.id)).slice(0, 6);
  }

  getAvailableColors(): string[] {
    return this.currentProductSignal()?.colors || [];
  }

  getAvailableSizes(): string[] {
    return this.currentProductSignal()?.sizes || [];
  }

  selectProduct(product: Product) {
    this.currentProductSignal.set(product);
    this.selectedColor = '';
    this.selectedSize = '';
    this.selectedQuantity = 1;
  }

  increaseQuantity() {
    this.selectedQuantity++;
  }

  decreaseQuantity() {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  increaseItemQuantity(productId: string) {
    const item = this.cartService.cartItems().find(i => i.product.id === productId);
    if (item) {
      this.cartService.updateQuantity(productId, item.quantity + 1);
    }
  }

  decreaseItemQuantity(productId: string) {
    const item = this.cartService.cartItems().find(i => i.product.id === productId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(productId, item.quantity - 1);
    }
  }

  removeItem(productId: string) {
    this.cartService.removeFromCart(productId);
    this.loadSuggestedProducts();
  }

  moveToWishlist(productId: string) {
    this.userService.addToWishlist(productId);
    this.removeItem(productId);
  }

  getCartSubtotal(): number {
    return this.cartService.cartItems().reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  checkout() {
    // alert(`Proceeding to checkout with total: ₹${this.getCartSubtotal()}`);
     this.router.navigate(['/cart']);
    this.close();
  }

  continueShopping() {
    this.close();
  }

  close() {
    this.closed.emit();
  }
}
