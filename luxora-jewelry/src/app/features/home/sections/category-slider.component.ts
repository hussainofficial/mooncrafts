import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-slider',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-12 md:py-16 px-4 lg:px-8 bg-white">
      <div class="w-full max-w-7xl mx-auto">
        <!-- Title -->
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900">Shop by Category</h2>
          <a href="#" class="text-rose-500 hover:text-rose-600 font-semibold text-base">View All →</a>
        </div>

        <!-- Horizontal Scroll Categories -->
        <div class="overflow-x-auto pb-4">
          <div class="flex gap-4 min-w-full">
            <div
              *ngFor="let category of categories"
              (click)="onCategoryClick(category)"
              class="flex-shrink-0 w-32 md:w-40 cursor-pointer group"
            >
              <div class="relative overflow-hidden rounded-2xl aspect-square bg-gray-100">
                <img
                  [src]="category.image"
                  [alt]="category.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div class="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <div class="text-center text-white">
                    <p class="font-semibold text-sm">{{ category.name }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host ::ng-deep .overflow-x-auto {
      scrollbar-width: thin;
      scrollbar-color: #d1d5db #f3f4f6;
    }
    :host ::ng-deep .overflow-x-auto::-webkit-scrollbar {
      height: 6px;
    }
    :host ::ng-deep .overflow-x-auto::-webkit-scrollbar-track {
      background: #f3f4f6;
    }
    :host ::ng-deep .overflow-x-auto::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 3px;
    }
  `]
})
export class CategorySliderComponent implements OnInit {
  categories: Category[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.categories = this.mockDataService.getCategories();
  }

  onCategoryClick(category: Category) {
    // TODO: Implement smooth scroll to category section
    console.log('Category clicked:', category.slug);
  }
}
