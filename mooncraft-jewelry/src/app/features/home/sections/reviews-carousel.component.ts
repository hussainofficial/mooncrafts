import { Component, OnInit, signal, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, PublicReview } from '../../../core/services/review.service';
import { environment } from '../../../../environments/environment';

const UPLOADS_BASE_URL = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
const SCROLL_LOAD_THRESHOLD_PX = 150;
const PAGE_SIZE = 10;

@Component({
  selector: 'app-reviews-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-12 md:py-16 px-4 bg-gradient-to-b from-white to-rose-50">
      <div class="max-w-7xl mx-auto">
        <!-- Title -->
        <div class="text-center mb-12">
          <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">What Our Customers Say</h2>
          <p class="text-gray-600">Join thousands of happy customers</p>
        </div>

        <!-- Loading state -->
        <div *ngIf="loading()" class="text-center py-8 text-gray-500">Loading reviews...</div>

        <!-- Empty state -->
        <div *ngIf="!loading() && reviews().length === 0" class="text-center py-8 text-gray-500">
          No reviews yet.
        </div>

        <!-- Collapsed: 3-card grid -->
        <div *ngIf="!loading() && !isExpanded() && reviews().length > 0" class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div *ngFor="let review of reviews().slice(0, 3)" class="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
            <ng-container *ngTemplateOutlet="reviewCard; context: { $implicit: review }"></ng-container>
          </div>
        </div>

        <!-- Expanded: horizontal scroll feed with infinite scroll -->
        <div
          *ngIf="isExpanded()"
          #scrollContainer
          (scroll)="onScroll()"
          class="flex gap-6 overflow-x-auto pb-4 scroll-smooth"
        >
          <div
            *ngFor="let review of reviews()"
            class="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow flex-shrink-0 w-80"
          >
            <ng-container *ngTemplateOutlet="reviewCard; context: { $implicit: review }"></ng-container>
          </div>
          <div *ngIf="loadingMore()" class="flex-shrink-0 w-40 flex items-center justify-center text-gray-400 text-sm">
            Loading more...
          </div>
        </div>

        <!-- Shared review card template -->
        <ng-template #reviewCard let-review>
          <div class="flex gap-1 mb-4">
            <span *ngFor="let i of [1, 2, 3, 4, 5]" class="text-lg">
              <span *ngIf="i <= review.rating" style="color: #fbbf24">★</span>
              <span *ngIf="i > review.rating" class="text-gray-300">★</span>
            </span>
          </div>

          <p class="text-gray-700 mb-6 italic">"{{ review.comment }}"</p>

          <div class="flex items-center gap-4">
            <img
              *ngIf="review.avatar_url"
              [src]="toAbsoluteUrl(review.avatar_url)"
              [alt]="review.customer_name"
              class="w-12 h-12 rounded-full object-cover"
            />
            <div
              *ngIf="!review.avatar_url"
              class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
              style="background-color: #ec4899"
            >
              {{ review.customer_name.charAt(0).toUpperCase() }}
            </div>
            <div class="flex-1">
              <p class="font-semibold text-gray-900">{{ review.customer_name }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(review.created_at) }}</p>
            </div>
          </div>
        </ng-template>

        <!-- View More -->
        <div *ngIf="!isExpanded() && reviews().length > 3" class="text-center mt-10">
          <button (click)="expand()" class="font-semibold hover:opacity-80 transition-opacity" style="color: #ec4899">
            View More Reviews →
          </button>
        </div>
      </div>
    </section>
  `,
})
export class ReviewsCarouselComponent implements OnInit {
  reviews = signal<PublicReview[]>([]);
  isExpanded = signal(false);
  loading = signal(false);
  loadingMore = signal(false);
  currentPage = signal(1);
  totalPages = signal(1);

  @ViewChild('scrollContainer') scrollContainerRef?: ElementRef<HTMLDivElement>;

  constructor(private reviewService: ReviewService) {}

  ngOnInit() {
    this.loadPage(1);
  }

  expand() {
    this.isExpanded.set(true);
  }

  onScroll() {
    const el = this.scrollContainerRef?.nativeElement;
    if (!el) {
      return;
    }
    const distanceFromEnd = el.scrollWidth - (el.scrollLeft + el.clientWidth);
    if (distanceFromEnd <= SCROLL_LOAD_THRESHOLD_PX && !this.loadingMore() && this.currentPage() < this.totalPages()) {
      this.loadPage(this.currentPage() + 1);
    }
  }

  toAbsoluteUrl(path: string): string {
    return path.startsWith('http') ? path : `${UPLOADS_BASE_URL}${path}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  }

  private loadPage(page: number) {
    const isFirstPage = page === 1;
    isFirstPage ? this.loading.set(true) : this.loadingMore.set(true);

    this.reviewService
      .getPublicReviews(page, PAGE_SIZE)
      .then((res) => {
        this.reviews.update((existing) => (isFirstPage ? res.reviews : [...existing, ...res.reviews]));
        this.currentPage.set(res.page);
        this.totalPages.set(res.pages);
      })
      .finally(() => {
        this.loading.set(false);
        this.loadingMore.set(false);
      });
  }
}
