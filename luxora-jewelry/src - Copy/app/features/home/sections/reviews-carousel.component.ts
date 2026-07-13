import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Review } from '../../../core/models';

@Component({
  selector: 'app-reviews-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-12 md:py-16 px-4 bg-gradient-to-b from-white to-rose-50">
      <div class="max-w-7xl mx-auto">
        <!-- Title -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-2">What Our Customers Say</h2>
          <p class="text-gray-600">Join thousands of happy customers</p>
        </div>

        <!-- Reviews Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let review of reviews" class="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <!-- Star Rating -->
            <div class="flex gap-1 mb-4">
              <span *ngFor="let i of [1,2,3,4,5]" class="text-lg">
                <span *ngIf="i <= review.rating" class="text-yellow-400">★</span>
                <span *ngIf="i > review.rating" class="text-gray-300">★</span>
              </span>
            </div>

            <!-- Review Text -->
            <p class="text-gray-700 mb-6 italic">
              "{{ review.text }}"
            </p>

            <!-- Author -->
            <div class="flex items-center gap-4">
              <img
                *ngIf="review.image"
                [src]="review.image"
                [alt]="review.author"
                class="w-12 h-12 rounded-full object-cover"
              />
              <div class="flex-1">
                <p class="font-semibold text-gray-900">{{ review.author }}</p>
                <p class="text-sm text-gray-600">{{ review.date }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- View More -->
        <div class="text-center mt-10">
          <button class="text-rose-500 hover:text-rose-600 font-semibold">
            View More Reviews →
          </button>
        </div>
      </div>
    </section>
  `,
})
export class ReviewsCarouselComponent implements OnInit {
  reviews: Review[] = [];

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.reviews = this.mockDataService.getReviews();
  }
}
