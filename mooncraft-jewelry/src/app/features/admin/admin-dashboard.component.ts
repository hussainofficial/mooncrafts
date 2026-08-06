import { Component, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { CategoryService } from '../../core/services/category.service';
import { LoaderService } from '../../core/services/loader.service';
import { UserManagementService, User } from '../../core/services/user-management.service';
import { CategoryAdminService, CategoryAdmin } from '../../core/services/category-admin.service';
import { MaterialAdminService, MaterialAdmin } from '../../core/services/material-admin.service';
import { OrderManagementService, Order } from '../../core/services/order-management.service';
import { PaymentManagementService, Payment } from '../../core/services/payment-management.service';
import { BlobImageService } from '../../core/services/blob-image.service';
import { Product } from '../../core/models';
import { AdminReviewApprovalComponent } from './admin-review-approval.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, AdminReviewApprovalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Authorization Check -->
    <div *ngIf="!authService.isAdminUser()" class="bg-red-50 border-b-2 border-red-500 p-6">
      <div class="max-w-7xl mx-auto">
        <p class="text-red-700 font-semibold mb-3">⚠️  Not Authorized</p>
        <p class="text-red-600 mb-4">You must be logged in as an admin to access this page.</p>
        <div class="space-x-4">
          <a href="/login" class="inline-block px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
            Admin Login
          </a>
          <a href="/" class="inline-block px-6 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 font-semibold">
            Back to Home
          </a>
        </div>
      </div>
    </div>

    <!-- Header -->
    <header class="bg-white shadow-md sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-lg sm:text-2xl font-bold text-rose-500 truncate">MOONCRAFT Admin</h1>
          <p class="text-xs sm:text-sm text-gray-600 truncate">Welcome, {{ authService.currentUser()?.name || 'Guest' }}</p>
        </div>
        <button
          *ngIf="authService.isLoggedIn()"
          (click)="logout()"
          class="flex-shrink-0 px-4 sm:px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold text-sm sm:text-base">
          Logout
        </button>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8" *ngIf="authService.isAdminUser()">
      <!-- Error Message -->
      <div *ngIf="errorMessage()" class="bg-red-50 border-b-2 border-red-500 p-4 mb-6 rounded-lg">
        <p class="text-red-700 font-semibold">❌ {{ errorMessage() }}</p>
        <button (click)="clearError()" class="text-sm text-red-600 mt-2 underline">Dismiss</button>
      </div>

      <!-- Success Message -->
      <div *ngIf="successMessage()" class="bg-green-50 border-b-2 border-green-500 p-4 mb-6 rounded-lg">
        <p class="text-green-700 font-semibold">✅ {{ successMessage() }}</p>
        <button (click)="clearSuccess()" class="text-sm text-green-600 mt-2 underline">Dismiss</button>
      </div>

      <!-- Dashboard Stats -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Products -->
        <div class="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 shadow-md border border-rose-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Products</p>
              <p class="text-3xl font-bold text-rose-600 mt-2">{{ productService.products().length }}</p>
            </div>
            <div class="text-4xl text-rose-300">📦</div>
          </div>
        </div>

        <!-- Total Categories -->
        <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-md border border-blue-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Categories</p>
              <p class="text-3xl font-bold text-blue-600 mt-2">{{ categoryAdminService.getCategories().length }}</p>
            </div>
            <div class="text-4xl text-blue-300">🏷️</div>
          </div>
        </div>

        <!-- Total Users -->
        <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-md border border-green-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">Total Users</p>
              <p class="text-3xl font-bold text-green-600 mt-2">{{ userManagementService.getUsers().length }}</p>
            </div>
            <div class="text-4xl text-green-300">👥</div>
          </div>
        </div>

        <!-- In Stock -->
        <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 shadow-md border border-purple-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm font-medium">In Stock</p>
              <p class="text-3xl font-bold text-purple-600 mt-2">{{ getInStockCount() }}</p>
            </div>
            <div class="text-4xl text-purple-300">✅</div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation Container -->
      <div class="bg-white rounded-2xl shadow-md p-3 sm:p-4 mb-6 sm:mb-8">
        <div class="flex gap-2 sm:gap-4 flex-wrap">
          <button
            (click)="switchTab('products')"
            [class.bg-rose-500]="activeTab() === 'products'"
            [class.text-white]="activeTab() === 'products'"
            [class.bg-gray-200]="activeTab() !== 'products'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors hover:shadow-md">
            Products Management
          </button>
          <button
            (click)="switchTab('add')"
            [class.bg-rose-500]="activeTab() === 'add'"
            [class.text-white]="activeTab() === 'add'"
            [class.bg-gray-200]="activeTab() !== 'add'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors hover:shadow-md">
            Add New Product
          </button>
          <button
            (click)="switchTab('categories')"
            [class.bg-rose-500]="activeTab() === 'categories'"
            [class.text-white]="activeTab() === 'categories'"
            [class.bg-gray-200]="activeTab() !== 'categories'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors hover:shadow-md">
            Categories
          </button>
          <button
            (click)="switchTab('materials')"
            [class.bg-rose-500]="activeTab() === 'materials'"
            [class.text-white]="activeTab() === 'materials'"
            [class.bg-gray-200]="activeTab() !== 'materials'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors hover:shadow-md">
            Materials
          </button>
          <button
            (click)="switchTab('users')"
            [class.bg-rose-500]="activeTab() === 'users'"
            [class.text-white]="activeTab() === 'users'"
            [class.bg-gray-200]="activeTab() !== 'users'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors hover:shadow-md">
            Users
          </button>
          <button
            (click)="switchTab('analytics')"
            [class.bg-rose-500]="activeTab() === 'analytics'"
            [class.text-white]="activeTab() === 'analytics'"
            [class.bg-gray-200]="activeTab() !== 'analytics'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors hover:shadow-md">
            Analytics
          </button>
          <button
            (click)="switchTab('orders')"
            [class.bg-rose-500]="activeTab() === 'orders'"
            [class.text-white]="activeTab() === 'orders'"
            [class.bg-gray-200]="activeTab() !== 'orders'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors hover:shadow-md">
            Orders
          </button>
          <button
            (click)="switchTab('payments')"
            [class.bg-rose-500]="activeTab() === 'payments'"
            [class.text-white]="activeTab() === 'payments'"
            [class.bg-gray-200]="activeTab() !== 'payments'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors hover:shadow-md">
            Payments
          </button>
          <button
            (click)="switchTab('reviews')"
            [class.bg-rose-500]="activeTab() === 'reviews'"
            [class.text-white]="activeTab() === 'reviews'"
            [class.bg-gray-200]="activeTab() !== 'reviews'"
            class="px-3 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-base rounded-lg font-semibold transition-colors hover:shadow-md">
            Reviews
          </button>
        </div>
      </div>

      <!-- Reviews Moderation Tab -->
      <div *ngIf="activeTab() === 'reviews'">
        <app-admin-review-approval></app-admin-review-approval>
      </div>

      <!-- Products List Tab -->
      <div *ngIf="activeTab() === 'products'" class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 class="text-lg sm:text-2xl font-bold text-gray-900">Products ({{ productService.products().length }} total)</h2>
          <input
            type="text"
            [(ngModel)]="productSearchQuery"
            (ngModelChange)="performProductSearch()"
            placeholder="Search products..."
            class="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
        </div>

        <!-- Products Table -->
        <div class="overflow-x-auto bg-white rounded-lg shadow">
          <table class="w-full">
            <thead class="bg-gray-100 border-b">
              <tr>
                <th class="px-6 py-3 text-left text-sm font-semibold">Product</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">Price</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                <th class="px-6 py-3 text-left text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of getPaginatedProducts()" class="border-b hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-4">
                    <img [src]="product.image" [alt]="product.name" class="w-12 h-12 rounded object-cover">
                    <div>
                      <p class="font-semibold">{{ product.name }}</p>
                      <p class="text-sm text-gray-600">ID: {{ product.id }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm">{{ product.category }}</td>
                <td class="px-6 py-4 font-semibold">₹{{ product.price }}</td>
                <td class="px-6 py-4">
                  <span [class.text-green-600]="product.inStock" [class.text-red-600]="!product.inStock" class="font-semibold">
                    {{ product.inStock ? 'In Stock' : 'Out of Stock' }}
                  </span>
                </td>
                <td class="px-6 py-4 space-x-2">
                  <button
                    (click)="editProduct(product)"
                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                    Edit
                  </button>
                  <button
                    (click)="deleteProduct(product.id)"
                    class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-lg shadow">
          <div class="text-sm text-gray-600 text-center sm:text-left">
            Page {{ currentPage() }} of {{ getTotalPages() }} | Showing {{ getPaginatedProducts().length }} of {{ getFilteredProducts().length }} products
          </div>
          <div class="flex flex-wrap justify-center gap-2">
            <button
              (click)="prevPage()"
              [disabled]="currentPage() === 1"
              class="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400">
              ← Previous
            </button>
            <button
              *ngFor="let page of [].constructor(getTotalPages()); let i = index"
              (click)="goToPage(i + 1)"
              [class.bg-rose-500]="currentPage() === i + 1"
              [class.text-white]="currentPage() === i + 1"
              [class.bg-gray-200]="currentPage() !== i + 1"
              class="px-3 py-2 text-sm sm:text-base rounded-lg font-semibold">
              {{ i + 1 }}
            </button>
            <button
              (click)="nextPage()"
              [disabled]="currentPage() === getTotalPages()"
              class="px-3 sm:px-4 py-2 text-sm sm:text-base bg-gray-300 text-gray-900 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400">
              Next →
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="getFilteredProducts().length === 0" class="text-center py-12">
          <p class="text-gray-600 text-lg">No products found</p>
        </div>
      </div>

      <!-- Add/Edit Product Form -->
      <div *ngIf="activeTab() === 'add' || showEditForm()" class="flex justify-center py-4 sm:py-8">
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-10 w-full max-w-4xl">
          <h2 class="text-xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            {{ editingProduct() ? '✏️ Edit Product' : '➕ Add New Product' }}
          </h2>

          <form (ngSubmit)="saveProduct()" class="space-y-6">
            <!-- Product Name -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Product Name *</label>
              <input
                type="text"
                [(ngModel)]="productForm.name"
                name="name"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
              <textarea
                [(ngModel)]="productForm.description"
                name="description"
                required
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"></textarea>
            </div>

            <!-- Price and Original Price -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Price *</label>
                <input
                  type="number"
                  [(ngModel)]="productForm.price"
                  name="price"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Original Price</label>
                <input
                  type="number"
                  [(ngModel)]="productForm.originalPrice"
                  name="originalPrice"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              </div>
            </div>

            <!-- Category and Material -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Category *</label>
                <select
                  [(ngModel)]="productForm.category"
                  name="category"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                  <option value="">Select a category</option>
                  <option *ngFor="let cat of categoryAdminService.getCategories()" [value]="toString(cat.id)">
                    {{ cat.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Material *</label>
                <select
                  [(ngModel)]="productForm.material"
                  name="material"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                  <option value="">Select a material</option>
                  <option *ngFor="let mat of categoryService.getMaterials()" [value]="toString(mat.id)">
                    {{ mat.name }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Rating and Reviews -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  [(ngModel)]="productForm.rating"
                  name="rating"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Reviews</label>
                <input
                  type="number"
                  [(ngModel)]="productForm.reviews"
                  name="reviews"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              </div>
            </div>

            <!-- Discount and Stock -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Discount (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  [(ngModel)]="productForm.discount"
                  name="discount"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  [(ngModel)]="productForm.stock"
                  name="stock"
                  placeholder="Enter quantity in stock"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
              </div>
            </div>

            <!-- Image Upload - Primary Image -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Product Image (Primary) *</label>
              <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-rose-500 transition-colors"
                (click)="fileInput.click()">
                <input
                  #fileInput
                  type="file"
                  accept="image/*"
                  (change)="onImageSelected($event)"
                  class="hidden">
                <div *ngIf="!productForm.image" class="space-y-2">
                  <p class="text-gray-600">Click to upload or drag and drop</p>
                  <p class="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
                <img *ngIf="productForm.image" [src]="productForm.image" alt="Preview" class="max-h-40 mx-auto rounded">
              </div>
            </div>

            <!-- Image Upload - Gallery Images -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">
                Gallery Images (Optional)
                <span class="text-gray-500 text-xs ml-2">{{ galleryImages.length }}/10</span>
              </label>

              <!-- Upload Area -->
              <div class="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-500 transition-colors bg-blue-50"
                (click)="galleryFileInput.click()"
                (dragover)="$event.preventDefault(); $event.stopPropagation()"
                (dragleave)="$event.preventDefault(); $event.stopPropagation()"
                (drop)="onGalleryImagesDropped($event)">
                <input
                  #galleryFileInput
                  type="file"
                  multiple
                  accept="image/*"
                  (change)="onGalleryImagesSelected($event)"
                  class="hidden">
                <div class="space-y-2">
                  <p class="text-blue-600 font-semibold">📸 Click or drag to add gallery images</p>
                  <p class="text-sm text-gray-600">Max 10 images per product (PNG, JPG, GIF)</p>
                  <p class="text-xs text-gray-500 mt-2">{{ galleryImages.length }} image(s) added</p>
                </div>
              </div>

              <!-- Gallery Preview with Reordering -->
              <div *ngIf="galleryImages.length > 0" class="mt-6">
                <div class="flex justify-between items-center mb-4">
                  <p class="text-sm font-semibold text-gray-900">Gallery Preview (drag to reorder):</p>
                  <button
                    type="button"
                    (click)="clearGalleryImages()"
                    class="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200">
                    Clear All
                  </button>
                </div>

                <!-- Images Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  <div *ngFor="let img of galleryImages; let i = index"
                    class="relative group cursor-move border-2 border-blue-300 rounded overflow-hidden hover:border-blue-500 transition"
                    draggable="true"
                    (dragstart)="onDragStart($event, i)"
                    (dragover)="onDragOver($event)"
                    (drop)="onDrop($event, i)"
                    (dragend)="onDragEnd($event)">

                    <!-- Image -->
                    <img [src]="img.url" [alt]="'Gallery ' + (i+1)" class="w-full h-24 object-cover">

                    <!-- Order Number Badge -->
                    <span class="absolute top-1 left-1 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                      {{ i + 1 }}
                    </span>

                    <!-- Delete Button (always visible on touch devices, hover-reveal on desktop) -->
                    <div class="absolute inset-0 bg-black/30 lg:bg-black/0 lg:group-hover:bg-black/50 rounded flex items-center justify-center transition">
                      <button
                        type="button"
                        (click)="removeGalleryImage(i)"
                        class="block lg:hidden lg:group-hover:block bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Alt Text Edit Section (Optional) -->
                <div *ngIf="galleryImages.length > 0" class="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p class="text-sm font-semibold text-gray-900 mb-3">Edit image details (optional):</p>
                  <div class="space-y-2 max-h-40 overflow-y-auto">
                    <div *ngFor="let img of galleryImages; let i = index" class="flex gap-2 items-start">
                      <img [src]="img.url" [alt]="'Gallery ' + (i+1)" class="w-12 h-12 object-cover rounded">
                      <div class="flex-1">
                        <label class="block text-xs text-gray-600 mb-1">Image {{ i + 1 }} - Alt text (for SEO)</label>
                        <input
                          type="text"
                          [(ngModel)]="img.alt_text"
                          [name]="'alt_' + i"
                          placeholder="e.g., Ring front view"
                          class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500">
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Collection (Optional) -->
            <div>
              <label class="block text-sm font-semibold text-gray-900 mb-2">Collection (Optional)</label>
              <input
                type="text"
                [(ngModel)]="productForm.collection"
                name="collection"
                placeholder="e.g., Bridal Collection"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
            </div>

            <!-- Product Display Flags -->
            <div class="bg-rose-50 rounded-lg p-6 border border-rose-200">
              <label class="block text-sm font-semibold text-gray-900 mb-4">📌 Display Settings - Where should this product appear?</label>
              <div class="space-y-3">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="productForm.isTrending"
                    name="isTrending"
                    class="w-5 h-5 text-rose-500 rounded focus:ring-2 focus:ring-rose-500">
                  <span class="text-sm font-medium text-gray-900">⭐ Trending Now</span>
                  <span class="text-xs text-gray-500">(Show in Trending section)</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="productForm.isNewArrival"
                    name="isNewArrival"
                    class="w-5 h-5 text-rose-500 rounded focus:ring-2 focus:ring-rose-500">
                  <span class="text-sm font-medium text-gray-900">🆕 New Arrival</span>
                  <span class="text-xs text-gray-500">(Show in New Arrivals section)</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="productForm.isBestSeller"
                    name="isBestSeller"
                    class="w-5 h-5 text-rose-500 rounded focus:ring-2 focus:ring-rose-500">
                  <span class="text-sm font-medium text-gray-900">🏆 Best Seller</span>
                  <span class="text-xs text-gray-500">(Show in Best Sellers section)</span>
                </label>
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="productForm.isFeatured"
                    name="isFeatured"
                    class="w-5 h-5 text-rose-500 rounded focus:ring-2 focus:ring-rose-500">
                  <span class="text-sm font-medium text-gray-900">✨ Coming Soon</span>
                  <span class="text-xs text-gray-500">(Show in Coming Soon Products section)</span>
                </label>
              </div>
            </div>

            <!-- Instagram Auto-Publish Settings -->
            <div class="border border-purple-200 rounded-lg overflow-hidden">
              <button
                type="button"
                (click)="instagramPanelOpen.set(!instagramPanelOpen())"
                class="w-full flex items-center justify-between px-6 py-4 bg-purple-50 hover:bg-purple-100 transition-colors">
                <span class="text-sm font-semibold text-gray-900">📸 Instagram Settings</span>
                <span class="text-gray-500">{{ instagramPanelOpen() ? '▲' : '▼' }}</span>
              </button>

              <div *ngIf="instagramPanelOpen()" class="p-6 space-y-4 bg-white border-t border-purple-100">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="productForm.shareToInstagram"
                    name="shareToInstagram"
                    (change)="onShareToInstagramChange()"
                    class="w-5 h-5 text-purple-500 rounded focus:ring-2 focus:ring-purple-500">
                  <span class="text-sm font-medium text-gray-900">Share this product to Instagram</span>
                </label>

                <div *ngIf="productForm.isInstagramPublished" class="text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
                  ✅ Already published to Instagram (Post ID: {{ productForm.instagramPostId }})
                </div>

                <div *ngIf="productForm.shareToInstagram" class="space-y-4 pl-1">
                  <!-- Image Source -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-900 mb-2">Instagram Image</label>
                    <div class="space-y-2">
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="instagramImageOption"
                          value="primary"
                          [(ngModel)]="productForm.instagramImageOption"
                          (change)="onInstagramImageOptionChange()"
                          class="w-4 h-4 text-purple-500">
                        <span class="text-sm text-gray-800">Use Primary Product Photo</span>
                      </label>
                      <label class="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="instagramImageOption"
                          value="custom"
                          [(ngModel)]="productForm.instagramImageOption"
                          (change)="onInstagramImageOptionChange()"
                          class="w-4 h-4 text-purple-500">
                        <span class="text-sm text-gray-800">Upload Custom Instagram Graphic</span>
                      </label>
                    </div>

                    <div
                      *ngIf="productForm.instagramImageOption === 'custom'"
                      class="mt-3 border-2 border-dashed border-purple-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 transition-colors"
                      (click)="instagramFileInput.click()">
                      <input
                        #instagramFileInput
                        type="file"
                        accept="image/*"
                        (change)="onInstagramImageSelected($event)"
                        class="hidden">
                      <p *ngIf="!productForm.instagramCustomImage" class="text-sm text-gray-600">Click to upload custom Instagram graphic</p>
                      <img *ngIf="productForm.instagramCustomImage" [src]="productForm.instagramCustomImage" alt="Instagram graphic preview" class="max-h-40 mx-auto rounded">
                    </div>

                    <p *ngIf="instagramImageWarning()" class="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
                      ⚠️ {{ instagramImageWarning() }}
                    </p>
                  </div>

                  <!-- Caption -->
                  <div>
                    <div class="flex items-center justify-between mb-2">
                      <label class="block text-sm font-semibold text-gray-900">Caption</label>
                      <button
                        type="button"
                        (click)="generateInstagramCaption()"
                        class="text-xs text-purple-600 hover:underline font-semibold">
                        Regenerate
                      </button>
                    </div>
                    <textarea
                      [(ngModel)]="productForm.instagramCaption"
                      name="instagramCaption"
                      rows="6"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"></textarea>
                    <p
                      class="mt-1 text-xs"
                      [class.text-red-600]="productForm.instagramCaption.length > 2200"
                      [class.text-gray-500]="productForm.instagramCaption.length <= 2200">
                      {{ productForm.instagramCaption.length }} / 2200 characters
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4 pt-8">
              <button
                type="submit"
                class="flex-1 bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition-colors">
                {{ editingProduct() ? 'Update Product' : 'Add Product' }}
              </button>
              <button
                type="button"
                (click)="resetProductForm()"
                class="flex-1 bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Categories Tab -->
      <div *ngIf="activeTab() === 'categories'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">🏷️ Categories Management</h2>
            <button
              (click)="openAddCategoryForm()"
              class="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
              + Add Category
            </button>
          </div>

          <!-- Search -->
          <div class="mb-6">
            <input
              type="text"
              [(ngModel)]="categorySearchQuery"
              (ngModelChange)="performCategorySearch()"
              placeholder="Search categories by name or type..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
          </div>

          <!-- Add/Edit Category Form -->
          <div *ngIf="showCategoryForm()" class="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ editingCategory() ? '✏️ Edit Category' : '➕ Add New Category' }}
            </h3>
            <form (ngSubmit)="saveCategory()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Category Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="categoryForm.name"
                    name="catName"
                    placeholder="e.g., Rings"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Slug *</label>
                  <input
                    type="text"
                    [(ngModel)]="categoryForm.slug"
                    name="catSlug"
                    placeholder="e.g., rings"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Type *</label>
                  <select
                    [(ngModel)]="categoryForm.type"
                    name="catType"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                    <option value="">Select Type</option>
                    <option value="material">Material</option>
                    <option value="type">Type</option>
                    <option value="collection">Collection</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Status *</label>
                  <select
                    [(ngModel)]="categoryForm.status"
                    name="catStatus"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  [(ngModel)]="categoryForm.description"
                  name="catDescription"
                  placeholder="Category description..."
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"></textarea>
              </div>
              <div class="flex gap-4">
                <button
                  type="submit"
                  class="flex-1 bg-rose-500 text-white py-2 rounded-lg font-semibold hover:bg-rose-600 transition-colors">
                  {{ editingCategory() ? 'Update' : 'Add' }} Category
                </button>
                <button
                  type="button"
                  (click)="cancelCategoryForm()"
                  class="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Categories Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let category of getFilteredCategories()" class="border-b hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-gray-600">{{ category.id }}</td>
                  <td class="px-6 py-4 font-semibold text-gray-900">{{ category.name }}</td>
                  <td class="px-6 py-4">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {{ category.type }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ category.description || '-' }}</td>
                  <td class="px-6 py-4">
                    <span [class.text-green-600]="category.status === 'active'"
                          [class.text-red-600]="category.status === 'inactive'"
                          class="font-semibold">
                      {{ category.status === 'active' ? '✅ Active' : '❌ Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 space-x-2">
                    <button
                      (click)="editCategory(category)"
                      class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors">
                      Edit
                    </button>
                    <button
                      (click)="deleteCategory(category.id)"
                      class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="getFilteredCategories().length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg">No categories found</p>
          </div>
        </div>
      </div>

      <!-- Materials Tab -->
      <div *ngIf="activeTab() === 'materials'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">💎 Materials Management</h2>
            <button
              (click)="openAddMaterialForm()"
              class="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
              + Add Material
            </button>
          </div>

          <!-- Search -->
          <div class="mb-6">
            <input
              type="text"
              [(ngModel)]="materialSearchQuery"
              (ngModelChange)="performMaterialSearch()"
              placeholder="Search materials by name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
          </div>

          <!-- Add/Edit Material Form -->
          <div *ngIf="showMaterialForm()" class="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ editingMaterial() ? '✏️ Edit Material' : '➕ Add New Material' }}
            </h3>
            <form (ngSubmit)="saveMaterial()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Material Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="materialForm.name"
                    name="matName"
                    placeholder="e.g., Gold"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Slug *</label>
                  <input
                    type="text"
                    [(ngModel)]="materialForm.slug"
                    name="matSlug"
                    placeholder="e.g., gold"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Status *</label>
                <select
                  [(ngModel)]="materialForm.status"
                  name="matStatus"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  [(ngModel)]="materialForm.description"
                  name="matDescription"
                  placeholder="Material description..."
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"></textarea>
              </div>
              <div class="flex gap-4">
                <button
                  type="submit"
                  class="flex-1 bg-rose-500 text-white py-2 rounded-lg font-semibold hover:bg-rose-600 transition-colors">
                  {{ editingMaterial() ? 'Update' : 'Add' }} Material
                </button>
                <button
                  type="button"
                  (click)="cancelMaterialForm()"
                  class="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Materials Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Slug</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let material of getFilteredMaterials()" class="border-b hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-gray-600">{{ material.id }}</td>
                  <td class="px-6 py-4 font-semibold text-gray-900">{{ material.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ material.slug }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ material.description || '-' }}</td>
                  <td class="px-6 py-4">
                    <span [class.text-green-600]="material.status === 'active'"
                          [class.text-red-600]="material.status === 'inactive'"
                          class="font-semibold">
                      {{ material.status === 'active' ? '✅ Active' : '❌ Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 space-x-2">
                    <button
                      (click)="editMaterial(material)"
                      class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors">
                      Edit
                    </button>
                    <button
                      (click)="deleteMaterial(material.id)"
                      class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="getFilteredMaterials().length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg">No materials found</p>
          </div>
        </div>
      </div>

      <!-- Users Tab -->
      <div *ngIf="activeTab() === 'users'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">👥 Users Management</h2>
          </div>

          <!-- Search -->
          <div class="mb-6">
            <input
              type="text"
              [(ngModel)]="userSearchQuery"
              (ngModelChange)="performUserSearch()"
              placeholder="Search users by email or name..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
          </div>

          <!-- Add/Edit User Form -->
          <div *ngIf="showUserForm()" class="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ editingUser() ? '✏️ Edit User' : 'ℹ️ User Information' }}
            </h3>
            <form (ngSubmit)="saveUser()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Full Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="userForm.name"
                    name="userName"
                    placeholder="e.g., John Doe"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Email *</label>
                  <input
                    type="email"
                    [(ngModel)]="userForm.email"
                    name="userEmail"
                    placeholder="e.g., john@example.com"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Phone</label>
                  <input
                    type="tel"
                    [(ngModel)]="userForm.phone"
                    name="userPhone"
                    placeholder="e.g., +1-234-567-8900"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Role *</label>
                  <select
                    [(ngModel)]="userForm.role"
                    name="userRole"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                    <option value="">Select Role</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Status *</label>
                <select
                  [(ngModel)]="userForm.status"
                  name="userStatus"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                  <option value="">Select Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div class="flex gap-4">
                <button
                  type="submit"
                  class="flex-1 bg-rose-500 text-white py-2 rounded-lg font-semibold hover:bg-rose-600 transition-colors">
                  {{ editingUser() ? 'Update' : 'Save' }} User
                </button>
                <button
                  type="button"
                  (click)="cancelUserForm()"
                  class="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Users Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of getFilteredUsers()" class="border-b hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm text-gray-600">{{ user.id }}</td>
                  <td class="px-6 py-4 font-semibold text-gray-900">{{ user.name }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ user.email }}</td>
                  <td class="px-6 py-4 text-gray-600">{{ user.phone || '-' }}</td>
                  <td class="px-6 py-4">
                    <span [class.bg-purple-100]="user.role === 'admin'"
                          [class.text-purple-800]="user.role === 'admin'"
                          [class.bg-gray-100]="user.role === 'user'"
                          [class.text-gray-800]="user.role === 'user'"
                          class="px-3 py-1 rounded-full text-xs font-semibold inline-block">
                      {{ user.role === 'admin' ? '👑 Admin' : '👤 User' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class.text-green-600]="user.status === 'active'"
                          [class.text-orange-600]="user.status === 'inactive'"
                          [class.text-red-600]="user.status === 'banned'"
                          class="font-semibold">
                      <span *ngIf="user.status === 'active'">✅ Active</span>
                      <span *ngIf="user.status === 'inactive'">⏸️ Inactive</span>
                      <span *ngIf="user.status === 'banned'">🚫 Banned</span>
                    </span>
                  </td>
                  <td class="px-6 py-4 space-x-2">
                    <button
                      (click)="editUser(user)"
                      class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm transition-colors">
                      Edit
                    </button>
                    <button
                      (click)="deleteUser(user.id)"
                      class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm transition-colors">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="getFilteredUsers().length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg">No users found</p>
          </div>
        </div>
      </div>

      <!-- Analytics Tab -->
      <div *ngIf="activeTab() === 'analytics'" class="space-y-8">
        <h2 class="text-3xl font-bold text-gray-900">📊 Analytics & Reports</h2>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Total Orders -->
          <div class="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-md border border-blue-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Total Orders</p>
                <p class="text-3xl font-bold text-blue-600 mt-2">{{ getOrderStats().total }}</p>
              </div>
              <div class="text-4xl">📦</div>
            </div>
          </div>

          <!-- Pending Orders -->
          <div class="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-md border border-yellow-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Pending Orders</p>
                <p class="text-3xl font-bold text-yellow-600 mt-2">{{ getOrderStats().pending }}</p>
              </div>
              <div class="text-4xl">⏳</div>
            </div>
          </div>

          <!-- Delivered Orders -->
          <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-md border border-green-200">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Delivered Orders</p>
                <p class="text-3xl font-bold text-green-600 mt-2">{{ getOrderStats().delivered }}</p>
              </div>
              <div class="text-4xl">✅</div>
            </div>
          </div>

          <!-- Total Revenue -->
          <div class="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 shadow-md border border-purple-200 lg:col-span-3">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p class="text-4xl font-bold text-purple-600 mt-2">₹{{ getOrderStats().totalRevenue.toLocaleString() }}</p>
              </div>
              <div class="text-5xl">💰</div>
            </div>
          </div>
        </div>

        <!-- Order Status Breakdown -->
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Order Status Breakdown</h3>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div class="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p class="text-2xl font-bold text-yellow-600">{{ getOrderStats().pending }}</p>
              <p class="text-sm text-gray-600 mt-2">Pending</p>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-2xl font-bold text-blue-600">{{ getOrderStats().confirmed }}</p>
              <p class="text-sm text-gray-600 mt-2">Confirmed</p>
            </div>
            <div class="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p class="text-2xl font-bold text-purple-600">{{ getOrderStats().shipped }}</p>
              <p class="text-sm text-gray-600 mt-2">Shipped</p>
            </div>
            <div class="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p class="text-2xl font-bold text-green-600">{{ getOrderStats().delivered }}</p>
              <p class="text-sm text-gray-600 mt-2">Delivered</p>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <p class="text-2xl font-bold text-red-600">{{ getOrderStats().cancelled }}</p>
              <p class="text-sm text-gray-600 mt-2">Cancelled</p>
            </div>
          </div>
        </div>

        <!-- Payment Stats -->
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <h3 class="text-xl font-bold text-gray-900 mb-6">Payment Statistics</h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p class="text-2xl font-bold text-blue-600">{{ getPaymentStats().total }}</p>
              <p class="text-sm text-gray-600 mt-2">Total Payments</p>
            </div>
            <div class="p-4 bg-green-50 rounded-lg border border-green-200">
              <p class="text-2xl font-bold text-green-600">{{ getPaymentStats().completed }}</p>
              <p class="text-sm text-gray-600 mt-2">Completed</p>
            </div>
            <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p class="text-2xl font-bold text-yellow-600">{{ getPaymentStats().pending }}</p>
              <p class="text-sm text-gray-600 mt-2">Pending</p>
            </div>
            <div class="p-4 bg-red-50 rounded-lg border border-red-200">
              <p class="text-2xl font-bold text-red-600">{{ getPaymentStats().failed }}</p>
              <p class="text-sm text-gray-600 mt-2">Failed</p>
            </div>
          </div>
        </div>

        <!-- Orders Analytics Table -->
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <h3 class="text-xl font-bold text-gray-900 mb-6">📈 Orders Analytics</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order Status</th>
                  <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Count</th>
                  <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Percentage</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Progress</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-6 py-4 font-semibold">
                    <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">Pending</span>
                  </td>
                  <td class="px-6 py-4 text-right font-semibold">{{ getOrderStats().pending }}</td>
                  <td class="px-6 py-4 text-right">{{ getOrderPercentage('pending') }}%</td>
                  <td class="px-6 py-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-yellow-500 h-2 rounded-full" [style.width.%]="getOrderPercentage('pending')"></div>
                    </div>
                  </td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-6 py-4 font-semibold">
                    <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">Confirmed</span>
                  </td>
                  <td class="px-6 py-4 text-right font-semibold">{{ getOrderStats().confirmed }}</td>
                  <td class="px-6 py-4 text-right">{{ getOrderPercentage('confirmed') }}%</td>
                  <td class="px-6 py-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-blue-500 h-2 rounded-full" [style.width.%]="getOrderPercentage('confirmed')"></div>
                    </div>
                  </td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-6 py-4 font-semibold">
                    <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">Shipped</span>
                  </td>
                  <td class="px-6 py-4 text-right font-semibold">{{ getOrderStats().shipped }}</td>
                  <td class="px-6 py-4 text-right">{{ getOrderPercentage('shipped') }}%</td>
                  <td class="px-6 py-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-purple-500 h-2 rounded-full" [style.width.%]="getOrderPercentage('shipped')"></div>
                    </div>
                  </td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-6 py-4 font-semibold">
                    <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Delivered</span>
                  </td>
                  <td class="px-6 py-4 text-right font-semibold">{{ getOrderStats().delivered }}</td>
                  <td class="px-6 py-4 text-right">{{ getOrderPercentage('delivered') }}%</td>
                  <td class="px-6 py-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-green-500 h-2 rounded-full" [style.width.%]="getOrderPercentage('delivered')"></div>
                    </div>
                  </td>
                </tr>
                <tr class="border-b hover:bg-gray-50">
                  <td class="px-6 py-4 font-semibold">
                    <span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">Cancelled</span>
                  </td>
                  <td class="px-6 py-4 text-right font-semibold">{{ getOrderStats().cancelled }}</td>
                  <td class="px-6 py-4 text-right">{{ getOrderPercentage('cancelled') }}%</td>
                  <td class="px-6 py-4">
                    <div class="w-full bg-gray-200 rounded-full h-2">
                      <div class="bg-red-500 h-2 rounded-full" [style.width.%]="getOrderPercentage('cancelled')"></div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Top Products Table -->
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <h3 class="text-xl font-bold text-gray-900 mb-6">⭐ Top Products by Price</h3>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Product</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900">Price</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Material</th>
                  <th class="px-6 py-3 text-center text-sm font-semibold text-gray-900">Rating</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of getTopProducts()" class="border-b hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img [src]="product.image" [alt]="product.name" class="w-10 h-10 rounded object-cover">
                      <span class="font-semibold">{{ product.name }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ product.category }}</td>
                  <td class="px-6 py-4 text-right font-semibold text-rose-600">₹{{ product.price }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ product.material }}</td>
                  <td class="px-6 py-4 text-center">
                    <span class="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                      {{ product.rating }}⭐
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span [class.text-green-600]="product.inStock" [class.text-red-600]="!product.inStock" class="font-semibold">
                      {{ product.inStock ? '✅ In Stock' : '❌ Out' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="getTopProducts().length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg">No products available</p>
          </div>
        </div>
      </div>

      <!-- Orders Tab -->
      <div *ngIf="activeTab() === 'orders'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">📦 Orders Management</h2>
            <button
              (click)="loadOrders()"
              class="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
              🔄 Refresh
            </button>
          </div>

          <!-- Orders Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Customer</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of orderManagementService.getOrders()" class="border-b hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ order.id }}</td>
                  <td class="px-6 py-4 font-semibold text-gray-900">{{ order.customer_name || 'N/A' }}</td>
                  <td class="px-6 py-4 font-semibold">₹{{ order.total_amount }}</td>
                  <td class="px-6 py-4">
                    <span [class.bg-yellow-100]="order.status === 'pending'"
                          [class.text-yellow-800]="order.status === 'pending'"
                          [class.bg-blue-100]="order.status === 'confirmed'"
                          [class.text-blue-800]="order.status === 'confirmed'"
                          [class.bg-purple-100]="order.status === 'shipped'"
                          [class.text-purple-800]="order.status === 'shipped'"
                          [class.bg-green-100]="order.status === 'delivered'"
                          [class.text-green-800]="order.status === 'delivered'"
                          [class.bg-red-100]="order.status === 'cancelled'"
                          [class.text-red-800]="order.status === 'cancelled'"
                          class="px-3 py-1 rounded-full text-xs font-semibold inline-block">
                      {{ order.status | uppercase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(order.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="orderManagementService.getOrders().length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg">No orders found</p>
          </div>
        </div>
      </div>

      <!-- Payments Tab -->
      <div *ngIf="activeTab() === 'payments'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-4 sm:p-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h2 class="text-xl sm:text-2xl font-bold text-gray-900">💳 Payments Management</h2>
            <button
              (click)="loadPayments()"
              class="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
              🔄 Refresh
            </button>
          </div>

          <!-- Payments Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Order ID</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Method</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let payment of paymentManagementService.getPayments()" class="border-b hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">
                    <span *ngIf="payment.transaction_id">{{ payment.transaction_id }}</span>
                    <span *ngIf="!payment.transaction_id && payment.gateway_order_id" title="Razorpay order ID (no payment ID — payment was not completed)">
                      {{ payment.gateway_order_id }}
                    </span>
                    <span *ngIf="!payment.transaction_id && !payment.gateway_order_id" class="text-gray-400">—</span>
                  </td>
                  <td class="px-6 py-4 text-sm font-mono text-gray-600">{{ payment.order_id }}</td>
                  <td class="px-6 py-4 font-semibold">₹{{ payment.amount }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600 capitalize">{{ payment.payment_method.replace('_', ' ') || 'N/A' }}</td>
                  <td class="px-6 py-4">
                    <span [class.bg-green-100]="payment.status === 'completed'"
                          [class.text-green-800]="payment.status === 'completed'"
                          [class.bg-yellow-100]="payment.status === 'pending'"
                          [class.text-yellow-800]="payment.status === 'pending'"
                          [class.bg-red-100]="payment.status === 'failed'"
                          [class.text-red-800]="payment.status === 'failed'"
                          [class.bg-orange-100]="payment.status === 'refunded'"
                          [class.text-orange-800]="payment.status === 'refunded'"
                          class="px-3 py-1 rounded-full text-xs font-semibold inline-block">
                      {{ payment.status | uppercase }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(payment.created_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div *ngIf="paymentManagementService.getPayments().length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg">No payments found</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  activeTab = signal<'products' | 'add' | 'categories' | 'materials' | 'users' | 'analytics' | 'orders' | 'payments' | 'reviews'>('products');

  // Message signals
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Product Management Signals
  productSearchQuery = '';
  editingProduct = signal<Product | null>(null);
  showEditForm = signal(false);
  currentPage = signal(1);
  itemsPerPage = signal(5);
  refreshTrigger = signal(0);

  // Gallery Images
  galleryImages: any[] = [];
  draggedIndex: number | null = null;

  productForm = {
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined,
    image: '',
    rating: 4.5,
    reviews: 0,
    category: '',
    material: '',
    collection: '',
    stock: 50,
    inStock: true,
    discount: 0,
    isTrending: false,
    isNewArrival: false,
    isBestSeller: false,
    isFeatured: false,
    // Instagram Settings
    shareToInstagram: false,
    instagramImageOption: 'primary' as 'primary' | 'custom',
    instagramCustomImage: '',
    instagramCaption: '',
    isInstagramPublished: false,
    instagramPostId: null as string | null,
  };

  // Instagram Settings Signals
  instagramPanelOpen = signal(false);
  instagramImageWarning = signal<string | null>(null);

  // Category Management Signals
  showCategoryForm = signal(false);
  editingCategory = signal<CategoryAdmin | null>(null);
  categorySearchQuery = '';
  categoryForm = {
    name: '',
    slug: '',
    type: '' as 'material' | 'type' | 'collection' | '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  };

  // Material Management Signals
  showMaterialForm = signal(false);
  editingMaterial = signal<MaterialAdmin | null>(null);
  materialSearchQuery = '';
  materialForm = {
    name: '',
    slug: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  };

  // User Management Signals
  showUserForm = signal(false);
  editingUser = signal<User | null>(null);
  userSearchQuery = '';
  userForm = {
    name: '',
    email: '',
    phone: '',
    role: 'user' as 'user' | 'admin' | '',
    status: 'active' as 'active' | 'inactive' | 'banned' | '',
  };

  // Top Products Signal
  topProducts = signal<any[]>([]);

  // Computed signals for products
  serviceProducts = computed(() => {
    this.refreshTrigger();
    return this.productService.products();
  });

  filteredProducts = computed(() => {
    const query = this.productSearchQuery.toLowerCase();
    const products = this.serviceProducts();

    if (!query) {
      return products;
    }

    return products.filter((p: any) =>
      p.name.toLowerCase().includes(query) ||
      p.category.toLowerCase().includes(query) ||
      p.material.toLowerCase().includes(query)
    );
  });

  paginatedProducts = computed(() => {
    const products = this.filteredProducts();
    const page = this.currentPage();
    const perPage = this.itemsPerPage();
    const start = (page - 1) * perPage;
    return products.slice(start, start + perPage);
  });

  totalPages = computed(() => {
    const total = this.filteredProducts().length;
    const perPage = this.itemsPerPage();
    return Math.ceil(total / perPage);
  });

  constructor(
    public authService: AuthService,
    public productService: ProductService,
    public categoryService: CategoryService,
    public loaderService: LoaderService,
    public categoryAdminService: CategoryAdminService,
    public materialAdminService: MaterialAdminService,
    public userManagementService: UserManagementService,
    public orderManagementService: OrderManagementService,
    public paymentManagementService: PaymentManagementService,
    private blobImageService: BlobImageService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    console.log('═══ AdminDashboard INIT ═══');

    if (!this.authService.isAdminUser()) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProducts();
    this.loadCategories();
    this.loadMaterials();
    this.loadUsers();
    this.loadOrders();
    this.loadPayments();
    this.loadTopProducts();
  }

  // ===== MESSAGE HANDLING =====
  showError(message: string) {
    this.errorMessage.set(message);
    setTimeout(() => this.clearError(), 5000);
  }

  showSuccess(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.clearSuccess(), 5000);
  }

  clearError() {
    this.errorMessage.set(null);
  }

  clearSuccess() {
    this.successMessage.set(null);
  }

  // ===== PRODUCT MANAGEMENT =====
  async loadProducts() {
    console.log('LoadProducts called');
    try {
      await this.productService.fetchAllProducts();
      console.log('✅ Products loaded successfully');
      this.refreshTrigger.update(v => v + 1);
      this.cdr.markForCheck();
    } catch (error) {
      console.error('❌ Error loading products:', error);
    }
  }

  getFilteredProducts(): any[] {
    return this.filteredProducts();
  }

  getPaginatedProducts(): any[] {
    return this.paginatedProducts();
  }

  getTotalPages(): number {
    return this.totalPages();
  }

  performProductSearch() {
    this.currentPage.set(1);
  }

  switchTab(tab: 'products' | 'add' | 'categories' | 'materials' | 'users' | 'analytics' | 'orders' | 'payments' | 'reviews') {
    this.activeTab.set(tab);
    this.resetProductForm();
  }

  async editProduct(product: Product) {
    this.loaderService.show('Loading product details...', true);

    try {
      // CRITICAL: Ensure materials & categories are loaded first
      if (this.categoryService.getMaterials().length === 0) {
        console.log('⏳ Materials not loaded, waiting...');
        await new Promise(resolve => setTimeout(resolve, 300)); // Wait for materials to load
      }

      this.editingProduct.set(product);
      Object.assign(this.productForm, product);

      // Set category ID (ensure it's an integer, not string)
      const categoryId = (product as any).categoryId || (product as any).category_id;
      (this.productForm as any).category = categoryId || null;

      // Set material ID (ensure it's an integer, not string)
      const materialId = (product as any).materialId || (product as any).material_id;
      (this.productForm as any).material = materialId || null;

      console.log('🎯 Material Debug:', {
        productMaterialId: materialId,
        formMaterialValue: (this.productForm as any).material,
        availableMaterials: this.categoryService.getMaterials().map((m: any) => ({ id: m.id, name: m.name }))
      });

      // Load existing gallery images from API
      console.log('📸 Loading gallery images for product:', product.id);
      const galleryResponse = await fetch(`${environment.apiUrl}/products/${product.id}/gallery`);

      if (galleryResponse.ok) {
        const data = await galleryResponse.json();
        console.log('📊 Gallery API Response:', data);

        if (data.images && Array.isArray(data.images)) {
          // Mark images as "existing" so they won't be re-uploaded
          this.galleryImages = data.images.map((img: any, index: number) => ({
            url: img.image_url,
            alt_text: img.alt_text || `Product image ${index + 1}`,
            display_order: img.display_order || (index + 1),
            isExisting: true  // Mark as existing, not new
          }));
          console.log('✅ Loaded', this.galleryImages.length, 'existing gallery images');
        } else {
          console.log('⚠️  No images in response');
          this.galleryImages = [];
        }
      } else {
        console.log('⚠️  Gallery API returned:', galleryResponse.status);
        this.galleryImages = [];
      }
    } catch (error) {
      console.error('❌ Error loading gallery images:', error);
      this.galleryImages = [];
    } finally {
      this.loaderService.hide();
      this.showEditForm.set(true);
      this.activeTab.set('add');
      this.cdr.markForCheck();
    }
  }

  async deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        this.loaderService.show('Deleting product...', true);
        const result = await this.productService.deleteProduct(id);
        if (result.success) {
          this.showSuccess('✅ Product deleted successfully');
          this.loaderService.complete();
          await this.loadProducts();
          this.cdr.markForCheck();
        } else {
          this.loaderService.hide();
          this.showError(`❌ Failed to delete product: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        this.loaderService.hide();
        this.showError('Error deleting product');
      }
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.loaderService.show('Uploading image...', true);
      const reader = new FileReader();
      reader.onload = (e) => {
        this.productForm.image = e.target?.result as string;
        this.loaderService.complete();
        this.cdr.markForCheck();
      };
      reader.onerror = () => {
        this.showError('Failed to read image file');
        this.loaderService.hide();
      };
      reader.readAsDataURL(file);
    }
  }


  // ===== INSTAGRAM SETTINGS =====

  onShareToInstagramChange() {
    if (this.productForm.shareToInstagram && !this.productForm.instagramCaption) {
      this.generateInstagramCaption();
    }
  }

  onInstagramImageOptionChange() {
    this.instagramImageWarning.set(null);
    if (this.productForm.instagramImageOption === 'primary' && this.productForm.image) {
      this.checkInstagramImageAspectRatio(this.productForm.image);
    } else if (this.productForm.instagramImageOption === 'custom' && this.productForm.instagramCustomImage) {
      this.checkInstagramImageAspectRatio(this.productForm.instagramCustomImage);
    }
  }

  onInstagramImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.productForm.instagramCustomImage = e.target?.result as string;
      this.checkInstagramImageAspectRatio(this.productForm.instagramCustomImage);
      this.cdr.markForCheck();
    };
    reader.onerror = () => {
      this.showError('Failed to read Instagram graphic file');
    };
    reader.readAsDataURL(file);
  }

  private checkInstagramImageAspectRatio(dataUrl: string) {
    const img = new Image();
    img.onload = () => {
      const ratio = img.width / img.height;
      const isSquare = Math.abs(ratio - 1) < 0.05;
      const isVertical45 = Math.abs(ratio - 0.8) < 0.05;

      if (!isSquare && !isVertical45) {
        this.instagramImageWarning.set(
          `Image is ${img.width}x${img.height} (ratio ${ratio.toFixed(2)}). Instagram recommends a 1:1 square or 4:5 vertical image - this may get cropped.`
        );
      } else {
        this.instagramImageWarning.set(null);
      }
      this.cdr.markForCheck();
    };
    img.src = dataUrl;
  }

  generateInstagramCaption() {
    const categoryId = (this.productForm as any).category;
    const materialId = (this.productForm as any).material;

    const categoryName = this.categoryAdminService.getCategories()
      .find((c: any) => this.toString(c.id) === this.toString(categoryId))?.name || '';
    const materialName = this.categoryService.getMaterials()
      .find((m: any) => this.toString(m.id) === this.toString(materialId))?.name || '';

    const productId = this.editingProduct()?.id;
    const productLink = productId
      ? `${environment.siteUrl}/product/${productId}`
      : `${environment.siteUrl}/products`;

    const hashtagCategory = categoryName.replace(/\s+/g, '');
    const hashtagMaterial = materialName.replace(/\s+/g, '');

    const caption =
      `${this.productForm.name || 'New Product'}\n\n` +
      `Available now for ₹${this.productForm.price || 0}!\n\n` +
      `Shop here: ${productLink}\n\n` +
      `#newarrival${hashtagCategory ? ' #' + hashtagCategory : ''}${hashtagMaterial ? ' #' + hashtagMaterial : ''}`;

    this.productForm.instagramCaption = caption.slice(0, 2200);
    this.cdr.markForCheck();
  }

  private buildInstagramPayload(): { enabled: boolean; imageOption: string; customImage: string | null; caption: string } | undefined {
    if (!this.productForm.shareToInstagram) {
      return undefined;
    }
    return {
      enabled: true,
      imageOption: this.productForm.instagramImageOption,
      customImage: this.productForm.instagramImageOption === 'custom' ? this.productForm.instagramCustomImage : null,
      caption: this.productForm.instagramCaption
    };
  }

  private handleInstagramResult(instagramResult: any) {
    if (!instagramResult) return;

    if (instagramResult.success) {
      this.showSuccess(`📸 Published to Instagram successfully! (Post ID: ${instagramResult.postId})`);
    } else {
      this.showError(`Product saved, but Instagram publish failed: ${instagramResult.error}`);
    }
  }

  async saveProduct() {
    if (!this.productForm.name || !this.productForm.description || !this.productForm.image || !this.productForm.category || !this.productForm.material || !this.productForm.price || this.productForm.stock === null || this.productForm.stock === undefined) {
      this.showError('❌ Please fill in ALL required fields:\n✓ Product Name\n✓ Description\n✓ Price\n✓ Category\n✓ Material\n✓ Stock Quantity\n✓ Product Image');
      return;
    }

    if (this.productForm.shareToInstagram) {
      if (this.productForm.instagramCaption.length > 2200) {
        this.showError('❌ Instagram caption must be under 2,200 characters');
        return;
      }
      if (this.productForm.instagramImageOption === 'custom' && !this.productForm.instagramCustomImage) {
        this.showError('❌ Please upload a custom Instagram graphic, or switch to the primary product photo');
        return;
      }
    }

    try {
      const isUpdate = !!this.editingProduct();
      this.loaderService.show(isUpdate ? 'Updating product...' : 'Creating product...', true);

      let productId: string | null = null;

      if (isUpdate) {
        // Build proper payload for update (map form fields to API format)
        const updatePayload = {
          name: this.productForm.name,
          description: this.productForm.description,
          price: parseFloat(String(this.productForm.price)),
          categoryId: parseInt(String(this.productForm.category)) || null,
          materialId: (this.productForm as any).material ? parseInt(String((this.productForm as any).material)) : null,
          image: this.productForm.image,
          stock: parseInt(String(this.productForm.stock)),
          is_trending: this.productForm.isTrending ? 1 : 0,
          is_new_arrival: this.productForm.isNewArrival ? 1 : 0,
          is_best_seller: this.productForm.isBestSeller ? 1 : 0,
          is_featured: this.productForm.isFeatured ? 1 : 0,
          status: 'active',
          instagram: this.buildInstagramPayload()
        };

        const result = await this.productService.updateProduct(this.editingProduct()!.id, updatePayload as any);
        if (result.success) {
          productId = this.editingProduct()!.id;
          this.showSuccess('✅ Product updated successfully');

          // Save/update gallery images if any
          if (this.galleryImages.length > 0 && productId) {
            this.loaderService.show('Uploading gallery images...', true);
            const gallerySuccess = await this.saveGalleryImages(productId);

            if (gallerySuccess) {
              this.showSuccess('✅ Product updated with gallery images!');
            } else {
              this.showSuccess('✅ Product updated. Gallery image upload had issues.');
            }
          }

          this.handleInstagramResult(result.instagram);

          this.loaderService.complete();
          await this.loadProducts();
        } else {
          this.loaderService.hide();
          this.showError(`❌ Failed to update product: ${result.error}`);
          return;
        }
      } else {
        // Simple: Create product with primary image only
        const apiPayload = {
          name: this.productForm.name,
          description: this.productForm.description,
          price: parseFloat(String(this.productForm.price)),
          categoryId: parseInt(String(this.productForm.category)),
          materialId: parseInt(String(this.productForm.material)),
          image: this.productForm.image,
          stock: parseInt(String(this.productForm.stock)),
          is_trending: this.productForm.isTrending ? 1 : 0,
          is_new_arrival: this.productForm.isNewArrival ? 1 : 0,
          is_best_seller: this.productForm.isBestSeller ? 1 : 0,
          is_featured: this.productForm.isFeatured ? 1 : 0,
          status: 'active',
          instagram: this.buildInstagramPayload()
        };

        const result = await this.productService.addProduct(apiPayload as any);
        if (result.success) {
          await this.loadProducts();

          // Get the newly created product ID (last product in list)
          const products = this.productService.getProducts();
          const productId = products.length > 0 ? products[products.length - 1].id : null;

          // Save gallery images if any
          if (this.galleryImages.length > 0 && productId) {
            this.loaderService.show('Uploading gallery images...', true);
            const gallerySuccess = await this.saveGalleryImages(productId);

            if (gallerySuccess) {
              this.showSuccess('✅ Product created with gallery images!');
            } else {
              this.showSuccess('✅ Product created. Gallery image upload had issues.');
            }
          } else {
            this.showSuccess('✅ Product created successfully!');
          }

          this.handleInstagramResult(result.instagram);

          this.loaderService.complete();
        } else {
          this.loaderService.hide();
          this.showError(`❌ Failed to add product: ${result.error}`);
          return;
        }
      }

      this.resetProductForm();
      this.cdr.markForCheck();
      this.activeTab.set('products');
    } catch (error) {
      console.error('Error saving product:', error);
      this.loaderService.hide();
      this.showError('Error saving product');
    }
  }


  // Gallery Images Methods

  onGalleryImagesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) return;

    const maxImages = 10;
    const availableSlots = maxImages - this.galleryImages.length;
    const filesToAdd = Math.min(files.length, availableSlots);

    if (availableSlots <= 0) {
      this.showError('Maximum 10 gallery images allowed');
      return;
    }

    for (let i = 0; i < filesToAdd; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        this.galleryImages.push({
          url: e.target?.result as string,
          alt_text: '',
          display_order: this.galleryImages.length + 1,
          isExisting: false  // Mark as new, not existing
        });
        this.cdr.markForCheck();
      };

      reader.onerror = () => {
        this.showError(`Failed to read image: ${file.name}`);
      };

      reader.readAsDataURL(file);
    }

    if (filesToAdd < files.length) {
      this.showError(`Only ${filesToAdd} images added. Maximum 10 images allowed.`);
    }

    this.showSuccess(`✅ ${filesToAdd} image(s) added to gallery`);
  }

  onGalleryImagesDropped(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (!files) return;

    // Simulate file input change
    const input = document.querySelector('#galleryFileInput') as HTMLInputElement;
    if (input) {
      const dataTransfer = new DataTransfer();
      for (let i = 0; i < files.length; i++) {
        dataTransfer.items.add(files[i]);
      }
      input.files = dataTransfer.files;
      this.onGalleryImagesSelected({ target: input } as any);
    }
  }

  removeGalleryImage(index: number) {
    this.galleryImages.splice(index, 1);
    // Update display order
    this.galleryImages.forEach((img, i) => {
      img.display_order = i + 1;
    });
    this.cdr.markForCheck();
  }

  clearGalleryImages() {
    if (confirm('Are you sure you want to clear all gallery images?')) {
      this.galleryImages = [];
      this.cdr.markForCheck();
    }
  }

  // Drag and Drop Reordering
  onDragStart(event: DragEvent, index: number) {
    this.draggedIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  onDrop(event: DragEvent, dropIndex: number) {
    event.preventDefault();
    event.stopPropagation();

    if (this.draggedIndex === null || this.draggedIndex === dropIndex) {
      return;
    }

    // Reorder array
    const draggedImage = this.galleryImages[this.draggedIndex];
    this.galleryImages.splice(this.draggedIndex, 1);
    this.galleryImages.splice(dropIndex, 0, draggedImage);

    // Update display order
    this.galleryImages.forEach((img, i) => {
      img.display_order = i + 1;
    });

    this.draggedIndex = null;
    this.cdr.markForCheck();
  }

  onDragEnd(event: DragEvent) {
    this.draggedIndex = null;
  }

  // Save gallery images to backend
  async saveGalleryImages(productId: string): Promise<boolean> {
    if (this.galleryImages.length === 0) {
      return true; // No images to save
    }

    try {
      const token = this.authService.getAccessToken();
      console.log('🔑 Token exists:', !!token);

      if (!token) {
        this.showError('No authentication token. Please login again.');
        return false;
      }

      // Only save NEW images (mark isExisting=true to skip already-saved ones)
      const newImages = this.galleryImages.filter(img => !(img as any).isExisting);

      console.log('📤 Gallery images - Total:', this.galleryImages.length, 'New to upload:', newImages.length);

      // If no new images to save, return success (nothing to do)
      if (newImages.length === 0) {
        console.log('✅ No new images to upload (all are existing)');
        return true;
      }

      const payload = {
        images: newImages.map((img, index) => ({
          url: img.url,
          alt_text: img.alt_text || `Product image ${index + 1}`,
          display_order: index + 1
        }))
      };

      console.log('📤 Gallery payload:', { imageCount: payload.images.length });

      const response = await fetch(`${environment.apiUrl}/products/${productId}/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Gallery response status:', response.status);

      const result = await response.json();

      if (result.success) {
        console.log('✅ Gallery images saved:', result.count, 'new images');
        this.galleryImages = []; // Clear the gallery
        return true;
      } else {
        console.error('Gallery upload error:', result.message);
        this.showError('Failed to save gallery images: ' + result.message);
        return false;
      }
    } catch (error) {
      console.error('Error saving gallery images:', error);
      this.showError('Error saving gallery images');
      return false;
    }
  }

  // Helper method for template to convert values to string
  toString(value: any): string {
    return String(value);
  }

  resetProductForm() {
    this.editingProduct.set(null);
    this.showEditForm.set(false);
    this.galleryImages = []; // Clear gallery images
    this.productForm = {
      name: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      image: '',
      rating: 4.5,
      reviews: 0,
      category: '',
      material: '',
      collection: '',
      stock: 50,
      inStock: true,
      discount: 0,
      isTrending: false,
      isNewArrival: false,
      isBestSeller: false,
      isFeatured: false,
      shareToInstagram: false,
      instagramImageOption: 'primary' as 'primary' | 'custom',
      instagramCustomImage: '',
      instagramCaption: '',
      isInstagramPublished: false,
      instagramPostId: null as string | null,
    };
    this.instagramPanelOpen.set(false);
    this.instagramImageWarning.set(null);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.getTotalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  prevPage() {
    this.goToPage(this.currentPage() - 1);
  }

  getInStockCount(): number {
    return this.productService.products().filter(p => p.inStock).length;
  }

  // ===== CATEGORY MANAGEMENT =====
  loadCategories() {
    console.log('LoadCategories called');
    this.categoryAdminService.fetchAllCategories();
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 1000);
  }

  getFilteredCategories(): CategoryAdmin[] {
    const query = this.categorySearchQuery.toLowerCase();
    const categories = this.categoryAdminService.getCategories();

    if (!query) {
      return categories;
    }

    return categories.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.type.toLowerCase().includes(query)
    );
  }

  performCategorySearch() {
    // Search is done via computed signal
  }

  openAddCategoryForm() {
    this.editingCategory.set(null);
    this.categoryForm = {
      name: '',
      slug: '',
      type: '',
      description: '',
      status: 'active',
    };
    this.showCategoryForm.set(true);
  }

  cancelCategoryForm() {
    this.showCategoryForm.set(false);
    this.editingCategory.set(null);
    this.categoryForm = {
      name: '',
      slug: '',
      type: '',
      description: '',
      status: 'active',
    };
  }

  editCategory(category: CategoryAdmin) {
    this.editingCategory.set(category);
    this.categoryForm = {
      name: category.name,
      slug: category.slug,
      type: category.type,
      description: category.description || '',
      status: category.status,
    };
    this.showCategoryForm.set(true);
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async saveCategory() {
    if (!this.categoryForm.name || !this.categoryForm.slug || !this.categoryForm.type) {
      this.showError('Please fill in all required fields');
      return;
    }

    try {
      const isUpdate = !!this.editingCategory();
      this.loaderService.show(isUpdate ? 'Updating category...' : 'Creating category...', true);

      const categoryData = {
        name: this.categoryForm.name,
        slug: this.slugify(this.categoryForm.slug),
        type: this.categoryForm.type as 'material' | 'type' | 'collection',
        description: this.categoryForm.description,
        status: this.categoryForm.status,
      };

      if (isUpdate) {
        const result = await this.categoryAdminService.updateCategory(this.editingCategory()!.id, categoryData);
        if (result.success) {
          this.showSuccess('Category updated successfully');
        } else {
          this.loaderService.hide();
          this.showError(`Failed to update category: ${result.error}`);
          return;
        }
      } else {
        const result = await this.categoryAdminService.addCategory(categoryData);
        if (result.success) {
          this.showSuccess('Category added successfully');
        } else {
          this.loaderService.hide();
          this.showError(`Failed to add category: ${result.error}`);
          return;
        }
      }

      this.loaderService.complete();
      this.cancelCategoryForm();
      this.loadCategories();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error saving category:', error);
      this.loaderService.hide();
      this.showError('Error saving category');
    }
  }

  async deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        this.loaderService.show('Deleting category...', true);
        const result = await this.categoryAdminService.deleteCategory(id);
        if (result.success) {
          this.loaderService.complete();
          this.showSuccess('Category deleted successfully');
          this.loadCategories();
          this.cdr.markForCheck();
        } else {
          this.loaderService.hide();
          this.showError(`Failed to delete category: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting category:', error);
        this.loaderService.hide();
        this.showError('Error deleting category');
      }
    }
  }

  // ===== MATERIAL MANAGEMENT =====
  loadMaterials() {
    console.log('LoadMaterials called');
    this.materialAdminService.fetchAllMaterials();
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 1000);
  }

  getFilteredMaterials(): MaterialAdmin[] {
    const query = this.materialSearchQuery.toLowerCase();
    const materials = this.materialAdminService.getMaterials();

    if (!query) {
      return materials;
    }

    return materials.filter(m => m.name.toLowerCase().includes(query));
  }

  performMaterialSearch() {
    // Search is done via computed signal
  }

  openAddMaterialForm() {
    this.editingMaterial.set(null);
    this.materialForm = {
      name: '',
      slug: '',
      description: '',
      status: 'active',
    };
    this.showMaterialForm.set(true);
  }

  cancelMaterialForm() {
    this.showMaterialForm.set(false);
    this.editingMaterial.set(null);
    this.materialForm = {
      name: '',
      slug: '',
      description: '',
      status: 'active',
    };
  }

  editMaterial(material: MaterialAdmin) {
    this.editingMaterial.set(material);
    this.materialForm = {
      name: material.name,
      slug: material.slug,
      description: material.description || '',
      status: material.status,
    };
    this.showMaterialForm.set(true);
  }

  async saveMaterial() {
    if (!this.materialForm.name || !this.materialForm.slug) {
      this.showError('Please fill in all required fields');
      return;
    }

    try {
      const isUpdate = !!this.editingMaterial();
      this.loaderService.show(isUpdate ? 'Updating material...' : 'Creating material...', true);

      const materialData = {
        name: this.materialForm.name,
        slug: this.slugify(this.materialForm.slug),
        description: this.materialForm.description,
        status: this.materialForm.status,
      };

      if (isUpdate) {
        const result = await this.materialAdminService.updateMaterial(this.editingMaterial()!.id, materialData);
        if (result.success) {
          this.showSuccess('Material updated successfully');
        } else {
          this.loaderService.hide();
          this.showError(`Failed to update material: ${result.error}`);
          return;
        }
      } else {
        const result = await this.materialAdminService.addMaterial(materialData);
        if (result.success) {
          this.showSuccess('Material added successfully');
        } else {
          this.loaderService.hide();
          this.showError(`Failed to add material: ${result.error}`);
          return;
        }
      }

      this.loaderService.complete();
      this.cancelMaterialForm();
      this.loadMaterials();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error saving material:', error);
      this.loaderService.hide();
      this.showError('Error saving material');
    }
  }

  async deleteMaterial(id: string) {
    if (confirm('Are you sure you want to delete this material?')) {
      try {
        this.loaderService.show('Deleting material...', true);
        const result = await this.materialAdminService.deleteMaterial(id);
        if (result.success) {
          this.loaderService.complete();
          this.showSuccess('Material deleted successfully');
          this.loadMaterials();
          this.cdr.markForCheck();
        } else {
          this.loaderService.hide();
          this.showError(`Failed to delete material: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting material:', error);
        this.loaderService.hide();
        this.showError('Error deleting material');
      }
    }
  }

  // ===== USER MANAGEMENT =====
  loadUsers() {
    console.log('LoadUsers called');
    this.userManagementService.fetchAllUsers();
    setTimeout(() => {
      this.cdr.markForCheck();
    }, 1000);
  }

  getFilteredUsers(): User[] {
    const query = this.userSearchQuery.toLowerCase();
    const users = this.userManagementService.getUsers();

    if (!query) {
      return users;
    }

    return users.filter(u =>
      u.name.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query)
    );
  }

  performUserSearch() {
    // Search is done via computed signal
  }

  openAddUserForm() {
    this.editingUser.set(null);
    this.userForm = {
      name: '',
      email: '',
      phone: '',
      role: '',
      status: '',
    };
    this.showUserForm.set(true);
  }

  cancelUserForm() {
    this.showUserForm.set(false);
    this.editingUser.set(null);
    this.userForm = {
      name: '',
      email: '',
      phone: '',
      role: '',
      status: '',
    };
  }

  editUser(user: User) {
    this.editingUser.set(user);
    this.userForm = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
    };
    this.showUserForm.set(true);
  }

  async saveUser() {
    if (!this.userForm.name || !this.userForm.email || !this.userForm.role || !this.userForm.status) {
      this.showError('Please fill in all required fields');
      return;
    }

    try {
      const isUpdate = !!this.editingUser();
      this.loaderService.show(isUpdate ? 'Updating user...' : 'Saving user...', true);

      if (isUpdate) {
        const result = await this.userManagementService.updateUser(this.editingUser()!.id, {
          name: this.userForm.name,
          email: this.userForm.email,
          phone: this.userForm.phone,
          role: this.userForm.role as 'user' | 'admin',
          status: this.userForm.status as 'active' | 'inactive' | 'banned',
        });
        if (result.success) {
          this.showSuccess('User updated successfully');
        } else {
          this.loaderService.hide();
          this.showError(`Failed to update user: ${result.error}`);
          return;
        }
      } else {
        const result = await this.userManagementService.addUser({
          name: this.userForm.name,
          email: this.userForm.email,
          phone: this.userForm.phone,
          role: this.userForm.role as 'user' | 'admin',
          status: this.userForm.status as 'active' | 'inactive' | 'banned',
        });
        if (result.success) {
          this.showSuccess('User saved successfully');
        } else {
          this.loaderService.hide();
          this.showError(`Failed to save user: ${result.error}`);
          return;
        }
      }

      this.loaderService.complete();
      this.cancelUserForm();
      this.loadUsers();
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error saving user:', error);
      this.loaderService.hide();
      this.showError('Error saving user');
    }
  }

  async deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        this.loaderService.show('Deleting user...', true);
        const result = await this.userManagementService.deleteUser(id);
        if (result.success) {
          this.loaderService.complete();
          this.showSuccess('User deleted successfully');
          this.loadUsers();
          this.cdr.markForCheck();
        } else {
          this.loaderService.hide();
          this.showError(`Failed to delete user: ${result.error}`);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        this.loaderService.hide();
        this.showError('Error deleting user');
      }
    }
  }

  // ===== ORDER MANAGEMENT =====
  loadOrders() {
    console.log('LoadOrders called');
    this.loaderService.show('Loading orders...', true);
    this.orderManagementService.fetchAllOrders().then(() => {
      this.loaderService.complete();
      this.cdr.markForCheck();
    }).catch(() => {
      this.loaderService.hide();
    });
  }

  getOrderStats() {
    return this.orderManagementService.getOrderStats();
  }

  // ===== PAYMENT MANAGEMENT =====
  loadPayments() {
    console.log('LoadPayments called');
    this.loaderService.show('Loading payments...', true);
    this.paymentManagementService.fetchAllPayments().then(() => {
      this.loaderService.complete();
      this.cdr.markForCheck();
    }).catch(() => {
      this.loaderService.hide();
    });
  }

  getPaymentStats() {
    return this.paymentManagementService.getPaymentStats();
  }

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  getOrderPercentage(status: string): number {
    const stats = this.getOrderStats();
    const total = stats.total;
    if (total === 0) return 0;

    const count = (stats as any)[status];
    return Math.round((count / total) * 100);
  }

  loadTopProducts() {
    console.log('LoadTopProducts called');
    this.productService.getTopProducts(10, 'price', 'DESC').then((products) => {
      console.log('✓ Top products loaded:', products);
      this.topProducts.set(products);
      this.cdr.markForCheck();
    }).catch((error) => {
      console.error('Error loading top products:', error);
      // Fallback: get from local products
      const sorted = this.productService.products()
        .sort((a: any, b: any) => b.price - a.price)
        .slice(0, 10);
      this.topProducts.set(sorted);
    });
  }

  getTopProducts(): any[] {
    return this.topProducts();
  }

  logout() {
    this.authService.logout();
  }

  ngOnDestroy() {
    // Clean up blob URLs to prevent memory leaks
    this.blobImageService.releaseAllUrls();
  }
}
