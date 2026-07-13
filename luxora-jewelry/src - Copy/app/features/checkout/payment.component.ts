import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService, OrderDetails } from '../../core/services/checkout.service';
import { CartService } from '../../core/services/cart.service';
import { RazorpayIntegrationService } from '../../core/services/razorpay-integration.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ValidationService } from '../../core/services/validation.service';
import { HeaderComponent } from '../home/components/header.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <!-- Header -->
    <app-header></app-header>

    <div class="min-h-screen bg-gray-50">
      <!-- Progress Bar -->
      <div class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold">✓</div>
              <span class="ml-2 text-sm font-semibold text-gray-900">Shipping</span>
            </div>
            <div class="flex-1 h-1 bg-rose-400 mx-4"></div>
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white font-bold">2</div>
              <span class="ml-2 text-sm font-semibold text-gray-900">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-8">
        <!-- Back Button -->
        <button
          (click)="goBackToCheckout()"
          class="mb-6 flex items-center gap-2 text-rose-500 hover:text-rose-600 font-semibold transition-colors">
          <span class="text-2xl">←</span>
          Back to Checkout
        </button>

        <div class="grid grid-cols-3 gap-8">
          <!-- Left Column - Payment Methods -->
          <div class="col-span-2 space-y-6">
            <!-- Payment Method Selection -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Select Payment Method</h2>

              <div class="space-y-3">
                <div *ngFor="let method of checkoutService.paymentMethods"
                  (click)="selectPaymentMethod(method.id)"
                  [class.border-rose-500]="checkoutService.selectedPaymentMethod() === method.id"
                  [class.bg-rose-50]="checkoutService.selectedPaymentMethod() === method.id"
                  class="border-2 border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:border-rose-300">
                  <div class="flex items-center gap-4">
                    <div>
                      <input
                        type="radio"
                        [checked]="checkoutService.selectedPaymentMethod() === method.id"
                        class="w-5 h-5 accent-rose-500 cursor-pointer">
                    </div>
                    <div class="text-2xl">{{ method.icon }}</div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900">{{ method.name }}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- UPI Apps (if UPI selected) -->
            <div *ngIf="checkoutService.selectedPaymentMethod() === 'upi'" class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Select UPI App</h2>

              <div class="space-y-3">
                <div *ngFor="let app of checkoutService.upiApps"
                  (click)="selectUPIApp(app.id)"
                  [class.border-rose-500]="checkoutService.selectedUPIApp() === app.id"
                  [class.bg-rose-50]="checkoutService.selectedUPIApp() === app.id"
                  class="border-2 border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:border-rose-300">
                  <div class="flex items-center gap-4">
                    <div>
                      <input
                        type="radio"
                        [checked]="checkoutService.selectedUPIApp() === app.id"
                        class="w-5 h-5 accent-rose-500 cursor-pointer">
                    </div>
                    <div class="text-2xl">{{ app.icon }}</div>
                    <h3 class="font-semibold text-gray-900">{{ app.name }}</h3>
                  </div>

                  <!-- Manual UPI ID Input -->
                  <div *ngIf="app.id === 'manual' && checkoutService.selectedUPIApp() === 'manual'" class="mt-4 ml-9">
                    <input
                      type="text"
                      [(ngModel)]="manualUPIId"
                      (ngModelChange)="checkoutService.updateManualUPIId($event)"
                      placeholder="Enter UPI ID (e.g., name@bank)"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
                  </div>
                </div>
              </div>
            </div>

            <!-- Development Testing Toggle -->
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  [(ngModel)]="testPaymentFailure"
                  (ngModelChange)="checkoutService.togglePaymentFailure()"
                  id="test-failure"
                  class="w-4 h-4 accent-yellow-500 cursor-pointer">
                <label for="test-failure" class="flex-1 cursor-pointer">
                  <span class="font-semibold text-yellow-900">Simulate Payment Failure</span>
                  <p class="text-sm text-yellow-700">For testing only: payment will fail on next attempt</p>
                </label>
              </div>
            </div>

            <!-- Continue to Payment Button -->
            <button
              (click)="processPayment()"
              [disabled]="!isPaymentValid() || isProcessing()"
              class="w-full px-6 py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-bold hover:from-rose-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 transition-all text-lg">
              <span *ngIf="!isProcessing()">Continue to Payment ₹{{ checkoutService.getOrderTotal() }}</span>
              <span *ngIf="isProcessing()">Opening Payment Gateway...</span>
            </button>

            <!-- Error Message -->
            <div *ngIf="razorpayService.paymentError()" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <p class="font-semibold">Payment Error</p>
              <p class="text-sm">{{ razorpayService.paymentError() }}</p>
            </div>
          </div>

          <!-- Right Column - Order Summary (Invoice Style) -->
          <div class="bg-white rounded-lg shadow p-6 h-fit sticky top-20">
            <h2 class="text-xl font-bold text-gray-900 mb-6">📋 Order Summary</h2>

            <!-- Customer Details -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 class="text-sm font-semibold text-blue-900 mb-3">👤 Bill To</h3>
              <p class="text-sm font-bold text-gray-900">{{ checkoutService.shippingAddress().fullName }}</p>
              <p class="text-xs text-gray-600">📧 {{ checkoutService.shippingAddress().email }}</p>
              <p class="text-xs text-gray-600">📱 {{ checkoutService.shippingAddress().phone }}</p>
            </div>

            <!-- Products List -->
            <div class="mb-6 pb-6 border-b-2">
              <h3 class="text-sm font-bold text-gray-900 mb-4 pb-2 border-b-2 border-rose-300">📦 Items Ordered</h3>
              <div class="space-y-4">
                <div *ngFor="let item of getCartItems(); let last = last"
                  [class.pb-4]="!last"
                  [class.border-b]="!last"
                  class="flex justify-between items-start text-sm">
                  <div class="flex-1">
                    <p class="font-bold text-gray-900">{{ item.name }}</p>
                    <p class="text-xs text-gray-600 mt-1">
                      <span class="inline-block bg-gray-100 px-2 py-1 rounded">
                        Qty: <strong>{{ item.quantity }}</strong>
                      </span>
                      <span class="inline-block bg-gray-100 px-2 py-1 rounded ml-2">
                        @₹<strong>{{ item.price }}</strong>
                      </span>
                    </p>
                  </div>
                  <div class="text-right ml-4">
                    <p class="font-bold text-rose-600 text-base">₹{{ (item.price * item.quantity) | number }}</p>
                  </div>
                </div>
                <div *ngIf="getCartItems().length === 0" class="text-center py-4 text-gray-500">
                  No items in cart
                </div>
              </div>
            </div>

            <!-- Cost Breakdown -->
            <div class="space-y-2 mb-6 pb-6 border-b text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-semibold">₹{{ getBreakdown().cartTotal }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tax (18%)</span>
                <span class="font-semibold">₹{{ getBreakdown().tax }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Delivery</span>
                <span class="font-semibold">₹{{ getBreakdown().deliveryCharge }}</span>
              </div>
              <div *ngIf="getBreakdown().discountAmount > 0" class="flex justify-between text-green-600">
                <span>Discount</span>
                <span class="font-semibold">-₹{{ getBreakdown().discountAmount }}</span>
              </div>
            </div>

            <!-- Final Total -->
            <div class="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 mb-4">
              <div class="flex justify-between items-center">
                <span class="font-semibold text-gray-900">Total Amount</span>
                <span class="text-2xl font-bold text-rose-600">₹{{ getBreakdown().finalTotal }}</span>
              </div>
            </div>

            <!-- Secure Payment Badge -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
              <p class="text-xs text-green-700">
                🔒 Secured with Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PaymentComponent implements OnInit {
  isProcessing = signal(false);
  manualUPIId = '';
  testPaymentFailure = false;

  constructor(
    public checkoutService: CheckoutService,
    public cartService: CartService,
    public razorpayService: RazorpayIntegrationService,
    public authService: AuthService,
    private orderService: OrderService,
    private validationService: ValidationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if shipping is complete
    const addr = this.checkoutService.shippingAddress();
    if (!addr.fullName || !this.checkoutService.selectedDeliveryMethod()) {
      this.router.navigate(['/checkout']);
    }
  }

  selectPaymentMethod(method: string) {
    this.checkoutService.selectPaymentMethod(method);
  }

  selectUPIApp(app: string) {
    this.checkoutService.selectUPIApp(app);
  }

  isPaymentValid(): boolean {
    const method = this.checkoutService.selectedPaymentMethod();
    if (!method) return false;
    if (method === 'upi') {
      const upiApp = this.checkoutService.selectedUPIApp();
      if (!upiApp) return false;
      if (upiApp === 'manual') {
        return this.checkoutService.manualUPIId().length > 0;
      }
    }
    return true;
  }

  async processPayment() {
    if (!this.isPaymentValid()) return;

    this.isProcessing.set(true);
    this.razorpayService.clearError();

    try {
      const shippingAddr = this.checkoutService.shippingAddress();

      // Step 0: Validate checkout details
      console.log('🔍 Validating checkout details...');
      const validation = this.validationService.validateCheckoutDetails(
        shippingAddr.email,
        shippingAddr.fullName,
        shippingAddr.phone
      );

      if (!validation.valid) {
        const errorMessages = Object.values(validation.errors).join(', ');
        throw new Error(`Validation failed: ${errorMessages}`);
      }

      console.log('✅ All checkout details are valid');

      const orderTotal = this.checkoutService.getOrderTotal();
      const cartItems = this.cartService.getCartItems();
      const isLoggedIn = this.authService.isLoggedIn();

      // Step 1: Create order in the database
      console.log('📦 Creating order in database...');
      const orderRequest: any = {
        items: cartItems.map(item => ({
          productId: Number(item.id),
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: 'razorpay',
        totalAmount: orderTotal
      };

      // Add guest details if not logged in
      if (!isLoggedIn) {
        orderRequest.guestEmail = shippingAddr.email;
        orderRequest.guestPhone = shippingAddr.phone;
        orderRequest.guestName = shippingAddr.fullName;
        console.log('👥 Guest checkout with email:', shippingAddr.email);
      } else {
        orderRequest.shippingAddressId = 1; // TODO: Get from actual address selection
        orderRequest.billingAddressId = 1;   // TODO: Get from actual address selection
        console.log('👤 Logged in user checkout');
      }

      const orderResponse = await this.orderService.createOrder(orderRequest).toPromise();

      if (!orderResponse?.success || !orderResponse?.data) {
        throw new Error('Failed to create order');
      }

      const orderId = orderResponse.data.id;
      console.log('✅ Order created with ID:', orderId);

      // Step 2: Create Razorpay order
      console.log('🔐 Creating Razorpay order for amount:', orderTotal);
      const razorpayOrder = await this.razorpayService.createOrder(
        orderId,
        orderTotal,
        'INR'
      );

      // Step 3: Open Razorpay checkout
      console.log('💳 Opening Razorpay checkout...');
      const userEmail = shippingAddr.email || 'guest@checkout.local';
      const userPhone = shippingAddr.phone || '';

      await this.razorpayService.openCheckout(
        razorpayOrder,
        userEmail,
        userPhone
      );

      // Payment verification and redirect happens in razorpayService
      this.isProcessing.set(false);
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      this.isProcessing.set(false);
      this.razorpayService.paymentError.set(error.message || 'Failed to process payment');
    }
  }

  getBreakdown() {
    return this.checkoutService.getOrderBreakdown();
  }

  getCartItems() {
    return this.cartService.getCartItems();
  }

  goBackToCheckout() {
    console.log('↩️ Going back to checkout...');
    this.router.navigate(['/checkout']);
  }
}
