import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrderService, Order } from '../../core/services/order.service';
import { ReviewService } from '../../core/services/review.service';
import { HeaderComponent } from '../home/components/header.component';
import { AddReviewModalComponent } from '../../shared/components/add-review-modal.component';

const STATUS_STEPS = ['pending', 'processing', 'shipped', 'delivered'];

const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: '✓ Delivered',
  cancelled: 'Cancelled',
};

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, HeaderComponent, AddReviewModalComponent],
  template: `
    <!-- Header -->
    <app-header></app-header>

    <div class="min-h-screen bg-gray-50">
      <!-- Page Title -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-3">
          <h1 class="text-xl sm:text-2xl font-bold text-gray-900">My Orders</h1>
          <a href="/" class="px-4 sm:px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold text-sm sm:text-base">
            Back to Shopping
          </a>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <!-- Loading -->
        <div *ngIf="loading()" class="text-center py-16 text-gray-500">Loading your orders...</div>

        <!-- Empty State -->
        <div *ngIf="!loading() && orders().length === 0" class="text-center py-16 bg-white rounded-lg shadow">
          <svg class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
          </svg>
          <p class="text-gray-600 text-xl mb-4 font-semibold">No Orders Yet</p>
          <p class="text-gray-500 mb-6">Start shopping to create your first order</p>
          <a href="/" class="inline-block px-8 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold">
            Start Shopping
          </a>
        </div>

        <!-- Orders List -->
        <div *ngIf="!loading() && orders().length > 0" class="space-y-6">
          <div *ngFor="let order of orders()" class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <!-- Order Header -->
            <div class="border-b p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                  <h2 class="text-base sm:text-lg font-bold text-gray-900">Order #{{ order.id }}</h2>
                  <span class="px-3 py-1 rounded-full text-sm font-semibold" [ngClass]="statusBadgeClass(order.status)">
                    {{ statusLabel(order.status) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600">Placed on {{ formatDate(order.created_at) }}</p>
              </div>
              <div class="text-left sm:text-right">
                <p class="text-sm text-gray-600">Order Total</p>
                <p class="text-xl sm:text-2xl font-bold text-rose-600">₹{{ order.total_amount }}</p>
              </div>
            </div>

            <!-- Order Items -->
            <div class="p-4 sm:p-6 border-b">
              <h3 class="font-semibold text-gray-900 mb-4">Items ({{ order.items.length }})</h3>
              <div class="space-y-3">
                <div *ngFor="let item of order.items" class="flex items-center gap-3 sm:gap-4 pb-3 border-b last:border-b-0">
                  <img [src]="item.product_image" [alt]="item.product_name" class="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover flex-shrink-0">
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-900 truncate">{{ item.product_name }}</p>
                    <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                  </div>
                  <p class="font-bold text-gray-900 flex-shrink-0">₹{{ item.price * item.quantity }}</p>
                </div>
              </div>
            </div>

            <!-- Order Footer with Actions -->
            <div class="p-4 sm:p-6 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t">
              <div class="flex items-center gap-2 text-sm text-gray-700">
                <span>Payment: {{ order.payment_method }}</span>
              </div>
              <div class="flex gap-3">
                <button
                  (click)="viewOrderDetails(order)"
                  class="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors text-sm sm:text-base">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div *ngIf="showDetailsModal() && selectedOrder()" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white border-b p-4 sm:p-6 flex items-center justify-between">
          <h2 class="text-xl sm:text-2xl font-bold text-gray-900">Order Details</h2>
          <button (click)="closeDetailsModal()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-4 sm:p-6 space-y-6">
          <!-- Write a Review banner -->
          <div
            *ngIf="selectedOrder()!.status === 'delivered' && !checkingReview() && !orderHasReview()"
            class="bg-gradient-to-r from-rose-500 to-pink-500 rounded-lg p-4 flex items-center justify-between gap-4"
          >
            <p class="text-white font-semibold">★ Loved your order? Let others know!</p>
            <button
              (click)="openReviewModal()"
              class="px-4 py-2 bg-white text-rose-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              Write a Review
            </button>
          </div>
          <div *ngIf="selectedOrder()!.status === 'delivered' && orderHasReview()" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800 font-semibold">✓ Thanks — you've already reviewed this order.</p>
          </div>

          <!-- Order Info -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs text-gray-600 font-semibold mb-1">Order ID</p>
              <p class="text-lg font-mono font-bold text-gray-900">#{{ selectedOrder()!.id }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs text-gray-600 font-semibold mb-1">Status</p>
              <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold" [ngClass]="statusBadgeClass(selectedOrder()!.status)">
                {{ statusLabel(selectedOrder()!.status) }}
              </span>
            </div>
          </div>

          <!-- Status Progress -->
          <div *ngIf="selectedOrder()!.status !== 'cancelled'">
            <h3 class="font-bold text-gray-900 mb-3">Order Progress</h3>
            <div class="flex items-center">
              <ng-container *ngFor="let step of statusSteps; let i = index; let last = last">
                <div class="flex flex-col items-center">
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    [ngClass]="isStepComplete(step) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'"
                  >
                    {{ isStepComplete(step) ? '✓' : i + 1 }}
                  </div>
                  <p class="text-xs text-gray-600 mt-1 text-center">{{ statusLabels[step] }}</p>
                </div>
                <div *ngIf="!last" class="flex-1 h-1 mx-1" [ngClass]="isStepComplete(step) ? 'bg-green-500' : 'bg-gray-200'"></div>
              </ng-container>
            </div>
          </div>

          <!-- Order Items Detail -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Items ({{ selectedOrder()!.items.length }})</h3>
            <div class="space-y-3">
              <div *ngFor="let item of selectedOrder()!.items" class="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <img [src]="item.product_image" [alt]="item.product_name" class="w-20 h-20 rounded-lg object-cover">
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{{ item.product_name }}</p>
                  <p class="text-sm text-gray-600 mt-2">
                    <span class="font-semibold">₹{{ item.price }}</span> x {{ item.quantity }} =
                    <span class="font-bold text-gray-900">₹{{ item.price * item.quantity }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Order Summary</h3>
            <div class="space-y-2 bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between text-lg font-bold">
                <span>Total Paid</span>
                <span class="text-rose-600">₹{{ selectedOrder()!.total_amount }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Payment Information</h3>
            <div class="space-y-2 bg-green-50 rounded-lg p-4 border border-green-200">
              <div class="flex justify-between">
                <span class="text-gray-700">Payment Method</span>
                <span class="font-semibold">{{ selectedOrder()!.payment_method }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Order Date</span>
                <span class="font-semibold">{{ formatDate(selectedOrder()!.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="border-t bg-gray-50 p-6 flex gap-3 rounded-b-xl">
          <button
            (click)="closeDetailsModal()"
            class="flex-1 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Write a Review Modal -->
    <app-add-review-modal
      [isOpen]="showReviewModal()"
      [orderId]="selectedOrder()?.id || 0"
      (closed)="closeReviewModal()"
      (submitted)="onReviewSubmitted()"
    ></app-add-review-modal>
  `,
})
export class OrdersComponent implements OnInit {
  orders = signal<Order[]>([]);
  loading = signal(false);

