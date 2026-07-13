import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { MockDataService } from '../../core/services/mock-data.service';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar.component';
import { AdminUsersComponent } from './admin-users.component';
import { CategoryManagementComponent } from './category-management.component';
import { Product } from '../../core/models';

@Component({
  selector: 'app-admin-dashboard-enhanced',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ProgressBarComponent, AdminUsersComponent, CategoryManagementComponent],
  template: `
    <!-- Authorization Check -->
    <div *ngIf="!authService.isAdminUser()" class="bg-red-50 border-b-2 border-red-500 p-6">
      <div class="max-w-full">
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

    <div *ngIf="authService.isAdminUser()" class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white shadow-md sticky top-0 z-40">
        <div class="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-rose-500">MOONCRAFT Admin Dashboard</h1>
            <p class="text-sm text-gray-600">Welcome, {{ authService.currentUser()?.name }}</p>
          </div>
          <button
            (click)="logout()"
            class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
            Logout
          </button>
        </div>
      </header>

      <div class="flex h-screen">
        <!-- Left Sidebar - Main Content -->
        <div class="flex-1 overflow-y-auto">
          <div class="p-6 max-w-6xl">
            <!-- Top Stats -->
            <div class="grid grid-cols-4 gap-6 mb-8">
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600 text-sm">Total Products</p>
                    <p class="text-3xl font-bold text-gray-900">{{ productService.getProducts().length }}</p>
                  </div>
                  <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">📦</span>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600 text-sm">Total Revenue</p>
                    <p class="text-3xl font-bold text-gray-900">₹{{ calculateTotalRevenue() }}</p>
                  </div>
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">💰</span>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600 text-sm">In Stock</p>
                    <p class="text-3xl font-bold text-gray-900">{{ getInStockCount() }}</p>
                  </div>
                  <div class="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">✅</span>
                  </div>
                </div>
              </div>

              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-gray-600 text-sm">Out of Stock</p>
                    <p class="text-3xl font-bold text-gray-900">{{ getOutOfStockCount() }}</p>
                  </div>
                  <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span class="text-2xl">❌</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-4 mb-6 bg-white rounded-lg shadow p-4">
              <button
                (click)="switchTab('products')"
                [class.bg-rose-500]="activeTab() === 'products'"
                [class.text-white]="activeTab() === 'products'"
                [class.bg-gray-100]="activeTab() !== 'products'"
                [class.text-gray-700]="activeTab() !== 'products'"
                class="px-6 py-2 rounded-lg font-semibold transition-colors">
                Products Management
              </button>
              <button
                (click)="switchTab('add')"
                [class.bg-rose-500]="activeTab() === 'add'"
                [class.text-white]="activeTab() === 'add'"
                [class.bg-gray-100]="activeTab() !== 'add'"
                [class.text-gray-700]="activeTab() !== 'add'"
                class="px-6 py-2 rounded-lg font-semibold transition-colors">
                Add New Product
              </button>
              <button
                (click)="switchTab('categories')"
                [class.bg-rose-500]="activeTab() === 'categories'"
                [class.text-white]="activeTab() === 'categories'"
                [class.bg-gray-100]="activeTab() !== 'categories'"
                [class.text-gray-700]="activeTab() !== 'categories'"
                class="px-6 py-2 rounded-lg font-semibold transition-colors">
                Categories
              </button>
              <button
                (click)="switchTab('users')"
                [class.bg-rose-500]="activeTab() === 'users'"
                [class.text-white]="activeTab() === 'users'"
                [class.bg-gray-100]="activeTab() !== 'users'"
                [class.text-gray-700]="activeTab() !== 'users'"
                class="px-6 py-2 rounded-lg font-semibold transition-colors">
                Users
              </button>
            </div>

            <!-- Products List -->
            <div *ngIf="activeTab() === 'products'" class="bg-white rounded-lg shadow">
              <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-xl font-bold">Products ({{ filteredProducts().length }})</h2>
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    (ngModelChange)="performSearch()"
                    placeholder="Search products..."
                    class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full">
                    <thead class="bg-gray-100">
                      <tr>
                        <th class="px-6 py-3 text-left text-sm font-semibold">Product</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold">Category</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold">Price</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold">Stock</th>
                        <th class="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let product of filteredProducts()" class="border-b hover:bg-gray-50">
                        <td class="px-6 py-4">
                          <div class="flex items-center gap-4">
                            <img [src]="product.image" [alt]="product.name" class="w-10 h-10 rounded object-cover">
                            <p class="font-semibold text-sm">{{ product.name }}</p>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-sm">{{ product.category }}</td>
                        <td class="px-6 py-4 font-semibold">₹{{ product.price }}</td>
                        <td class="px-6 py-4">
                          <span [class.text-green-600]="product.inStock" [class.text-red-600]="!product.inStock">
                            {{ product.inStock ? 'In Stock' : 'Out' }}
                          </span>
                        </td>
                        <td class="px-6 py-4 space-x-2">
                          <button
                            (click)="editProduct(product)"
                            [disabled]="isLoading()"
                            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 text-sm">
                            Edit
                          </button>
                          <button
                            (click)="deleteProduct(product.id)"
                            [disabled]="isLoading()"
                            class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400 text-sm">
                            Delete
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div *ngIf="filteredProducts().length === 0" class="text-center py-8">
                  <p class="text-gray-600">No products found</p>
                </div>
              </div>
            </div>

            <!-- Add Product Form -->
            <div *ngIf="(activeTab() === 'add' || showEditForm())" class="bg-white rounded-lg shadow p-8">
              <h2 class="text-2xl font-bold mb-6">
                {{ editingProduct() ? 'Edit Product' : 'Add New Product' }}
              </h2>

              <form (ngSubmit)="saveProduct()" class="space-y-6">
                <!-- Loading Overlay -->
                <div *ngIf="isLoading()" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
                  <div class="bg-white p-8 rounded-lg shadow-lg">
                    <app-loading-spinner message="Saving product..."></app-loading-spinner>
                  </div>
                </div>

                <!-- Product Name -->
                <div>
                  <label class="block text-sm font-semibold mb-2">Product Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="form.name"
                    name="name"
                    required
                    [disabled]="isLoading()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
                </div>

                <!-- Description -->
                <div>
                  <label class="block text-sm font-semibold mb-2">Description *</label>
                  <textarea
                    [(ngModel)]="form.description"
                    name="description"
                    required
                    rows="3"
                    [disabled]="isLoading()"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"></textarea>
                </div>

                <!-- Price Row -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2">Price *</label>
                    <input
                      type="number"
                      [(ngModel)]="form.price"
                      name="price"
                      required
                      [disabled]="isLoading()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Original Price</label>
                    <input
                      type="number"
                      [(ngModel)]="form.originalPrice"
                      name="originalPrice"
                      [disabled]="isLoading()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
                  </div>
                </div>

                <!-- Category & Material -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2">Category *</label>
                    <select
                      [(ngModel)]="form.category"
                      name="category"
                      required
                      [disabled]="isLoading()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
                      <option value="" disabled>Select a category</option>
                      <option *ngFor="let cat of categories()" [value]="cat">{{ cat }}</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Material *</label>
                    <select
                      [(ngModel)]="form.material"
                      name="material"
                      required
                      [disabled]="isLoading()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
                      <option value="" disabled>Select a material</option>
                      <option *ngFor="let mat of materials()" [value]="mat">{{ mat }}</option>
                    </select>
                  </div>
                </div>

                <!-- Image Upload with Progress -->
                <div>
                  <label class="block text-sm font-semibold mb-3">Product Image *</label>
                  <app-progress-bar
                    [progress]="uploadProgress()"
                    [show]="isUploading()"
                    label="Uploading image...">
                  </app-progress-bar>

                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-rose-500 transition-colors mt-4"
                    (click)="fileInput.click()"
                    [class.opacity-50]="isUploading()">
                    <input
                      #fileInput
                      type="file"
                      accept="image/*"
                      (change)="onImageSelected($event)"
                      [disabled]="isUploading()"
                      class="hidden">
                    <div *ngIf="!form.image" class="space-y-2">
                      <p class="text-gray-600 font-medium">Click to upload image</p>
                      <p class="text-sm text-gray-500">or drag and drop (PNG, JPG up to 10MB)</p>
                    </div>
                    <div *ngIf="form.image && !isUploading()" class="space-y-3">
                      <p class="text-green-600 font-semibold">✓ Image uploaded successfully</p>
                      <img [src]="form.image" alt="Preview" class="max-h-40 mx-auto rounded">
                    </div>
                    <div *ngIf="isUploading()" class="space-y-2">
                      <p class="text-rose-600 font-semibold">Uploading...</p>
                    </div>
                  </div>
                </div>

                <!-- Stock Status & Discount -->
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold mb-2">Stock Status</label>
                    <select
                      [(ngModel)]="form.inStock"
                      name="inStock"
                      [disabled]="isLoading()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
                      <option [value]="true">In Stock</option>
                      <option [value]="false">Out of Stock</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Discount (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      [(ngModel)]="form.discount"
                      name="discount"
                      [disabled]="isLoading()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
                  </div>
                </div>

                <!-- New Arrival & Rating -->
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex items-center gap-3 p-3 border border-gray-300 rounded-lg hover:bg-rose-50 transition-colors">
                    <input
                      type="checkbox"
                      [(ngModel)]="form.isNewArrival"
                      name="isNewArrival"
                      [disabled]="isLoading()"
                      id="newArrival"
                      class="w-5 h-5 text-rose-500 rounded cursor-pointer">
                    <label for="newArrival" class="text-sm font-semibold text-gray-900 cursor-pointer">
                      Mark as New Arrival
                    </label>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold mb-2">Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      [(ngModel)]="form.rating"
                      name="rating"
                      [disabled]="isLoading()"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
                  </div>
                </div>

                <!-- Buttons -->
                <div class="flex gap-4 pt-6 border-t">
                  <button
                    type="submit"
                    [disabled]="isLoading() || isUploading() || !form.image"
                    class="flex-1 bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 disabled:bg-gray-400 transition-colors">
                    {{ isLoading() ? 'Saving...' : (editingProduct() ? 'Update Product' : 'Add Product') }}
                  </button>
                  <button
                    type="button"
                    (click)="resetForm()"
                    [disabled]="isLoading()"
                    class="flex-1 bg-gray-300 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-400 disabled:opacity-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            <!-- Categories Tab -->
            <div *ngIf="activeTab() === 'categories'">
              <app-category-management></app-category-management>
            </div>

            <!-- Users Tab -->
            <div *ngIf="activeTab() === 'users'">
              <app-admin-users></app-admin-users>
            </div>
          </div>
        </div>

        <!-- Right Sidebar - Analytics Dashboard -->
        <div class="w-80 bg-white shadow-lg overflow-y-auto border-l">
          <div class="p-6 space-y-6">
            <h3 class="text-lg font-bold text-gray-900">Analytics</h3>

            <!-- Sales Chart -->
            <div class="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-4">
              <h4 class="font-semibold text-sm mb-4">Revenue Distribution</h4>
              <div class="space-y-2">
                <div class="flex items-center justify-between text-sm">
                  <span>Silver Jewelry</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-rose-500" style="width: 45%"></div>
                    </div>
                    <span class="text-gray-600 text-xs">45%</span>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span>Necklaces</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-pink-500" style="width: 30%"></div>
                    </div>
                    <span class="text-gray-600 text-xs">30%</span>
                  </div>
                </div>
                <div class="flex items-center justify-between text-sm">
                  <span>Other</span>
                  <div class="flex items-center gap-2">
                    <div class="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div class="h-full bg-purple-500" style="width: 25%"></div>
                    </div>
                    <span class="text-gray-600 text-xs">25%</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Financial Summary -->
            <div class="bg-blue-50 rounded-lg p-4">
              <h4 class="font-semibold text-sm mb-3">Financial Summary</h4>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">Total Products Value</span>
                  <span class="font-semibold">₹{{ calculateTotalRevenue() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Avg Product Price</span>
                  <span class="font-semibold">₹{{ getAveragePrice() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Highest Price</span>
                  <span class="font-semibold">₹{{ getHighestPrice() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Lowest Price</span>
                  <span class="font-semibold">₹{{ getLowestPrice() }}</span>
                </div>
              </div>
            </div>

            <!-- Inventory Status -->
            <div class="bg-green-50 rounded-lg p-4">
              <h4 class="font-semibold text-sm mb-3">Inventory Status</h4>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">In Stock Items</span>
                  <span class="font-semibold text-green-600">{{ getInStockCount() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Out of Stock Items</span>
                  <span class="font-semibold text-red-600">{{ getOutOfStockCount() }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Stock Health</span>
                  <span class="font-semibold" [class.text-green-600]="getStockHealth() > 70" [class.text-yellow-600]="getStockHealth() <= 70">
                    {{ getStockHealth() }}%
                  </span>
                </div>
              </div>
            </div>

            <!-- Top Products -->
            <div class="bg-purple-50 rounded-lg p-4">
              <h4 class="font-semibold text-sm mb-3">Top Products (by price)</h4>
              <div class="space-y-2 text-sm max-h-48 overflow-y-auto">
                <div *ngFor="let product of getTopProducts(); let i = index" class="flex justify-between items-center pb-2 border-b last:border-b-0">
                  <span class="truncate text-gray-700">{{ i + 1 }}. {{ product.name }}</span>
                  <span class="font-semibold whitespace-nowrap">₹{{ product.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardEnhancedComponent implements OnInit {
  activeTab = signal<'products' | 'add' | 'categories' | 'users'>('products');
  searchQuery = '';
  filteredProducts = signal<Product[]>([]);
  editingProduct = signal<Product | null>(null);
  showEditForm = signal(false);
  isLoading = signal(false);
  isUploading = signal(false);
  uploadProgress = signal(0);

  form = {
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined as number | undefined,
    image: '',
    rating: 4.5,
    reviews: 0,
    category: '',
    material: '',
    collection: '',
    inStock: true,
    discount: 0,
    isNewArrival: false,
  };

  categories = signal<string[]>([]);
  materials = signal<string[]>([]);

  constructor(
    public authService: AuthService,
    public productService: ProductService,
    private mockDataService: MockDataService,
    private router: Router
  ) {}

  ngOnInit() {
    if (!this.authService.isAdminUser()) {
      this.router.navigate(['/login']);
    }
    this.loadProducts();
    this.loadCategoriesAndMaterials();
  }

  loadCategoriesAndMaterials() {
    // Get unique categories
    const cats = this.mockDataService.getCategories().map(c => c.name);
    this.categories.set(cats);

    // Get unique materials
    const mats = this.mockDataService.getMaterials().map(m => m.name);
    this.materials.set(mats);
  }

  loadProducts() {
    this.filteredProducts.set(this.productService.getProducts());
  }

  switchTab(tab: 'products' | 'add' | 'categories' | 'users') {
    this.activeTab.set(tab);
    this.resetForm();
  }

  performSearch() {
    if (this.searchQuery) {
      this.filteredProducts.set(this.productService.searchProducts(this.searchQuery));
    } else {
      this.loadProducts();
    }
  }

  editProduct(product: Product) {
    this.editingProduct.set(product);
    this.showEditForm.set(true);
    Object.assign(this.form, product);
    this.activeTab.set('add');
  }

  deleteProduct(id: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading.set(true);
      setTimeout(() => {
        this.productService.deleteProduct(id);
        this.loadProducts();
        this.isLoading.set(false);
      }, 800);
    }
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.isUploading.set(true);
      const reader = new FileReader();

      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          this.uploadProgress.set(progress);
        }
      };

      reader.onload = (e) => {
        setTimeout(() => {
          this.form.image = e.target?.result as string;
          this.isUploading.set(false);
          this.uploadProgress.set(0);
        }, 500);
      };

      reader.readAsDataURL(file);
    }
  }

  saveProduct() {
    if (!this.form.name || !this.form.description || !this.form.image) {
      alert('Please fill in all required fields');
      return;
    }

    this.isLoading.set(true);

    setTimeout(() => {
      if (this.editingProduct()) {
        this.productService.updateProduct(this.editingProduct()!.id, this.form as any);
      } else {
        this.productService.addProduct(this.form as any);
      }

      this.resetForm();
      this.loadProducts();
      this.activeTab.set('products');
      this.isLoading.set(false);
    }, 1200);
  }

  resetForm() {
    this.editingProduct.set(null);
    this.showEditForm.set(false);
    this.form = {
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
      inStock: true,
      discount: 0,
      isNewArrival: false,
    };
  }

  logout() {
    this.authService.logout();
  }

  // Analytics Methods
  calculateTotalRevenue(): number {
    return this.productService.getProducts().reduce((sum, p) => sum + p.price, 0);
  }

  getInStockCount(): number {
    return this.productService.getProducts().filter(p => p.inStock).length;
  }

  getOutOfStockCount(): number {
    return this.productService.getProducts().filter(p => !p.inStock).length;
  }

  getAveragePrice(): number {
    const products = this.productService.getProducts();
    if (products.length === 0) return 0;
    return Math.round(this.calculateTotalRevenue() / products.length);
  }

  getHighestPrice(): number {
    const products = this.productService.getProducts();
    if (products.length === 0) return 0;
    return Math.max(...products.map(p => p.price));
  }

  getLowestPrice(): number {
    const products = this.productService.getProducts();
    if (products.length === 0) return 0;
    return Math.min(...products.map(p => p.price));
  }

  getStockHealth(): number {
    const total = this.productService.getProducts().length;
    if (total === 0) return 0;
    return Math.round((this.getInStockCount() / total) * 100);
  }

  getTopProducts(): Product[] {
    return [...this.productService.getProducts()]
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);
  }

  getCategories(): string[] {
    const categories = new Set(this.productService.getProducts().map(p => p.category));
    return Array.from(categories);
  }

  getProductsInCategory(category: string): Product[] {
    return this.productService.getProducts().filter(p => p.category === category);
  }

  getTotalByCategory(category: string): number {
    return this.getProductsInCategory(category).reduce((sum, p) => sum + p.price, 0);
  }
}
