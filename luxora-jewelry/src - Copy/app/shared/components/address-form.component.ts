import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService, State } from '../../core/services/location.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 class="text-2xl font-bold mb-6 text-gray-900">Add Address</h2>

      <form (ngSubmit)="saveAddress()" class="space-y-6">
        <!-- Street Address -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
          <input
            type="text"
            [(ngModel)]="formData.streetAddress"
            name="streetAddress"
            placeholder="123 Main Street"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            required>
        </div>

        <!-- State Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">State *</label>
          <select
            [(ngModel)]="selectedStateId"
            name="state"
            (change)="onStateChange()"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            required>
            <option value="">-- Select State --</option>
            <option *ngFor="let state of locationService.getStates()" [value]="state.id">
              {{ state.name }}
            </option>
          </select>
        </div>

        <!-- City Selection -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">City *</label>
          <select
            [(ngModel)]="formData.city"
            name="city"
            [disabled]="cities().length === 0"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100"
            required>
            <option value="">
              {{ cities().length === 0 ? '-- Select State First --' : '-- Select City --' }}
            </option>
            <option *ngFor="let city of cities()" [value]="city">
              {{ city }}
            </option>
          </select>
        </div>

        <!-- City Search (Alternative to dropdown) -->
        <div *ngIf="showCitySearch">
          <label class="block text-sm font-semibold text-gray-700 mb-2">City Search</label>
          <input
            type="text"
            [(ngModel)]="citySearchQuery"
            (input)="searchCities()"
            name="citySearch"
            placeholder="Search city..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">

          <!-- Search Results -->
          <div *ngIf="searchResults().length > 0" class="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
            <button
              *ngFor="let result of searchResults()"
              type="button"
              (click)="selectSearchResult(result)"
              class="w-full text-left px-4 py-2 hover:bg-rose-50 border-b border-gray-200 last:border-b-0">
              <span class="font-medium">{{ result.city }}</span>
              <span class="text-gray-500 text-sm ml-2">({{ result.state }})</span>
            </button>
          </div>
        </div>

        <!-- Postal Code -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Postal Code *</label>
          <input
            type="text"
            [(ngModel)]="formData.postalCode"
            name="postalCode"
            placeholder="123456"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            required>
        </div>

        <!-- Phone -->
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
          <input
            type="tel"
            [(ngModel)]="formData.phone"
            name="phone"
            placeholder="+91 98765 43210"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
            required>
        </div>

        <!-- Error -->
        <div *ngIf="error()" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {{ error() }}
        </div>

        <!-- Buttons -->
        <div class="flex gap-4">
          <button
            type="submit"
            [disabled]="isLoading()"
            class="flex-1 bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 disabled:bg-gray-400">
            {{ isLoading() ? 'Saving...' : 'Save Address' }}
          </button>
          <button
            type="button"
            (click)="toggleCitySearch()"
            class="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">
            {{ showCitySearch ? 'Use Dropdown' : 'Search City' }}
          </button>
        </div>
      </form>

      <!-- Info -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
        <p class="font-semibold mb-2">✨ Features:</p>
        <ul class="list-disc list-inside space-y-1">
          <li>Select state from dropdown or search</li>
          <li>Cities auto-populate based on state</li>
          <li>Search cities by name</li>
          <li>All 36 Indian states/territories supported</li>
        </ul>
      </div>
    </div>
  `,
})
export class AddressFormComponent implements OnInit {
  locationService = inject(LocationService);
  loaderService = inject(LoaderService);

  formData = {
    streetAddress: '',
    city: '',
    postalCode: '',
    phone: '',
  };

  selectedStateId: number | null = null;
  cities = signal<any[]>([]);
  citySearchQuery = '';
  searchResults = signal<any[]>([]);
  showCitySearch = false;
  error = signal('');
  isLoading = signal(false);

  ngOnInit() {
    // States are already loaded in LocationService
  }

  onStateChange() {
    if (this.selectedStateId) {
      this.loaderService.show('Loading cities...');
      this.locationService.getCitiesByStateId(this.selectedStateId).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.cities.set(response.data);
          }
          this.loaderService.hide();
        },
        error: (err: any) => {
          this.error.set('Failed to load cities');
          this.loaderService.hide();
        }
      });
    } else {
      this.cities.set([]);
    }
  }

  async searchCities() {
    if (this.citySearchQuery.length < 2) {
      this.searchResults.set([]);
      return;
    }

    try {
      const results = await this.locationService.searchCities(this.citySearchQuery);
      this.searchResults.set(results);
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  selectSearchResult(result: any) {
    this.formData.city = result.name;
    this.selectedStateId = result.state_id;
    this.searchResults.set([]);
    this.citySearchQuery = '';
    this.onStateChange();
  }

  toggleCitySearch() {
    this.showCitySearch = !this.showCitySearch;
    this.searchResults.set([]);
    this.citySearchQuery = '';
  }

  saveAddress() {
    this.error.set('');

    if (!this.formData.streetAddress || !this.selectedStateId || !this.formData.city || !this.formData.postalCode || !this.formData.phone) {
      this.error.set('Please fill all fields');
      return;
    }

    this.isLoading.set(true);
    this.loaderService.show('Saving address...');

    // Simulate API call
    setTimeout(() => {
      console.log('Address saved:', {
        ...this.formData,
        stateId: this.selectedStateId,
      });

      this.loaderService.hide();
      this.isLoading.set(false);
      alert('✅ Address saved successfully!');
    }, 1000);
  }
}
