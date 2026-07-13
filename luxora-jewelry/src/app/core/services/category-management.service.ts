import { Injectable, signal } from '@angular/core';

export interface MenuCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  type: 'material' | 'type' | 'collection'; // material, type, or collection
  order: number;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryManagementService {
  private readonly CATEGORIES_STORAGE_KEY = 'luxora_menu_categories';

  categories = signal<MenuCategory[]>([
    // Default Material Categories
    { id: 'mat-1', name: 'Silver Jewelry', slug: 'silver-jewelry', type: 'material', order: 1 },
    { id: 'mat-2', name: 'Kundan Jewelry', slug: 'kundan-jewelry', type: 'material', order: 2 },
    { id: 'mat-3', name: 'Artificial Jewelry', slug: 'artificial-jewelry', type: 'material', order: 3 },

    // Default Type Categories
    { id: 'type-1', name: 'Necklaces', slug: 'necklaces', type: 'type', order: 4 },
    { id: 'type-2', name: 'Earrings', slug: 'earrings', type: 'type', order: 5 },
    { id: 'type-3', name: 'Rings', slug: 'rings', type: 'type', order: 6 },
    { id: 'type-4', name: 'Bracelets', slug: 'bracelets', type: 'type', order: 7 },
    { id: 'type-5', name: 'Anklets', slug: 'anklets', type: 'type', order: 8 },
  ]);

  constructor() {
    this.loadCategories();
  }

  private loadCategories() {
    try {
      const saved = localStorage.getItem(this.CATEGORIES_STORAGE_KEY);
      if (saved) {
        this.categories.set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load categories:', e);
    }
  }

  private saveCategories() {
    localStorage.setItem(this.CATEGORIES_STORAGE_KEY, JSON.stringify(this.categories()));
  }

  addCategory(category: MenuCategory) {
    const updated = [...this.categories(), category];
    this.categories.set(updated);
    this.saveCategories();
  }

  updateCategory(id: string, updates: Partial<MenuCategory>) {
    const updated = this.categories().map(cat =>
      cat.id === id ? { ...cat, ...updates } : cat
    );
    this.categories.set(updated);
    this.saveCategories();
  }

  removeCategory(id: string) {
    const updated = this.categories().filter(cat => cat.id !== id);
    this.categories.set(updated);
    this.saveCategories();
  }

  getCategories(): MenuCategory[] {
    return this.categories();
  }

  getCategoriesByType(type: 'material' | 'type' | 'collection'): MenuCategory[] {
    return this.categories()
      .filter(cat => cat.type === type)
      .sort((a, b) => a.order - b.order);
  }

  resetToDefaults() {
    const defaults: MenuCategory[] = [
      { id: 'mat-1', name: 'Silver Jewelry', slug: 'silver-jewelry', type: 'material', order: 1 },
      { id: 'mat-2', name: 'Kundan Jewelry', slug: 'kundan-jewelry', type: 'material', order: 2 },
      { id: 'mat-3', name: 'Artificial Jewelry', slug: 'artificial-jewelry', type: 'material', order: 3 },
      { id: 'type-1', name: 'Necklaces', slug: 'necklaces', type: 'type', order: 4 },
      { id: 'type-2', name: 'Earrings', slug: 'earrings', type: 'type', order: 5 },
      { id: 'type-3', name: 'Rings', slug: 'rings', type: 'type', order: 6 },
      { id: 'type-4', name: 'Bracelets', slug: 'bracelets', type: 'type', order: 7 },
      { id: 'type-5', name: 'Anklets', slug: 'anklets', type: 'type', order: 8 },
    ];
    this.categories.set(defaults);
    this.saveCategories();
  }
}
