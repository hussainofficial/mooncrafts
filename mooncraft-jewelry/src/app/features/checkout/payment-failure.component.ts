import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CheckoutService, OrderDetails } from '../../core/services/checkout.service';
import { HeaderComponent } from '../home/components/header.component';

@Component({
  selector: 'app-payment-failure',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <!-- Header -->
    <app-header></app-header>

    <div class="min-h-screen bg-gradient-to-b from-red-50 to-gray-50">
      <div class="max-w-2xl mx-auto px-4 py-16">
        <!-- Error Animation -->
        <div class="text-center mb-12">
          <div class="inline-block mb-6">
            <div class="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
          </div>

          <h1 class="text-4xl font-bold text-gray-900 mb-3">Payment Failed</h1>
          <p class="text-xl text-gray-600 mb-8">Your payment could not be processed. Please try again or use a different payment method.</p>
        </div>

        <!-- Error Details Card -->
        <div *ngIf="order" class="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div class="border-l-4 border-red-500 pl-4 mb-6">
            <h2 class="text-lg font-bold text-gray-900 mb-2">Payment Declined</h2>
            <p class="text-gray-600">Your payment method was declined. This might be due to:</p>
            <ul class="list-disc list-inside text-gray-600 mt-3 space-y-1">
              <li>Insufficient funds</li>
              <li>Incorrect payment details</li>
              <li>Payment gateway timeout</li>
              <li>Card/Account restrictions</li>
            </ul>
          </div>

          <div class="grid grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <!-- Left Column -->
            <div class="space-y-4">
              <div>
                <p class="text-sm text-gray-600 font-semibold">Attempted Order ID</p>
                <p class="text-lg font-bold text-gray-900 font-mono">{{ order.orderId }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 font-semibold">Amount Attempted</p>
                <p class="text-2xl font-bold text-red-600">₹{{ order.amount }}</p>
              </div>
            </div>

            <!-- Right Column -->
            <div class="space-y-4">
              <div>
                <p class="text-sm text-gray-600 font-semibold">Payment Method</p>
                <p class="text-lg font-bold text-gray-900">{{ order.paymentMethod }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600 font-semibold">Failure Time</p>
                <p class="text-lg font-bold text-gray-900">{{ formatDate(order.timestamp) }}</p>
              </div>
            </div>
          </div>

          <!-- Order Details Still Valid -->
          <div class="mb-8">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Your Order Details (Not Charged)</h3>
            <div class="bg-blue-50 rounded-lg p-4">
              <p class="text-sm text-blue-700 mb-4">Your order items are still in your cart. You can retry payment with a different method.</p>
              <div class="space-y-2">
                <p class="text-sm text-gray-600">
                  <span class="font-semibold">Shipping to:</span> {{ order.shippingAddress.fullName }}
                </p>
                <p class="text-sm text-gray-600">{{ order.shippingAddress.address }}, {{ order.shippingAddress.city }}</p>
                <p class="text-sm text-gray-600">
                  <span class="font-semibold">Delivery:</span> {{ order.deliveryMethod.name }}
                </p>
              </div>
            </div>
          </div>

          <!-- Order Items -->
          <div>
            <h3 class="text-lg font-bold text-gray-900 mb-4">Order Items ({{ order.cartItems.length }})</h3>
            <div class="space-y-3">
              <div *ngFor="let item of order.cartItems" class="flex items-start gap-4 pb-3 border-b last:border-b-0">
                <img [src]="item.product.image" [alt]="item.product.name" class="w-12 h-12 rounded-lg object-cover">
                <div class="flex-1">
                  <p class="font-semibold text-gray-900 text-sm">{{ item.product.name }}</p>
                  <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                </div>
                <p class="font-bold text-gray-900 text-sm">₹{{ item.product.price * item.quantity }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 mb-8">
          <button
            (click)="retryPayment()"
            class="w-full px-6 py-3 bg-rose-500 text-white rounded-lg font-bold hover:bg-rose-600 transition-colors text-lg">
            Retry Payment with Same Method
          </button>
          <button
            (click)="changePaymentMethod()"
            class="w-full px-6 py-3 border-2 border-rose-500 text-rose-600 rounded-lg font-bold hover:bg-rose-50 transition-colors text-lg">
            Try Different Payment Method
          </button>
          <button
            (click)="continueShopping()"
            class="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors text-lg">
            Continue Shopping
          </button>
        </div>

        <!-- Support Section -->
        <div class="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <h3 class="font-bold text-gray-900 mb-2">Need Help?</h3>
          <p class="text-gray-600 mb-4">Contact our customer support team if you continue to experience issues:</p>
          <p class="text-gray-700 font-semibold">📧 support@mooncraft.com | 📞 1-800-MOONCRAFT-1</p>
        </div>
      </div>
    </div>
  `,
})
export class PaymentFailureComponent implements OnInit {
  order: OrderDetails | null = null;

  constructor(
    private route: ActivatedRoute,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const orderId = params['orderId'];
      // Get from the failed order attempt (not saved in history since it failed)
      // In a real app, we'd store failed attempts separately
      // For now, reconstruct from current checkout state
      this.order = null;
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

  retryPayment() {
    // Go back to payment page with same method selected
    this.router.navigate(['/payment']);
  }

  changePaymentMethod() {
    // Reset payment method and go back to payment page
    this.checkoutService.selectPaymentMethod('');
    this.checkoutService.selectUPIApp('');
    this.router.navigate(['/payment']);
  }

  continueShopping() {
    this.router.navigate(['/']);
  }
}