  showDetailsModal = signal(false);
  selectedOrder = signal<Order | null>(null);
  orderHasReview = signal(false);
  checkingReview = signal(false);
  showReviewModal = signal(false);

  statusSteps = STATUS_STEPS;
  statusLabels = STATUS_LABELS;

  constructor(
    private orderService: OrderService,
    private reviewService: ReviewService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loading.set(true);
    this.orderService.getUserOrders().subscribe({
      next: (response) => {
        this.orders.set(response.data || []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  statusBadgeClass(status: string): string {
    return STATUS_BADGE_CLASSES[status] || 'bg-gray-100 text-gray-800';
  }

  statusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
  }

  isStepComplete(step: string): boolean {
    const order = this.selectedOrder();
    if (!order) {
      return false;
    }
    return this.statusSteps.indexOf(step) <= this.statusSteps.indexOf(order.status);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  viewOrderDetails(order: Order) {
    this.selectedOrder.set(order);
    this.showDetailsModal.set(true);
    this.orderHasReview.set(false);

    if (order.status === 'delivered') {
      this.checkingReview.set(true);
      this.reviewService.checkOrderReviewed(order.id).then((hasReviewed) => {
        this.orderHasReview.set(hasReviewed);
        this.checkingReview.set(false);
      });
    }
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedOrder.set(null);
  }

  openReviewModal() {
    this.showReviewModal.set(true);
  }

  closeReviewModal() {
    this.showReviewModal.set(false);
  }

  onReviewSubmitted() {
    this.orderHasReview.set(true);
    this.showReviewModal.set(false);
  }
}
