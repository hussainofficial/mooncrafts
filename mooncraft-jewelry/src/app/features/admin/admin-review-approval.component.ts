import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService, PendingReview } from '../../core/services/review.service';
import { environment } from '../../../environments/environment';

const UPLOADS_BASE_URL = environment.apiUrl.replace(/\/api\/v1\/?$/, '');

@Component({
  selector: 'app-admin-review-approval',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-lg sm:text-2xl font-bold text-gray-900">Pending Reviews ({{ reviews().length }})</h2>
        <button
          (click)="refresh()"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-semibold"
        >
          ↻ Refresh
        </button>
      </div>

      <!-- Loading -->
      <div *ngIf="loading()" class="text-center py-12 text-gray-500">Loading pending reviews...</div>

      <!-- Empty State -->
      <div *ngIf="!loading() && reviews().length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <p class="text-gray-600 text-lg">No reviews awaiting moderation 🎉</p>
      </div>

      <!-- Table -->
      <div *ngIf="!loading() && reviews().length > 0" class="overflow-x-auto bg-white rounded-lg shadow">
        <table class="w-full">
          <thead class="bg-gray-100 border-b">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold">Customer</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Order ID</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Rating</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Comment</th>
              <th class="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let review of reviews()" class="border-b hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0"
                    style="width: 40px; height: 40px;"
                  >
                    <img
                      *ngIf="review.avatar_url"
                      [src]="toAbsoluteUrl(review.avatar_url)"
                      [alt]="review.customer_name"
                      class="w-full h-full object-cover"
                    />
                    <div
                      *ngIf="!review.avatar_url"
                      class="w-full h-full flex items-center justify-center text-white font-semibold text-sm"
                      style="background-color: #ec4899"
                    >
                      {{ review.customer_name.charAt(0).toUpperCase() }}
                    </div>
                  </div>
                  <div>
                    <p class="font-semibold">{{ review.customer_name }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(review.created_at) }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm font-mono">#{{ review.order_id }}</td>
              <td class="px-6 py-4">
                <span *ngFor="let i of [1, 2, 3, 4, 5]">
                  <span [style.color]="i <= review.rating ? '#fbbf24' : '#d1d5db'">★</span>
                </span>
              </td>
              <td class="px-6 py-4 text-sm max-w-xs">
                <p class="line-clamp-2">{{ review.comment }}</p>
              </td>
              <td class="px-6 py-4 space-x-2 whitespace-nowrap">
                <button
                  (click)="moderate(review, 'approved')"
                  [disabled]="actingOn() === review.id"
                  class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  (click)="moderate(review, 'rejected')"
                  [disabled]="actingOn() === review.id"
                  class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm disabled:opacity-50"
                >
                  Reject
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminReviewApprovalComponent implements OnInit {
  reviews = signal<PendingReview[]>([]);
  loading = signal(false);
  actingOn = signal<number | null>(null);

  constructor(private reviewService: ReviewService) {}

  ngOnInit() {
    this.refresh();
  }

  refresh() {
    this.loading.set(true);
    this.reviewService
      .getPendingReviews()
      .then((reviews) => this.reviews.set(reviews))
      .finally(() => this.loading.set(false));
  }

  moderate(review: PendingReview, status: 'approved' | 'rejected') {
    this.actingOn.set(review.id);
    this.reviewService
      .updateReviewStatus(review.id, status)
      .then(() => {
        this.reviews.update((list) => list.filter((r) => r.id !== review.id));
      })
      .finally(() => this.actingOn.set(null));
  }

  toAbsoluteUrl(path: string): string {
    return path.startsWith('http') ? path : `${UPLOADS_BASE_URL}${path}`;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
