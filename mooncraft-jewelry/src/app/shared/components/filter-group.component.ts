import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filter-group',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="mb-6 pb-6 border-b last:border-b-0">
      <!-- Header -->
      <button
        (click)="toggleExpand()"
        class="w-full flex items-center justify-between py-2 hover:text-rose-500 transition-colors">
        <h3 class="font-bold text-gray-900">{{ group.label }}</h3>
        <svg
          class="w-5 h-5 transition-transform duration-300"
          [class.-rotate-180]="!isExpanded()"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </button>

      <!-- Content -->
      <div *ngIf="isExpanded()" class="mt-4 space-y-3">
        <!-- Checkbox Type -->
        <div *ngIf="group.type === 'checkbox'" class="space-y-2">
          <label *ngFor="let option of group.options" class="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              [checked]="isOptionSelected(option)"
              (change)="toggleCheckbox(option)"
              class="w-4 h-4 rounded border-gray-300 text-rose-500 cursor-pointer">
            <span class="text-sm text-gray-700">{{ option }}</span>
          </label>
        </div>

        <!-- Color Type -->
        <div *ngIf="group.type === 'color'" class="flex flex-wrap gap-3">
          <button
            *ngFor="let color of group.options"
            (click)="toggleColor(color)"
            class="w-8 h-8 rounded-full border-2 transition-all"
            [style.backgroundColor]="getColorValue(color)"
            [class.border-gray-400]="!isOptionSelected(color)"
            [class.border-rose-500]="isOptionSelected(color)"
            [class.ring-2]="isOptionSelected(color)"
            [class.ring-rose-300]="isOptionSelected(color)"
            [title]="color">
          </button>
        </div>

        <!-- Chip Type -->
        <div *ngIf="group.type === 'chip'" class="flex flex-wrap gap-2">
          <button
            *ngFor="let option of group.options"
            (click)="toggleChip(option)"
            [class.bg-rose-500]="isOptionSelected(option)"
            [class.text-white]="isOptionSelected(option)"
            [class.bg-gray-100]="!isOptionSelected(option)"
            [class.text-gray-700]="!isOptionSelected(option)"
            class="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:shadow-md">
            {{ option }}
          </button>
        </div>

        <!-- Rating Type -->
        <div *ngIf="group.type === 'rating'" class="space-y-2">
          <label *ngFor="let option of group.options" class="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              [name]="group.id"
              [checked]="selectedRating() === parseInt(option[0])"
              (change)="updateRating(parseInt(option[0]))"
              class="w-4 h-4 text-rose-500 cursor-pointer">
            <div class="flex items-center gap-1">
              <span *ngFor="let i of [1,2,3,4,5]" class="text-lg">
                <span *ngIf="i <= parseInt(option[0])" class="text-yellow-400">★</span>
                <span *ngIf="i > parseInt(option[0])" class="text-gray-300">★</span>
              </span>
              <span class="text-sm text-gray-600 ml-1">{{ option }}</span>
            </div>
          </label>
        </div>

        <!-- Slider Type -->
        <div *ngIf="group.type === 'slider'" class="space-y-4">
          <div class="flex gap-2">
            <div class="flex-1">
              <label class="text-xs text-gray-600">Min</label>
              <input
                type="number"
                [value]="priceRange()[0]"
                (change)="updatePriceMin($event)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-500">
            </div>
            <div class="flex-1">
              <label class="text-xs text-gray-600">Max</label>
              <input
                type="number"
                [value]="priceRange()[1]"
                (change)="updatePriceMax($event)"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-rose-500">
            </div>
          </div>
          <div class="flex gap-4">
            <input
              type="range"
              [value]="priceRange()[0]"
              [min]="group.min"
              [max]="group.max"
              [step]="group.step"
              (change)="updatePriceMin($event)"
              class="flex-1">
            <input
              type="range"
              [value]="priceRange()[1]"
              [min]="group.min"
              [max]="group.max"
              [step]="group.step"
              (change)="updatePriceMax($event)"
              class="flex-1">
          </div>
        </div>
      </div>
    </div>
  `,
})
export class FilterGroupComponent {
  @Input() group: any;
  @Input() selectedFilters: any;
  @Output() filterChange = new EventEmitter<any>();

  isExpanded = signal(true);
  priceRange = signal<[number, number]>([0, 10000]);
  selectedRating = signal<number | null>(null);
  parseInt = parseInt;

  ngOnInit() {
    if (this.group.type === 'slider' && Array.isArray(this.selectedFilters) && this.selectedFilters.length === 2) {
      this.priceRange.set(this.selectedFilters as [number, number]);
    }
    if (this.group.type === 'rating') {
      this.selectedRating.set(this.selectedFilters);
    }
  }

  toggleExpand() {
    this.isExpanded.update(v => !v);
  }

  isOptionSelected(option: string): boolean {
    if (Array.isArray(this.selectedFilters)) {
      return this.selectedFilters.includes(option);
    }
    return false;
  }

  toggleCheckbox(option: string) {
    const selected = Array.isArray(this.selectedFilters) ? [...this.selectedFilters] : [];
    const index = selected.indexOf(option);
    if (index > -1) {
      selected.splice(index, 1);
    } else {
      selected.push(option);
    }
    this.filterChange.emit(selected);
  }

  toggleColor(color: string) {
    this.toggleCheckbox(color);
  }

  toggleChip(option: string) {
    this.toggleCheckbox(option);
  }

  updateRating(rating: number) {
    this.selectedRating.set(rating);
    this.filterChange.emit(rating);
  }

  updatePriceMin(event: any) {
    const value = parseInt(event.target.value);
    const current = this.priceRange();
    if (value < current[1]) {
      this.priceRange.set([value, current[1]]);
      this.filterChange.emit([value, current[1]]);
    }
  }

  updatePriceMax(event: any) {
    const value = parseInt(event.target.value);
    const current = this.priceRange();
    if (value > current[0]) {
      this.priceRange.set([current[0], value]);
      this.filterChange.emit([current[0], value]);
    }
  }

  getColorValue(colorName: string): string {
    const colorMap: { [key: string]: string } = {
      'Red': '#ef4444',
      'Blue': '#3b82f6',
      'Green': '#10b981',
      'Yellow': '#fbbf24',
      'Purple': '#8b5cf6',
      'Pink': '#ec4899',
      'Black': '#1f2937',
      'White': '#f3f4f6',
      'Gray': '#9ca3af',
      'Gold': '#d4af37',
      'Silver': '#c0c0c0',
      'Beige': '#f5f5dc',
    };
    return colorMap[colorName] || '#e5e7eb';
  }
}
