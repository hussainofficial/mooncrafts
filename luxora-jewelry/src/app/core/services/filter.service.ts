import { Injectable, signal } from '@angular/core';
import { Product } from '../models';

export interface FilterState {
  search: string;
  categories: string[];
  brands: string[];
  priceRange: [number, number];
  colors: string[];
  sizes: string[];
  rating: number | null;
  discount: number | null;
  availability: boolean | null;
  delivery: string[];
  sort: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  filterState = signal<FilterState>({
    search: '',
    categories: [],
    brands: [],
    priceRange: [0, 10000],
    colors: [],
    sizes: [],
    rating: null,
    discount: null,
    availability: null,
    delivery: [],
    sort: 'newest',
  });

  private allProducts: Product[] = [];

  constructor() {}

  setAllProducts(products: Product[]) {
    this.allProducts = products;
  }

  updateSearch(search: string) {
    this.filterState.update(state => ({ ...state, search }));
  }

  updateCategories(categories: string[]) {
    this.filterState.update(state => ({ ...state, categories }));
  }

  updateBrands(brands: string[]) {
    this.filterState.update(state => ({ ...state, brands }));
  }

  updatePriceRange(priceRange: [number, number]) {
    this.filterState.update(state => ({ ...state, priceRange }));
  }

  updateColors(colors: string[]) {
    this.filterState.update(state => ({ ...state, colors }));
  }

  updateSizes(sizes: string[]) {
    this.filterState.update(state => ({ ...state, sizes }));
  }

  updateRating(rating: number | null) {
    this.filterState.update(state => ({ ...state, rating }));
  }

  updateDiscount(discount: number | null) {
    this.filterState.update(state => ({ ...state, discount }));
  }

  updateAvailability(availability: boolean | null) {
    this.filterState.update(state => ({ ...state, availability }));
  }

  updateDelivery(delivery: string[]) {
    this.filterState.update(state => ({ ...state, delivery }));
  }

  updateSort(sort: string) {
    this.filterState.update(state => ({ ...state, sort }));
  }

  clearAllFilters() {
    this.filterState.set({
      search: '',
      categories: [],
      brands: [],
      priceRange: [0, 10000],
      colors: [],
      sizes: [],
      rating: null,
      discount: null,
      availability: null,
      delivery: [],
      sort: 'newest',
    });
  }

  getFilteredProducts(): Product[] {
    const state = this.filterState();
    let filtered = [...this.allProducts];

    // Search
    if (state.search.trim()) {
      const query = state.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    // Categories
    if (state.categories.length > 0) {
      filtered = filtered.filter(p => state.categories.includes(p.category));
    }

    // Brands (using material as brand for now)
    if (state.brands.length > 0) {
      filtered = filtered.filter(p => state.brands.includes(p.material));
    }

    // Price Range
    filtered = filtered.filter(p => p.price >= state.priceRange[0] && p.price <= state.priceRange[1]);

    // Colors
    if (state.colors.length > 0) {
      filtered = filtered.filter(p => p.colors && p.colors.some(c => state.colors.includes(c)));
    }

    // Sizes
    if (state.sizes.length > 0) {
      filtered = filtered.filter(p => p.sizes && p.sizes.some(s => state.sizes.includes(s)));
    }

    // Rating
    if (state.rating !== null) {
      filtered = filtered.filter(p => p.rating >= state.rating!);
    }

    // Discount
    if (state.discount !== null) {
      filtered = filtered.filter(p => (p.discount || 0) >= state.discount!);
    }

    // Availability
    if (state.availability !== null) {
      filtered = filtered.filter(p => p.inStock === state.availability);
    }

    // Sort
    filtered = this.sortProducts(filtered, state.sort);

    return filtered;
  }

  private sortProducts(products: Product[], sort: string): Product[] {
    const sorted = [...products];
    switch (sort) {
      case 'newest':
        return sorted.reverse();
      case 'trending':
        return sorted.sort((a, b) => (b.isTrending ? 1 : 0) - (a.isTrending ? 1 : 0));
      case 'bestSelling':
        return sorted.sort((a, b) => (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0));
      case 'popularity':
        return sorted.sort((a, b) => b.reviews - a.reviews);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'priceLowToHigh':
        return sorted.sort((a, b) => a.price - b.price);
      case 'priceHighToLow':
        return sorted.sort((a, b) => b.price - a.price);
      default:
        return sorted;
    }
  }

  getAvailableCategories(): string[] {
    return [...new Set(this.allProducts.map(p => p.category))];
  }

  getAvailableBrands(): string[] {
    return [...new Set(this.allProducts.map(p => p.material))];
  }

  getAvailableColors(): string[] {
    const colors = new Set<string>();
    this.allProducts.forEach(p => {
      if (p.colors) {
        p.colors.forEach(c => colors.add(c));
      }
    });
    return Array.from(colors);
  }

  getAvailableSizes(): string[] {
    const sizes = new Set<string>();
    this.allProducts.forEach(p => {
      if (p.sizes) {
        p.sizes.forEach(s => sizes.add(s));
      }
    });
    return Array.from(sizes);
  }

  getPriceRange(): [number, number] {
    const prices = this.allProducts.map(p => p.price);
    return [Math.min(...prices), Math.max(...prices)];
  }
}
