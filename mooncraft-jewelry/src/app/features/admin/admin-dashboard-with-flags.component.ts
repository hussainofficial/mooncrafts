import { Component, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProductService } from '../../core/services/product.service';
import { MaterialService, Material } from '../../core/services/material.service';
import { CollectionService, Collection } from '../../core/services/collection.service';
import { ProductFlagsService, ProductWithFlags } from '../../core/services/product-flags.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-admin-dashboard-with-flags',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Authorization Check -->
    <div *ngIf="!authService.isAdminUser()" class="bg-red-50 border-b-2 border-red-500 p-6">
      <div class="max-w-7xl mx-auto">
        <p class="text-red-700 font-semibold mb-3">⚠️ Not Authorized</p>
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
    <header class="bg-white shadow-md sticky top-0 z-40" *ngIf="authService.isAdminUser()">
      <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-rose-500">MOONCRAFT Admin</h1>
          <p class="text-sm text-gray-600">Welcome, {{ authService.currentUser()?.name || 'Guest' }}</p>
        </div>
        <button
          *ngIf="authService.isLoggedIn()"
          (click)="logout()"
          class="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-semibold">
          Logout
        </button>
      </div>
    </header>

    <div class="max-w-7xl mx-auto px-6 py-8" *ngIf="authService.isAdminUser()">
      <!-- Tab Navigation -->
      <div class="bg-white rounded-2xl shadow-md p-4 mb-8">
        <div class="flex gap-4 flex-wrap">
          <button
            (click)="switchTab('materials')"
            [class.bg-rose-500]="activeTab() === 'materials'"
            [class.text-white]="activeTab() === 'materials'"
            [class.bg-gray-200]="activeTab() !== 'materials'"
            class="px-6 py-2 rounded-lg font-semibold transition-colors hover:shadow-md">
            Materials
          </button>
          <button
            (click)="switchTab('collections')"
            [class.bg-rose-500]="activeTab() === 'collections'"
            [class.text-white]="activeTab() === 'collections'"
            [class.bg-gray-200]="activeTab() !== 'collections'"
            class="px-6 py-2 rounded-lg font-semibold transition-colors hover:shadow-md">
            Collections
          </button>
          <button
            (click)="switchTab('product-flags')"
            [class.bg-rose-500]="activeTab() === 'product-flags'"
            [class.text-white]="activeTab() === 'product-flags'"
            [class.bg-gray-200]="activeTab() !== 'product-flags'"
            class="px-6 py-2 rounded-lg font-semibold transition-colors hover:shadow-md">
            Product Flags
          </button>
        </div>
      </div>

      <!-- Success/Error Messages -->
      <div *ngIf="successMessage()" class="bg-green-50 border-b-2 border-green-500 p-4 mb-6 rounded-lg">
        <p class="text-green-700 font-semibold">✅ {{ successMessage() }}</p>
        <button (click)="clearSuccess()" class="text-sm text-green-600 mt-2 underline">Dismiss</button>
      </div>
      <div *ngIf="errorMessage()" class="bg-red-50 border-b-2 border-red-500 p-4 mb-6 rounded-lg">
        <p class="text-red-700 font-semibold">❌ {{ errorMessage() }}</p>
        <button (click)="clearError()" class="text-sm text-red-600 mt-2 underline">Dismiss</button>
      </div>

      <!-- Materials Tab -->
      <div *ngIf="activeTab() === 'materials'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">🪨 Materials Management</h2>
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
              placeholder="Search materials..."
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
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Name *</label>
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
                <label class="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  [(ngModel)]="materialForm.description"
                  name="matDescription"
                  placeholder="Material description..."
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"></textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Image</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-rose-500 transition-colors"
                    (click)="materialFileInput.click()">
                    <input
                      #materialFileInput
                      type="file"
                      accept="image/*"
                      (change)="onMaterialImageSelected($event)"
                      class="hidden">
                    <div *ngIf="!materialForm.image" class="space-y-1">
                      <p class="text-gray-600 text-sm">Click to upload</p>
                    </div>
                    <img *ngIf="materialForm.image" [src]="materialForm.image" alt="Preview" class="max-h-20 mx-auto rounded">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Active</label>
                  <select
                    [(ngModel)]="materialForm.is_active"
                    name="matActive"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                    <option [value]="true">Yes</option>
                    <option [value]="false">No</option>
                  </select>
                </div>
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
                  <th class="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Slug</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let material of getFilteredMaterials()" class="border-b hover:bg-gray-50">
                  <td class="px-6 py-4 font-semibold">{{ material.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ material.slug }}</td>
                  <td class="px-6 py-4">
                    <span [class.text-green-600]="material.is_active" [class.text-red-600]="!material.is_active" class="font-semibold">
                      {{ material.is_active ? '✅ Active' : '❌ Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 space-x-2">
                    <button
                      (click)="editMaterial(material)"
                      class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                      Edit
                    </button>
                    <button
                      (click)="deleteMaterial(material.id)"
                      class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="getFilteredMaterials().length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg">No materials found</p>
          </div>
        </div>
      </div>

      <!-- Collections Tab -->
      <div *ngIf="activeTab() === 'collections'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-gray-900">👜 Collections Management</h2>
            <button
              (click)="openAddCollectionForm()"
              class="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
              + Add Collection
            </button>
          </div>

          <!-- Search -->
          <div class="mb-6">
            <input
              type="text"
              [(ngModel)]="collectionSearchQuery"
              (ngModelChange)="performCollectionSearch()"
              placeholder="Search collections..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
          </div>

          <!-- Add/Edit Collection Form -->
          <div *ngIf="showCollectionForm()" class="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              {{ editingCollection() ? '✏️ Edit Collection' : '➕ Add New Collection' }}
            </h3>
            <form (ngSubmit)="saveCollection()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Name *</label>
                  <input
                    type="text"
                    [(ngModel)]="collectionForm.name"
                    name="colName"
                    placeholder="e.g., Bridal"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Slug *</label>
                  <input
                    type="text"
                    [(ngModel)]="collectionForm.slug"
                    name="colSlug"
                    placeholder="e.g., bridal"
                    required
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
                </div>
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                <textarea
                  [(ngModel)]="collectionForm.description"
                  name="colDescription"
                  placeholder="Collection description..."
                  rows="3"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"></textarea>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Image</label>
                  <div class="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-rose-500 transition-colors"
                    (click)="collectionFileInput.click()">
                    <input
                      #collectionFileInput
                      type="file"
                      accept="image/*"
                      (change)="onCollectionImageSelected($event)"
                      class="hidden">
                    <div *ngIf="!collectionForm.image" class="space-y-1">
                      <p class="text-gray-600 text-sm">Click to upload</p>
                    </div>
                    <img *ngIf="collectionForm.image" [src]="collectionForm.image" alt="Preview" class="max-h-20 mx-auto rounded">
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-semibold text-gray-900 mb-2">Active</label>
                  <select
                    [(ngModel)]="collectionForm.is_active"
                    name="colActive"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white">
                    <option [value]="true">Yes</option>
                    <option [value]="false">No</option>
                  </select>
                </div>
              </div>
              <div class="flex gap-4">
                <button
                  type="submit"
                  class="flex-1 bg-rose-500 text-white py-2 rounded-lg font-semibold hover:bg-rose-600 transition-colors">
                  {{ editingCollection() ? 'Update' : 'Add' }} Collection
                </button>
                <button
                  type="button"
                  (click)="cancelCollectionForm()"
                  class="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg font-semibold hover:bg-gray-400 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <!-- Collections Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Slug</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let collection of getFilteredCollections()" class="border-b hover:bg-gray-50">
                  <td class="px-6 py-4 font-semibold">{{ collection.name }}</td>
                  <td class="px-6 py-4 text-sm text-gray-600">{{ collection.slug }}</td>
                  <td class="px-6 py-4">
                    <span [class.text-green-600]="collection.is_active" [class.text-red-600]="!collection.is_active" class="font-semibold">
                      {{ collection.is_active ? '✅ Active' : '❌ Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 space-x-2">
                    <button
                      (click)="editCollection(collection)"
                      class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
                      Edit
                    </button>
                    <button
                      (click)="deleteCollection(collection.id)"
                      class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="getFilteredCollections().length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg">No collections found</p>
          </div>
        </div>
      </div>

      <!-- Product Flags Tab -->
      <div *ngIf="activeTab() === 'product-flags'" class="space-y-6">
        <div class="bg-white rounded-2xl shadow-lg p-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">🚩 Product Flags Management</h2>

          <!-- Search -->
          <div class="mb-6">
            <input
              type="text"
              [(ngModel)]="productFlagsSearchQuery"
              (ngModelChange)="performProductFlagsSearch()"
              placeholder="Search products..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
          </div>

          <!-- Flags Table -->
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-100 border-b">
                <tr>
                  <th class="px-6 py-3 text-left text-sm font-semibold">Product</th>
                  <th class="px-6 py-3 text-center text-sm font-semibold">Trending</th>
                  <th class="px-6 py-3 text-center text-sm font-semibold">New Arrival</th>
                  <th class="px-6 py-3 text-center text-sm font-semibold">Best Seller</th>
                  <th class="px-6 py-3 text-center text-sm font-semibold">Featured</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of getFilteredProductsWithFlags()" class="border-b hover:bg-gray-50">
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <img [src]="product.image || 'https://via.placeholder.com/40'" [alt]="product.name" class="w-10 h-10 rounded object-cover">
                      <div>
                        <p class="font-semibold text-sm">{{ product.name }}</p>
                        <p class="text-xs text-gray-600">₹{{ product.price }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      [checked]="product.is_trending"
                      (change)="toggleProductFlag(product.id, 'is_trending', !product.is_trending)"
                      class="w-5 h-5 text-rose-500 rounded cursor-pointer">
                  </td>
                  <td class="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      [checked]="product.is_new_arrival"
                      (change)="toggleProductFlag(product.id, 'is_new_arrival', !product.is_new_arrival)"
                      class="w-5 h-5 text-rose-500 rounded cursor-pointer">
                  </td>
                  <td class="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      [checked]="product.is_best_seller"
                      (change)="toggleProductFlag(product.id, 'is_best_seller', !product.is_best_seller)"
                      class="w-5 h-5 text-rose-500 rounded cursor-pointer">
                  </td>
                  <td class="px-6 py-4 text-center">
                    <input
                      type="checkbox"
                      [checked]="product.is_featured"
                      (change)="toggleProductFlag(product.id, 'is_featured', !product.is_featured)"
                      class="w-5 h-5 text-rose-500 rounded cursor-pointer">
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div *ngIf="getFilteredProductsWithFlags().length === 0" class="text-center py-12 text-gray-500">
            <p class="text-lg">No products found</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminDashboardWithFlagsComponent implements OnInit {
  activeTab = signal<string>('materials');
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  // Materials
  showMaterialForm = signal(false);
  editingMaterial = signal<Material | null>(null);
  materialSearchQuery = '';
  materialForm: Partial<Material> = {};

  // Collections
  showCollectionForm = signal(false);
  editingCollection = signal<Collection | null>(null);
  collectionSearchQuery = '';
  collectionForm: Partial<Collection> = {};

  // Product Flags
  productFlagsSearchQuery = '';

  constructor(
    public authService: AuthService,
    public materialService: MaterialService,
    public collectionService: CollectionService,
    public productFlagsService: ProductFlagsService,
    private loaderService: LoaderService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    this.materialService.fetchAllMaterials();
    this.collectionService.fetchAllCollections();
    this.productFlagsService.fetchAllProductsWithFlags();
  }

  switchTab(tab: string) {
    this.activeTab.set(tab);
    this.clearError();
    this.clearSuccess();
  }

  // Materials Methods
  getFilteredMaterials(): Material[] {
    const query = this.materialSearchQuery.toLowerCase();
    const materials = this.materialService.materials();
    if (!query) return materials;
    return materials.filter(m => m.name.toLowerCase().includes(query));
  }

  performMaterialSearch() {
    // Filtering done in getFilteredMaterials
  }

  openAddMaterialForm() {
    this.editingMaterial.set(null);
    this.materialForm = { name: '', slug: '', description: '', is_active: true };
    this.showMaterialForm.set(true);
  }

  cancelMaterialForm() {
    this.showMaterialForm.set(false);
    this.editingMaterial.set(null);
    this.materialForm = {};
  }

  editMaterial(material: Material) {
    this.editingMaterial.set(material);
    this.materialForm = { ...material };
    this.showMaterialForm.set(true);
  }

  async saveMaterial() {
    if (!this.materialForm.name || !this.materialForm.slug) {
      this.showError('Please fill in required fields');
      return;
    }

    try {
      const isUpdate = !!this.editingMaterial();
      this.loaderService.show(isUpdate ? 'Updating material...' : 'Creating material...', true);

      if (isUpdate) {
        await this.materialService.updateMaterial(this.editingMaterial()!.id, this.materialForm);
        this.showSuccess('Material updated successfully');
      } else {
        await this.materialService.createMaterial(this.materialForm);
        this.showSuccess('Material created successfully');
      }

      this.cancelMaterialForm();
      this.loaderService.complete();
    } catch (error: any) {
      this.loaderService.hide();
      this.showError(error.message || 'Error saving material');
    }
  }

  async deleteMaterial(id: string) {
    if (confirm('Are you sure you want to delete this material?')) {
      try {
        this.loaderService.show('Deleting material...', true);
        await this.materialService.deleteMaterial(id);
        this.showSuccess('Material deleted successfully');
        this.loaderService.complete();
      } catch (error: any) {
        this.loaderService.hide();
        this.showError(error.message || 'Error deleting material');
      }
    }
  }

  onMaterialImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.materialForm.image = e.target?.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  // Collections Methods
  getFilteredCollections(): Collection[] {
    const query = this.collectionSearchQuery.toLowerCase();
    const collections = this.collectionService.collections();
    if (!query) return collections;
    return collections.filter(c => c.name.toLowerCase().includes(query));
  }

  performCollectionSearch() {
    // Filtering done in getFilteredCollections
  }

  openAddCollectionForm() {
    this.editingCollection.set(null);
    this.collectionForm = { name: '', slug: '', description: '', is_active: true };
    this.showCollectionForm.set(true);
  }

  cancelCollectionForm() {
    this.showCollectionForm.set(false);
    this.editingCollection.set(null);
    this.collectionForm = {};
  }

  editCollection(collection: Collection) {
    this.editingCollection.set(collection);
    this.collectionForm = { ...collection };
    this.showCollectionForm.set(true);
  }

  async saveCollection() {
    if (!this.collectionForm.name || !this.collectionForm.slug) {
      this.showError('Please fill in required fields');
      return;
    }

    try {
      const isUpdate = !!this.editingCollection();
      this.loaderService.show(isUpdate ? 'Updating collection...' : 'Creating collection...', true);

      if (isUpdate) {
        await this.collectionService.updateCollection(this.editingCollection()!.id, this.collectionForm);
        this.showSuccess('Collection updated successfully');
      } else {
        await this.collectionService.createCollection(this.collectionForm);
        this.showSuccess('Collection created successfully');
      }

      this.cancelCollectionForm();
      this.loaderService.complete();
    } catch (error: any) {
      this.loaderService.hide();
      this.showError(error.message || 'Error saving collection');
    }
  }

  async deleteCollection(id: string) {
    if (confirm('Are you sure you want to delete this collection?')) {
      try {
        this.loaderService.show('Deleting collection...', true);
        await this.collectionService.deleteCollection(id);
        this.showSuccess('Collection deleted successfully');
        this.loaderService.complete();
      } catch (error: any) {
        this.loaderService.hide();
        this.showError(error.message || 'Error deleting collection');
      }
    }
  }

  onCollectionImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.collectionForm.image = e.target?.result as string;
        this.cdr.markForCheck();
      };
      reader.readAsDataURL(file);
    }
  }

  // Product Flags Methods
  getFilteredProductsWithFlags(): ProductWithFlags[] {
    const query = this.productFlagsSearchQuery.toLowerCase();
    const products = this.productFlagsService.productsWithFlags();
    if (!query) return products;
    return products.filter(p => p.name.toLowerCase().includes(query));
  }

  performProductFlagsSearch() {
    // Filtering done in getFilteredProductsWithFlags
  }

  async toggleProductFlag(productId: string, flagName: 'is_trending' | 'is_new_arrival' | 'is_best_seller' | 'is_featured', value: boolean) {
    try {
      this.loaderService.show('Updating product flag...', true);
      await this.productFlagsService.toggleFlag(productId, flagName, value);
      this.showSuccess('Product flag updated');
      this.loaderService.complete();
    } catch (error: any) {
      this.loaderService.hide();
      this.showError(error.message || 'Error updating product flag');
    }
  }

  // Utility Methods
  showError(message: string) {
    this.errorMessage.set(message);
  }

  showSuccess(message: string) {
    this.successMessage.set(message);
    setTimeout(() => this.clearSuccess(), 3000);
  }

  clearError() {
    this.errorMessage.set('');
  }

  clearSuccess() {
    this.successMessage.set('');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
