import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../core/services/review.service';

@Component({
  selector: 'app-add-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
          <h2 class="text-xl font-bold text-gray-900">★ Write a Review</h2>
          <button (click)="close()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-4 sm:p-6 space-y-5">
          <!-- Star Picker -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Your Rating</label>
            <div class="flex gap-1">
              <button
                *ngFor="let i of [1, 2, 3, 4, 5]"
                type="button"
                (click)="rating.set(i)"
                (mouseenter)="hoverRating.set(i)"
                (mouseleave)="hoverRating.set(0)"
                class="text-3xl leading-none transition-transform hover:scale-110"
              >
                <span [style.color]="(hoverRating() || rating()) >= i ? '#fbbf24' : '#d1d5db'">★</span>
              </button>
            </div>
          </div>

          <!-- Customer Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
            <input
              type="text"
              [(ngModel)]="customerName"
              placeholder="e.g. Priya Sharma"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <!-- Comment -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
            <textarea
              [(ngModel)]="comment"
              rows="4"
              placeholder="Tell us what you think about this order..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-400 resize-none"
            ></textarea>
          </div>

          <!-- Avatar Upload -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Photo (optional)</label>
            <div class="flex items-center gap-4">
              <div
                class="rounded-full overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0"
                style="width: 44px; height: 44px;"
              >
                <img
                  *ngIf="avatarPreviewUrl()"
                  [src]="avatarPreviewUrl()"
                  alt="Avatar preview"
                  class="w-full h-full object-cover"
                />
                <span *ngIf="!avatarPreviewUrl()" class="text-gray-400 text-xs">No photo</span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                (change)="onAvatarSelected($event)"
                class="text-sm text-gray-600"
              />
            </div>
          </div>

          <!-- Error -->
          <div *ngIf="errorMessage()" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {{ errorMessage() }}
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t bg-gray-50 p-4 sm:p-6 flex gap-3 rounded-b-xl">
          <button
            (click)="close()"
            [disabled]="submitting()"
            class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            (click)="submit()"
            [disabled]="submitting() || !canSubmit()"
            class="flex-1 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ submitting() ? 'Submitting...' : 'Submit Review' }}
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AddReviewModalComponent {
  @Input() isOpen = false;
  @Input() orderId!: number;
  @Output() closed = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<void>();

  rating = signal(0);
  hoverRating = signal(0);
  customerName = '';
  comment = '';
  avatarFile: File | null = null;
  avatarPreviewUrl = signal<string | null>(null);
  submitting = signal(false);
  errorMessage = signal<string | null>(null);

  canSubmit(): boolean {
    return this.rating() > 0 && this.customerName.trim().length >= 2 && this.comment.trim().length > 0;
  }

  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.avatarFile = file;

    const reader = new FileReader();
    reader.onload = () => this.avatarPreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  submit() {
    if (!this.canSubmit() || this.submitting()) {
      return;
    }
    this.errorMessage.set(null);
    this.submitting.set(true);

    this.reviewService
      .submitPublicReview({
        orderId: this.orderId,
        customerName: this.customerName.trim(),
        rating: this.rating(),
        comment: this.comment.trim(),
        avatar: this.avatarFile,
      })
      .then(() => {
        this.submitting.set(false);
        this.submitted.emit();
        this.resetForm();
      })
      .catch((err) => {
        this.submitting.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to submit review. Please try again.');
      });
  }

  close() {
    this.resetForm();
    this.closed.emit();
  }

  private resetForm() {
    this.rating.set(0);
    this.hoverRating.set(0);
    this.customerName = '';
    this.comment = '';
    this.avatarFile = null;
    this.avatarPreviewUrl.set(null);
    this.errorMessage.set(null);
  }

  constructor(private reviewService: ReviewService) {}
}
