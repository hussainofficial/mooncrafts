import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
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
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-rose-500">My Profile</h1>
          <button
            (click)="logout()"
            class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
            Logout
          </button>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-8">
        <div *ngIf="!userService.currentUserProfile() && !authService.isLoggedIn()" class="text-center py-12">
          <p class="text-gray-600 text-lg mb-4">Please login to view your profile</p>
          <a href="/login" class="inline-block px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold">
            Go to Login
          </a>
        </div>

        <div *ngIf="userService.currentUserProfile() || authService.isLoggedIn()" class="grid grid-cols-3 gap-6">
          <!-- Left Column - Profile Info -->
          <div class="col-span-2 space-y-6">
            <!-- Personal Details -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold mb-4">Personal Details</h2>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">Name</p>
                  <p class="font-semibold text-gray-900">{{ userService.currentUserProfile()?.name || authService.currentUser()?.name }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">Email</p>
                  <p class="font-semibold text-gray-900">{{ userService.currentUserProfile()?.email || authService.currentUser()?.email }}</p>
                </div>
                <div *ngIf="userService.currentUserProfile()">
                  <p class="text-sm text-gray-600">Phone</p>
                  <p class="font-semibold text-gray-900">{{ userService.currentUserProfile()?.phone }}</p>
                </div>
                <div *ngIf="userService.currentUserProfile()">
                  <p class="text-sm text-gray-600">Member Since</p>
                  <p class="font-semibold text-gray-900">{{ (userService.currentUserProfile()?.registeredDate | date: 'MMM dd, yyyy') }}</p>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div *ngIf="userService.currentUserProfile()" class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold mb-4">Shipping Address</h2>
              <div class="space-y-2">
                <p class="font-semibold">{{ userService.currentUserProfile()?.address }}</p>
                <p class="text-gray-600">{{ userService.currentUserProfile()?.city }}, {{ userService.currentUserProfile()?.postalCode }}</p>
                <p class="text-gray-600">{{ userService.currentUserProfile()?.country }}</p>
              </div>
            </div>

            <!-- Order History -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold mb-4">Order History ({{ userService.currentUserProfile()?.orders?.length || 0 }})</h2>
              <div *ngIf="!userService.currentUserProfile()?.orders || userService.currentUserProfile()?.orders?.length === 0" class="text-center py-8">
                <p class="text-gray-600">No orders yet</p>
              </div>
              <div *ngFor="let order of userService.currentUserProfile()?.orders" class="border rounded-lg p-4 mb-4">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <p class="font-semibold">Order #{{ order.id }}</p>
                    <p class="text-sm text-gray-600">{{ order.date | date: 'MMM dd, yyyy' }}</p>
                  </div>
                  <span [class.bg-green-100]="order.status === 'delivered'" [class.text-green-700]="order.status === 'delivered'" [class.bg-yellow-100]="order.status !== 'delivered'" [class.text-yellow-700]="order.status !== 'delivered'" class="px-3 py-1 rounded-full text-sm font-semibold">
                    {{ order.status | titlecase }}
                  </span>
                </div>
                <div class="mb-2">
                  <p class="text-sm text-gray-600">Items: {{ order.items.length }}</p>
                  <p class="font-semibold text-rose-500">Total: ₹{{ order.total }}</p>
                </div>
                <p class="text-sm text-gray-600">Shipping: {{ order.shippingAddress }}</p>
              </div>
            </div>
          </div>

          <!-- Right Column - Wishlist -->
          <div class="bg-white rounded-lg shadow p-6 h-fit">
            <h2 class="text-xl font-bold mb-4">Wishlist ({{ userService.getWishlistItems().length }})</h2>
            <div *ngIf="userService.getWishlistItems().length === 0" class="text-center py-8">
              <p class="text-gray-600">Your wishlist is empty</p>
            </div>
            <div *ngFor="let productId of userService.getWishlistItems()" class="border rounded-lg p-3 mb-3">
              <p class="text-sm text-gray-900">Product ID: {{ productId }}</p>
              <button
                (click)="removeFromWishlist(productId)"
                class="mt-2 w-full text-xs bg-red-100 text-red-600 py-1 rounded hover:bg-red-200">
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ProfileComponent implements OnInit {
  constructor(
    public userService: UserService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Force reload auth state from storage to handle timing issues
    const authUser = localStorage.getItem('mooncraft_user');
    const userData = localStorage.getItem('mooncraft_users');

    // If data exists in localStorage, user is authenticated
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        this.authService.currentUser.set(user);
        this.authService.isLoggedIn.set(true);
      } catch (e) {
        console.error('Failed to parse auth user:', e);
      }
    }

    if (userData) {
      try {
        const users = JSON.parse(userData);
        if (users && users.length > 0) {
          // Load user data for signals
          this.userService.users.set(users);
        }
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    // Now check if user is logged in
    if (this.userService.currentUserProfile()) {
      return; // UserService user logged in
    }

    if (this.authService.isLoggedIn()) {
      return; // AuthService user logged in
    }

    // No user found, redirect to login
    this.router.navigate(['/login']);
  }

  logout() {
    this.userService.logoutUser();
    this.authService.logout();
    this.router.navigate(['/']);
  }

  removeFromWishlist(productId: string) {
    this.userService.removeFromWishlist(productId);
  }
}
