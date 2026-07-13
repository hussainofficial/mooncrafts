import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryManagementService, MenuCategory } from '../../core/services/category-management.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Menu Categories</h2>
          <p class="text-gray-600 mt-1">Manage product categories for the Products mega menu</p>
        </div>
        <button
          (click)="openAddForm()"
          class="px-6 py-2 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors">
          + Add Category
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showForm()" class="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h3 class="text-lg font-bold text-gray-900 mb-4">
          {{ editingId() ? 'Edit Category' : 'Add New Category' }}
        </h3>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <!-- Name Input -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Name</label>
            <input
              type="text"
              [(ngModel)]="formData.name"
              placeholder="e.g., Gold Jewelry"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
          </div>

          <!-- Slug Input -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Slug (URL)</label>
            <input
              type="text"
              [(ngModel)]="formData.slug"
              placeholder="e.g., gold-jewelry"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
          </div>

          <!-- Type Select -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Type</label>
            <select
              [(ngModel)]="formData.type"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
              <option value="material">Material</option>
              <option value="type">Type</option>
              <option value="collection">Collection</option>
            </select>
          </div>

          <!-- Order Input -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Display Order</label>
            <input
              type="number"
              [(ngModel)]="formData.order"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
          </div>
        </div>

        <!-- Form Actions -->
        <div class="flex gap-2">
          <button
            (click)="saveCategory()"
            class="px-6 py-2 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors">
            {{ editingId() ? 'Update' : 'Add' }}
          </button>
          <button
            (click)="cancelEdit()"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>

      <!-- Categories List -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Material Categories -->
        <div class="border-b">
          <div class="bg-gray-50 p-4 border-b">
            <h4 class="font-bold text-gray-900">By Material</h4>
          </div>
          <div class="divide-y">
            <div *ngFor="let cat of getMaterialCategories()" class="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p class="font-semibold text-gray-900">{{ cat.name }}</p>
                <p class="text-sm text-gray-600">{{ cat.slug }}</p>
              </div>
              <div class="flex gap-2">
                <button
                  (click)="editCategory(cat)"
                  class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors">
                  Edit
                </button>
                <button
                  (click)="deleteCategory(cat.id)"
                  class="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Type Categories -->
        <div class="border-b">
          <div class="bg-gray-50 p-4 border-b">
            <h4 class="font-bold text-gray-900">By Type</h4>
          </div>
          <div class="divide-y">
            <div *ngFor="let cat of getTypeCategories()" class="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p class="font-semibold text-gray-900">{{ cat.name }}</p>
                <p class="text-sm text-gray-600">{{ cat.slug }}</p>
              </div>
              <div class="flex gap-2">
                <button
                  (click)="editCategory(cat)"
                  class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors">
                  Edit
                </button>
                <button
                  (click)="deleteCategory(cat.id)"
                  class="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Collection Categories -->
        <div *ngIf="getCollectionCategories().length > 0">
          <div class="bg-gray-50 p-4 border-b">
            <h4 class="font-bold text-gray-900">Collections</h4>
          </div>
          <div class="divide-y">
            <div *ngFor="let cat of getCollectionCategories()" class="p-4 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p class="font-semibold text-gray-900">{{ cat.name }}</p>
                <p class="text-sm text-gray-600">{{ cat.slug }}</p>
              </div>
              <div class="flex gap-2">
                <button
                  (click)="editCategory(cat)"
                  class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold hover:bg-blue-200 transition-colors">
                  Edit
                </button>
                <button
                  (click)="deleteCategory(cat.id)"
                  class="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Reset Button -->
      <div class="flex gap-2">
        <button
          (click)="resetToDefaults()"
          class="px-6 py-2 border border-yellow-300 text-yellow-700 rounded-lg font-semibold hover:bg-yellow-50 transition-colors">
          Reset to Defaults
        </button>
      </div>
    </div>
  `,
})
export class CategoryManagementComponent implements OnInit {
  showForm = signal(false);
  editingId = signal<string | null>(null);

  formData = {
    id: '',
    name: '',
    slug: '',
    type: 'material' as 'material' | 'type' | 'collection',
    order: 0,
  };

  constructor(public categoryService: CategoryManagementService) {}

  ngOnInit() {
    // Categories are loaded from service
  }

  openAddForm() {
    this.editingId.set(null);
    this.formData = {
      id: 'cat-' + Date.now(),
      name: '',
      slug: '',
      type: 'material',
      order: this.categoryService.getCategories().length + 1,
    };
    this.showForm.set(true);
  }

  editCategory(category: MenuCategory) {
    this.editingId.set(category.id);
    this.formData = { ...category };
    this.showForm.set(true);
  }

  saveCategory() {
    if (!this.formData.name.trim() || !this.formData.slug.trim()) {
      alert('Please fill in all fields');
      return;
    }

    const category: MenuCategory = {
      id: this.formData.id,
      name: this.formData.name,
      slug: this.formData.slug,
      type: this.formData.type,
      order: this.formData.order,
    };

    if (this.editingId()) {
      this.categoryService.updateCategory(this.editingId()!, category);
    } else {
      this.categoryService.addCategory(category);
    }

    this.cancelEdit();
  }

  deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.removeCategory(id);
    }
  }

  cancelEdit() {
    this.showForm.set(false);
    this.editingId.set(null);
    this.formData = {
      id: '',
      name: '',
      slug: '',
      type: 'material',
      order: 0,
    };
  }

  getMaterialCategories() {
    return this.categoryService.getCategoriesByType('material');
  }

  getTypeCategories() {
    return this.categoryService.getCategoriesByType('type');
  }

  getCollectionCategories() {
    return this.categoryService.getCategoriesByType('collection');
  }

  resetToDefaults() {
    if (confirm('Reset all categories to defaults? This cannot be undone.')) {
      this.categoryService.resetToDefaults();
    }
  }
}
