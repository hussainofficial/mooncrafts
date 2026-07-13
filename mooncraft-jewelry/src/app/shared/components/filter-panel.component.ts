import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterService } from '../../core/services/filter.service';
import { FilterGroupComponent } from './filter-group.component';
import { Product } from '../../core/models';

@Component({
  selector: 'app-filter-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterGroupComponent],
  template: `
    <!-- Desktop Sidebar -->
    <div class="hidden lg:block">
      <div class="w-80 bg-white p-6 border-r border-gray-200 sticky top-20 max-h-screen overflow-y-auto">
        <!-- Filter Header -->
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold text-gray-900">Filters</h2>
          <button (click)="clearAllFilters()" class="text-rose-500 hover:text-rose-600 text-sm font-semibold">
            Clear All
          </button>
        </div>

        <!-- Search Filter -->
        <div class="mb-6 pb-6 border-b">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search products..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-500">
        </div>

        <!-- Filter Groups -->
        <ng-container *ngFor="let group of filterGroups">
          <app-filter-group
            [group]="group"
            [selectedFilters]="getSelectedFilters(group.id)"
            (filterChange)="onFilterChange(group.id, $event)">
          </app-filter-group>
        </ng-container>
      </div>
    </div>

    <!-- Mobile Filter Drawer -->
    <div class="lg:hidden">
      <!-- Filter Button -->
      <div class="sticky top-16 bg-white border-b p-4 z-30">
        <button
          (click)="openMobileFilter()"
          class="w-full px-4 py-2 bg-rose-500 text-white rounded-lg font-semibold hover:bg-rose-600 transition-colors">
          🔍 Filters
        </button>
      </div>

      <!-- Mobile Filter Drawer -->
      <div *ngIf="showMobileFilter()" class="fixed inset-0 bg-black/50 z-40" (click)="closeMobileFilter()"></div>
      <div
        class="fixed right-0 top-0 h-screen w-full max-w-sm bg-white z-50 transition-transform duration-300 overflow-y-auto"
        [class.translate-x-full]="!showMobileFilter()">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">Filters</h2>
          <button (click)="closeMobileFilter()" class="p-2 hover:bg-gray-100 rounded-lg">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Search -->
        <div class="p-4 border-b">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearchChange($event)"
            placeholder="Search products..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-500">
        </div>

        <!-- Filter Groups -->
        <div class="p-4">
          <ng-container *ngFor="let group of filterGroups">
            <app-filter-group
              [group]="group"
              [selectedFilters]="getSelectedFilters(group.id)"
              (filterChange)="onFilterChange(group.id, $event)">
            </app-filter-group>
          </ng-container>
        </div>

        <!-- Footer Buttons -->
        <div class="sticky bottom-0 bg-white border-t p-4 space-y-3">
          <button
            (click)="applyFilters()"
            class="w-full px-4 py-3 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition-colors">
            Apply Filters
          </button>
          <button
            (click)="clearAndClose()"
            class="w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
            Clear All
          </button>
        </div>
      </div>
    </div>
  `,
})
export class FilterPanelComponent implements OnInit {
  @Input() products: Product[] = [];

  searchQuery = '';
  showMobileFilter = signal(false);

  filterGroups: any[] = [
    {
      id: 'categories',
      label: 'Categories',
      type: 'checkbox',
      options: [] as string[],
    },
    {
      id: 'brands',
      label: 'Brands',
      type: 'checkbox',
      options: [] as string[],
    },
    {
      id: 'priceRange',
      label: 'Price Range',
      type: 'slider',
      min: 0,
      max: 10000,
      step: 100,
      options: [],
    },
    {
      id: 'colors',
      label: 'Colors',
      type: 'color',
      options: [] as string[],
    },
    {
      id: 'sizes',
      label: 'Sizes',
      type: 'chip',
      options: [] as string[],
    },
    {
      id: 'rating',
      label: 'Rating',
      type: 'rating',
      options: ['4★ & up', '3★ & up', '2★ & up', '1★ & up'],
    },
    {
      id: 'discount',
      label: 'Discount',
      type: 'checkbox',
      options: ['10% or more', '20% or more', '30% or more', '50% or more'],
    },
    {
      id: 'availability',
      label: 'Availability',
      type: 'checkbox',
      options: ['In Stock', 'Out of Stock'],
    },
  ];

  constructor(public filterService: FilterService) {}

  ngOnInit() {
    this.filterService.setAllProducts(this.products);
    this.loadFilterOptions();
  }

  loadFilterOptions() {
    // Load dynamic options
    this.filterGroups = this.filterGroups.map(group => {
      if (group.id === 'categories') {
        return { ...group, options: this.filterService.getAvailableCategories() };
      } else if (group.id === 'brands') {
        return { ...group, options: this.filterService.getAvailableBrands() };
      } else if (group.id === 'colors') {
        return { ...group, options: this.filterService.getAvailableColors() };
      } else if (group.id === 'sizes') {
        return { ...group, options: this.filterService.getAvailableSizes() };
      } else if (group.id === 'priceRange') {
        const [min, max] = this.filterService.getPriceRange();
        return { ...group, min, max };
      }
      return group;
    });
  }

  getSelectedFilters(groupId: string): any {
    const state = this.filterService.filterState();
    switch (groupId) {
      case 'categories':
        return state.categories;
      case 'brands':
        return state.brands;
      case 'colors':
        return state.colors;
      case 'sizes':
        return state.sizes;
      case 'priceRange':
        return state.priceRange;
      case 'rating':
        return state.rating;
      case 'discount':
        return state.discount;
      case 'availability':
        return state.availability;
      default:
        return [];
    }
  }

  onFilterChange(groupId: string, value: any) {
    switch (groupId) {
      case 'categories':
        this.filterService.updateCategories(value);
        break;
      case 'brands':
        this.filterService.updateBrands(value);
        break;
      case 'colors':
        this.filterService.updateColors(value);
        break;
      case 'sizes':
        this.filterService.updateSizes(value);
        break;
      case 'priceRange':
        this.filterService.updatePriceRange(value);
        break;
      case 'rating':
        this.filterService.updateRating(value);
        break;
      case 'discount':
        this.filterService.updateDiscount(value);
        break;
      case 'availability':
        this.filterService.updateAvailability(value);
        break;
    }
  }

  onSearchChange(query: string) {
    this.filterService.updateSearch(query);
  }

  clearAllFilters() {
    this.filterService.clearAllFilters();
    this.searchQuery = '';
  }

  openMobileFilter() {
    this.showMobileFilter.set(true);
  }

  closeMobileFilter() {
    this.showMobileFilter.set(false);
  }

  applyFilters() {
    this.closeMobileFilter();
  }

  clearAndClose() {
    this.clearAllFilters();
    this.closeMobileFilter();
  }
}
