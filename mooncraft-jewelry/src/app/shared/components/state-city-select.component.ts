import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocationService, State, City } from '../../core/services/location.service';

@Component({
  selector: 'app-state-city-select',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full space-y-4">
      <!-- State Dropdown -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ stateLabel }}
        </label>
        <select
          [(ngModel)]="selectedStateId"
          (change)="onStateChange()"
          class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition"
          [class.border-red-500]="showError && !selectedStateId"
        >
          <option value="">{{ statePlaceholder }}</option>
          <option *ngFor="let state of locationService.getStates()" [value]="state.id">
            {{ state.name }}
          </option>
        </select>
        <p *ngIf="showError && !selectedStateId" class="text-red-500 text-xs mt-1">
          {{ stateLabel }} is required
        </p>
      </div>

      <!-- City Dropdown -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ cityLabel }}
        </label>
        <select
          [(ngModel)]="selectedCityId"
          (change)="onCityChange()"
          [disabled]="!selectedStateId || isLoadingCities"
          class="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-pink-500 transition disabled:bg-gray-100 disabled:text-gray-500"
          [class.border-red-500]="showError && !selectedCityId"
          [class.border-gray-200]="!selectedStateId"
        >
          <option value="">
            {{ !selectedStateId ? '-- Select State First --' : isLoadingCities ? 'Loading...' : cityPlaceholder }}
          </option>
          <option *ngFor="let city of cities" [value]="city.id">
            {{ city.name }}
          </option>
        </select>
        <p *ngIf="showError && !selectedCityId" class="text-red-500 text-xs mt-1">
          {{ cityLabel }} is required
        </p>
        <p *ngIf="selectedStateId && cities.length === 0 && !isLoadingCities" class="text-orange-500 text-xs mt-1">
          No cities available for selected state
        </p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class StateCitySelectComponent implements OnInit {
  @Input() selectedStateId: number | null = null;
  @Input() selectedCityId: number | null = null;
  @Input() stateLabel = 'State';
  @Input() cityLabel = 'City';
  @Input() statePlaceholder = '-- Select State --';
  @Input() cityPlaceholder = '-- Select City --';
  @Input() showError = false;

  @Output() stateSelected = new EventEmitter<number>();
  @Output() citySelected = new EventEmitter<number>();
  @Output() citiesLoaded = new EventEmitter<City[]>();

  cities: City[] = [];
  isLoadingCities = false;

  constructor(public locationService: LocationService) {}

  ngOnInit() {
    if (this.selectedStateId) {
      this.loadCities(this.selectedStateId);
    }
  }

  onStateChange() {
    if (this.selectedStateId) {
      this.stateSelected.emit(this.selectedStateId);
      this.selectedCityId = null; // Reset city when state changes
      this.loadCities(this.selectedStateId);
    }
  }

  loadCities(stateId: number) {
    this.isLoadingCities = true;
    this.cities = [];

    this.locationService.getCitiesByStateId(stateId).subscribe({
      next: (response) => {
        if (response.success) {
          this.cities = response.data;
          this.citiesLoaded.emit(this.cities);
        }
        this.isLoadingCities = false;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.isLoadingCities = false;
      }
    });
  }

  onCityChange() {
    if (this.selectedCityId) {
      this.citySelected.emit(this.selectedCityId);
    }
  }

  // Public method to get selected values
  getSelectedValues() {
    return {
      stateId: this.selectedStateId,
      cityId: this.selectedCityId
    };
  }

  // Public method to set values programmatically
  setSelectedValues(stateId: number, cityId: number) {
    this.selectedStateId = stateId;
    this.selectedCityId = cityId;
    if (stateId) {
      this.loadCities(stateId);
    }
  }

  // Public method to reset
  reset() {
    this.selectedStateId = null;
    this.selectedCityId = null;
    this.cities = [];
  }
}
