import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderService, Order } from '../../core/services/order.service';
import { AddressService, Address } from '../../core/services/address.service';
import { WishlistService, WishlistItem } from '../../core/services/wishlist.service';
import { HeaderComponent } from '../home/components/header.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <!-- Full Navigation Header -->
    <app-header></app-header>

    <div class="min-h-screen bg-gray-50">
      <!-- Page Title Section -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <h1 class="text-xl sm:text-2xl font-bold text-rose-500">My Profile</h1>
          <button
            (click)="logout()"
            class="px-4 sm:px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm sm:text-base">
            Logout
          </button>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div *ngIf="!authService.isLoggedIn()" class="text-center py-12">
          <p class="text-gray-600 text-lg mb-4">Please login to view your profile</p>
          <a href="/login" class="inline-block px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold">
            Go to Login
          </a>
        </div>

        <div *ngIf="authService.isLoggedIn()" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column - Profile Info -->
          <div class="lg:col-span-2 space-y-6">
            <!-- Personal Details -->
            <div class="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 class="text-xl font-bold mb-4">Personal Details</h2>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Name</p>
                  <p class="font-semibold text-gray-900">{{ authService.currentUser()?.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Email</p>
                  <p class="font-semibold text-gray-900">{{ authService.currentUser()?.email }}</p>
                </div>
                <div *ngIf="authService.currentUser()?.phone">
                  <p class="text-sm text-gray-600">Phone</p>
                  <p class="font-semibold text-gray-900">{{ authService.currentUser()?.phone }}</p>
                </div>
                <div *ngIf="authService.currentUser()?.created_at">
                  <p class="text-sm text-gray-600">Member Since</p>
                  <p class="font-semibold text-gray-900">{{ authService.currentUser()?.created_at | date: 'MMM dd, yyyy' }}</p>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold mb-4">Shipping Address</h2>
              <div *ngIf="loadingAddresses()" class="text-center py-4 text-gray-500">Loading address...</div>
              <div *ngIf="!loadingAddresses() && !defaultAddress()" class="text-center py-4">
                <p class="text-gray-600">No address on file</p>
              </div>
              <div *ngIf="!loadingAddresses() && defaultAddress() as addr" class="space-y-2">
                <p class="font-semibold">{{ addr.full_name }}</p>
                <p class="text-gray-600">{{ addr.street_address }}</p>
                <p class="text-gray-600">{{ addr.city_name }}, {{ addr.state_name }} {{ addr.postal_code }}</p>
                <p class="text-gray-600">{{ addr.country }}</p>
              </div>
            </div>

            <!-- Order History -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold mb-4">Order History ({{ orders().length }})</h2>
              <div *ngIf="loadingOrders()" class="text-center py-8 text-gray-500">Loading orders...</div>
              <div *ngIf="!loadingOrders() && orders().length === 0" class="text-center py-8">
                <p class="text-gray-600">No orders yet</p>
              </div>
              <div *ngFor="let order of orders()" class="border rounded-lg p-4 mb-4">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="font-semibold">Order #{{ order.id }}</p>
                    <p class="text-sm text-gray-600">{{ order.created_at | date: 'MMM dd, yyyy' }}</p>
                  </div>
                  <span [class.bg-green-100]="order.status === 'delivered'" [class.text-green-700]="order.status === 'delivered'" [class.bg-yellow-100]="order.status !== 'delivered'" [class.text-yellow-700]="order.status !== 'delivered'" class="px-3 py-1 rounded-full text-sm font-semibold">
                    {{ order.status | titlecase }}
                  </span>
                </div>
                <div class="mb-2">
                  <p class="text-sm text-gray-600">Items: {{ order.items.length }}</p>
                  <p class="font-semibold text-rose-500">Total: ₹{{ order.total_amount }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column - Wishlist -->
          <div class="bg-white rounded-lg shadow p-6 h-fit">
            <h2 class="text-xl font-bold mb-4">Wishlist ({{ wishlist().length }})</h2>
            <div *ngIf="loadingWishlist()" class="text-center py-8 text-gray-500">Loading wishlist...</div>
            <div *ngIf="!loadingWishlist() && wishlist().length === 0" class="text-center py-8">
              <p class="text-gray-600">Your wishlist is empty</p>
            </div>
            <div *ngFor="let item of wishlist()" class="border rounded-lg p-3 mb-3 flex gap-3">
              <img [src]="item.product_image" [alt]="item.product_name" class="w-14 h-14 rounded object-cover flex-shrink-0">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold text-gray-900 truncate">{{ item.product_name }}</p>
                <p class="text-sm text-rose-500 font-semibold">₹{{ item.product_price }}</p>
                <button
                  (click)="removeFromWishlist(item.product_id)"
                  class="mt-2 w-full text-xs bg-red-100 text-red-600 py-1 rounded hover:bg-red-200">
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  orders = signal<Order[]>([]);
  loadingOrders = signal(false);
  defaultAddress = signal<Address | null>(null);
  loadingAddresses = signal(false);
  wishlist = signal<WishlistItem[]>([]);
  loadingWishlist = signal(false);

  constructor(
    public userService: UserService,
    public authService: AuthService,
    private orderService: OrderService,
    private addressService: AddressService,
    private wishlistService: WishlistService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadingOrders.set(true);
    this.orderService.getUserOrders().subscribe({
      next: (response) => {
        this.orders.set(response.data || []);
        this.loadingOrders.set(false);
      },
      error: () => {
        this.loadingOrders.set(false);
      },
    });

    this.loadingAddresses.set(true);
    this.addressService.getUserAddresses().subscribe({
      next: (response) => {
        const addresses = response.data || [];
        this.defaultAddress.set(addresses.find((a) => a.is_default) || addresses[0] || null);
        this.loadingAddresses.set(false);
      },
      error: () => {
        this.loadingAddresses.set(false);
      },
    });

    this.loadWishlist();
  }

  private loadWishlist() {
    this.loadingWishlist.set(true);
    this.wishlistService.getWishlist().subscribe({
      next: (response) => {
        this.wishlist.set(response.data || []);
        this.loadingWishlist.set(false);
      },
      error: () => {
        this.loadingWishlist.set(false);
      },
    });
  }

  logout() {
    this.userService.logoutUser();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  removeFromWishlist(productId: number) {
    this.wishlistService.removeFromWishlist(productId).subscribe(() => {
      this.wishlist.update((items) => items.filter((i) => i.product_id !== productId));
    });
  }
}
