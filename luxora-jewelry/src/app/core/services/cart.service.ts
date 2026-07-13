import { Injectable } from '@angular/core';
import { signal } from '@angular/core';
import { Product } from '../models';

export interface CartItem {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private readonly STORAGE_KEY = 'luxora_cart';
  cartItems = signal<CartItem[]>([]);
  cartCount = signal(0);

  constructor() {
    this.loadCart();
  }

  private loadCart() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.cartItems.set(JSON.parse(saved));
        this.updateCount();
      }
    } catch (e) {
      console.error('Failed to load cart:', e);
    }
  }

  private saveCart() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cartItems()));
    this.updateCount();
  }

  private updateCount() {
    const count = this.cartItems().reduce((sum, item) => sum + item.quantity, 0);
    this.cartCount.set(count);
  }

  addToCart(product: Product, quantity: number = 1) {
    const items = [...this.cartItems()];
    const existing = items.find(item => item.product.id === product.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({ product, quantity });
    }

    this.cartItems.set(items);
    this.saveCart();
  }

  removeFromCart(productId: string) {
    const items = this.cartItems().filter(item => item.product.id !== productId);
    this.cartItems.set(items);
    this.saveCart();
  }

  updateQuantity(productId: string, quantity: number) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const items = [...this.cartItems()];
    const item = items.find(i => i.product.id === productId);
    if (item) {
      item.quantity = quantity;
      this.cartItems.set(items);
      this.saveCart();
    }
  }

  clearCart() {
    this.cartItems.set([]);
    this.saveCart();
  }

  getTotal(): number {
    return this.cartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  getCartTotal(): number {
    return this.getTotal();
  }

  getCartItems() {
    return this.cartItems().map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));
  }
}
