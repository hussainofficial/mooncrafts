import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService, OrderDetails } from '../../core/services/checkout.service';
import { HeaderComponent } from '../home/components/header.component';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <!-- Header -->
    <app-header></app-header>

    <div class="min-h-screen bg-gradient-to-b from-green-50 to-gray-50">
      <div class="max-w-2xl mx-auto px-4 py-16">
        <!-- Success Animation -->
        <div class="text-center mb-12">
          <div class="inline-block mb-6">
            <div class="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>

          <h1 class="text-4xl font-bold text-gray-900 mb-3">Payment Successful! 🎉</h1>
          <p class="text-xl text-gray-600 mb-8">Thank you for your order. Your luxury jewelry is on its way!</p>
        </div>

        <!-- Order Details Card -->
        <div *ngIf="order" class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Order Details</h2>

          <div class="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <!-- Left Column -->
            <div class="space-y-6">
              <div>
                <p class="text-sm text-gray-600 font-semibold">Order ID</p>
                <p class="text-lg font-bold text-gray-900 font-mono">{{ order.orderId }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 font-semibold">Transaction ID</p>
                <p class="text-lg font-bold text-gray-900 font-mono">{{ order.transactionId }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 font-semibold">Payment ID</p>
                <p class="text-lg font-bold text-gray-900 font-mono">{{ order.paymentId }}</p>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-6">
              <div>
                <p class="text-sm text-gray-600 font-semibold">Date & Time</p>
                <p class="text-lg font-bold text-gray-900">{{ formatDate(order.timestamp) }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 font-semibold">Payment Method</p>
                <p class="text-lg font-bold text-gray-900">{{ order.paymentMethod }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 font-semibold">Amount Paid</p>
                <p class="text-2xl font-bold text-rose-600">₹{{ order.amount }}</p>
              </div>
            </div>
          </div>

          <!-- Shipping Address -->
          <div class="mb-8 pb-8 border-b">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Shipping Address</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="font-semibold text-gray-900">{{ order.shippingAddress.fullName }}</p>
              <p class="text-gray-600 mt-2">{{ order.shippingAddress.address }}</p>
              <p class="text-gray-600">{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.postalCode }}</p>
              <p class="text-gray-600">{{ order.shippingAddress.country }}</p>
              <p class="text-gray-600 mt-3">📱 {{ order.shippingAddress.phone }}</p>
              <p class="text-gray-600">✉️ {{ order.shippingAddress.email }}</p>
            </div>
          </div>

          <!-- Delivery Method -->
          <div class="mb-8 pb-8 border-b">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Delivery Method</h3>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="font-semibold text-gray-900">{{ order.deliveryMethod.name }}</p>
              <p class="text-sm text-gray-600 mt-2">{{ order.deliveryMethod.description }}</p>
              <p class="text-sm font-semibold text-blue-700 mt-3">Estimated Delivery: {{ order.deliveryMethod.estimatedDays }} business days</p>
            </div>
          </div>

          <!-- Order Items -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-4">Order Items ({{ order.cartItems.length }})</h3>
            <div class="space-y-4">
              <div *ngFor="let item of order.cartItems" class="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <img [src]="item.product.image" [alt]="item.product.name" class="w-16 h-16 rounded-lg object-cover">
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{{ item.product.name }}</p>
                  <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                </div>
                <p class="font-bold text-gray-900">₹{{ item.product.price * item.quantity }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3">
          <button
            (click)="continueShopping()"
            class="w-full px-6 py-3 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition-colors text-lg">
            Continue Shopping
          </button>
          <button
            (click)="viewOrders()"
            class="w-full px-6 py-3 border-2 border-rose-500 text-rose-600 rounded-lg font-bold hover:bg-rose-50 transition-colors text-lg">
            View My Orders
          </button>
        </div>

        <!-- Email Confirmation Notice -->
        <div class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
          <p class="text-gray-700">
            ✉️ A confirmation email has been sent to <span class="font-semibold">{{ order!.shippingAddress.email }}</span>
          </p>
          <p class="text-sm text-gray-600 mt-2">Please save your Order ID for tracking your shipment</p>
        </div>
      </div>
    </div>
  `,
})
export class PaymentSuccessComponent implements OnInit {
  order: OrderDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const orderId = params['orderId'];
      this.order = this.checkoutService.getOrderById(orderId) || null;

      if (!this.order) {
        this.router.navigate(['/']);
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  continueShopping() {
    this.router.navigate(['/']);
  }

  viewOrders() {
    this.router.navigate(['/orders']);
  }
}
