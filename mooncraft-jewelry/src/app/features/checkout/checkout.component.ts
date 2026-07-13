import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CheckoutService } from '../../core/services/checkout.service';
import { CartService } from '../../core/services/cart.service';
import { LocationService } from '../../core/services/location.service';
import { HeaderComponent } from '../home/components/header.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Header -->
    <app-header></app-header>

    <div class="min-h-screen bg-gray-50">
      <!-- Back Button -->
      <div class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 py-3">
          <button
            (click)="goBackToCart()"
            class="flex items-center gap-2 text-rose-500 hover:text-rose-600 font-semibold transition-colors">
            <span class="text-2xl">←</span>
            Back to Cart
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="bg-white border-b">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-500 text-white font-bold">1</div>
              <span class="ml-2 text-sm font-semibold text-gray-900">Shipping</span>
            </div>
            <div class="flex-1 h-1 bg-gray-300 mx-4"></div>
            <div class="flex items-center">
              <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 text-gray-600 font-bold">2</div>
              <span class="ml-2 text-sm font-semibold text-gray-600">Payment</span>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="grid grid-cols-3 gap-8">
          <!-- Left Column - Checkout Form -->
          <div class="col-span-2 space-y-6">
            <!-- Shipping Address Section -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Shipping Address</h2>

              <form class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      [(ngModel)]="checkoutService.shippingAddress().fullName"
                      (ngModelChange)="updateAddress('fullName', $event)"
                      name="fullName"
                      [class.border-red-500]="getFieldError('fullName')"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
                    <p *ngIf="getFieldError('fullName')" class="text-xs text-red-600 mt-1">{{ getFieldError('fullName') }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      [(ngModel)]="checkoutService.shippingAddress().email"
                      (ngModelChange)="updateAddress('email', $event)"
                      name="email"
                      [class.border-red-500]="getFieldError('email')"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
                    <p *ngIf="getFieldError('email')" class="text-xs text-red-600 mt-1">{{ getFieldError('email') }}</p>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    [(ngModel)]="checkoutService.shippingAddress().phone"
                    (ngModelChange)="updateAddress('phone', $event)"
                    name="phone"
                    [class.border-red-500]="getFieldError('phone')"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
                  <p *ngIf="getFieldError('phone')" class="text-xs text-red-600 mt-1">{{ getFieldError('phone') }}</p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
                  <textarea
                    [(ngModel)]="checkoutService.shippingAddress().address"
                    (ngModelChange)="updateAddress('address', $event)"
                    name="address"
                    rows="2"
                    [class.border-red-500]="getFieldError('address')"
                    class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500"></textarea>
                  <p *ngIf="getFieldError('address')" class="text-xs text-red-600 mt-1">{{ getFieldError('address') }}</p>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <!-- State Dropdown -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">State *</label>
                    <select
                      [ngModel]="selectedStateId()"
                      (ngModelChange)="onStateChange($event)"
                      name="state"
                      [class.border-red-500]="getFieldError('state')"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 bg-white">
                      <option [value]="null">Select State</option>
                      <option *ngFor="let state of locationService.states()" [value]="state.id">
                        {{ state.name }}
                      </option>
                    </select>
                    <p *ngIf="isLoadingStates()" class="text-xs text-gray-500 mt-1">Loading states...</p>
                    <p *ngIf="getFieldError('state')" class="text-xs text-red-600 mt-1">{{ getFieldError('state') }}</p>
                  </div>

                  <!-- City Dropdown -->
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <select
                      [ngModel]="selectedCityId()"
                      (ngModelChange)="onCityChange($event)"
                      name="city"
                      [disabled]="!selectedStateId() || isLoadingCities()"
                      [class.border-red-500]="getFieldError('city')"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 bg-white disabled:bg-gray-100">
                      <option [value]="null">{{ selectedStateId() ? 'Select City' : 'Select State First' }}</option>
                      <option *ngFor="let city of filteredCities()" [value]="city.id">
                        {{ city.name }}
                      </option>
                    </select>
                    <p *ngIf="isLoadingCities()" class="text-xs text-gray-500 mt-1">Loading cities...</p>
                    <p *ngIf="getFieldError('city')" class="text-xs text-red-600 mt-1">{{ getFieldError('city') }}</p>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Postal Code *</label>
                    <input
                      type="text"
                      [(ngModel)]="checkoutService.shippingAddress().postalCode"
                      (ngModelChange)="updateAddress('postalCode', $event)"
                      name="postalCode"
                      [class.border-red-500]="getFieldError('postalCode')"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
                    <p *ngIf="getFieldError('postalCode')" class="text-xs text-red-600 mt-1">{{ getFieldError('postalCode') }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-gray-700 mb-2">Country *</label>
                    <select
                      [(ngModel)]="checkoutService.shippingAddress().country"
                      (ngModelChange)="updateAddress('country', $event)"
                      name="country"
                      class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
                      <option>India</option>
                      <option>USA</option>
                      <option>UK</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>

            <!-- Delivery Method Section -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-6">Select Delivery Method</h2>

              <div class="space-y-3">
                <div *ngFor="let method of checkoutService.deliveryMethods"
                  (click)="checkoutService.selectDeliveryMethod(method)"
                  [class.border-rose-500]="checkoutService.selectedDeliveryMethod()?.id === method.id"
                  [class.bg-rose-50]="checkoutService.selectedDeliveryMethod()?.id === method.id"
                  class="border-2 border-gray-200 rounded-lg p-4 cursor-pointer transition-all hover:border-rose-300">
                  <div class="flex items-start gap-4">
                    <div class="mt-1">
                      <input
                        type="radio"
                        [checked]="checkoutService.selectedDeliveryMethod()?.id === method.id"
                        class="w-4 h-4 accent-rose-500 cursor-pointer">
                    </div>
                    <div class="flex-1">
                      <h3 class="font-semibold text-gray-900">{{ method.name }}</h3>
                      <p class="text-sm text-gray-600 mt-1">{{ method.description }}</p>
                      <p class="text-xs text-gray-500 mt-2">Estimated delivery in {{ method.estimatedDays }} days</p>
                    </div>
                    <div class="text-right">
                      <p *ngIf="method.price > 0" class="font-bold text-gray-900">₹{{ method.price }}</p>
                      <p *ngIf="method.price === 0" class="font-bold text-green-600">FREE</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Coupon Section -->
            <div class="bg-white rounded-lg shadow p-6">
              <h2 class="text-xl font-bold text-gray-900 mb-4">Promo Code</h2>

              <div class="flex gap-2">
                <input
                  type="text"
                  [(ngModel)]="couponInput"
                  placeholder="Enter promo code (e.g., MOONCRAFT10, NEWUSER15)"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-rose-500">
                <button
                  (click)="applyCoupon()"
                  class="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
                  Apply
                </button>
              </div>

              <div *ngIf="checkoutService.couponCode()" class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-sm text-green-700">
                  ✓ Coupon {{ checkoutService.couponCode() }} applied! You save ₹{{ getSavings() }}
                </p>
                <button
                  (click)="removeCoupon()"
                  class="text-xs text-green-600 hover:text-green-700 mt-2 font-semibold">
                  Remove coupon
                </button>
              </div>
            </div>

            <!-- Continue Button -->
            <button
              (click)="proceedToPayment()"
              [disabled]="!isCheckoutValid()"
              class="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-bold hover:from-rose-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 transition-all text-lg">
              Continue to Payment
            </button>
          </div>

          <!-- Right Column - Order Summary -->
          <div class="bg-white rounded-lg shadow p-6 h-fit sticky top-20">
            <h2 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            <div class="space-y-3 mb-6 pb-6 border-b">
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

            <div class="flex justify-between items-center mb-6">
              <span class="text-gray-600 font-semibold">Total</span>
              <span class="text-2xl font-bold text-rose-600">₹{{ getBreakdown().finalTotal }}</span>
            </div>

            <!-- Items Count -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p class="text-sm text-blue-700">
                <span class="font-bold">{{ cartService.cartItems().length }}</span> items in your cart
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class CheckoutComponent implements OnInit {
  couponInput = '';
  selectedStateId = signal<number | null>(null);
  selectedCityId = signal<number | null>(null);
  cityList = signal<any[]>([]);
  isLoadingCities = signal(false);
  isLoadingStates = signal(false);

  constructor(
    public checkoutService: CheckoutService,
    public cartService: CartService,
    public locationService: LocationService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check if cart is empty
    if (this.cartService.cartItems().length === 0) {
      this.router.navigate(['/cart']);
    }
  }

  updateAddress(field: string, value: string) {
    this.checkoutService.updateShippingAddress({
      [field]: value,
    } as any);
  }

  applyCoupon() {
    const result = this.checkoutService.applyCoupon(this.couponInput);
    if (!result.valid) {
      alert('Invalid coupon code');
      this.couponInput = '';
    }
  }

  removeCoupon() {
    this.checkoutService.removeCoupon();
    this.couponInput = '';
  }

  getSavings(): number {
    return this.getBreakdown().discountAmount;
  }

  getBreakdown() {
    return this.checkoutService.getOrderBreakdown();
  }

  isCheckoutValid(): boolean {
    const addr = this.checkoutService.shippingAddress();
    return !!(
      this.isValidFullName(addr.fullName) &&
      this.isValidEmail(addr.email) &&
      this.isValidPhone(addr.phone) &&
      addr.address &&
      addr.city &&
      addr.state &&
      this.isValidPostalCode(addr.postalCode) &&
      this.checkoutService.selectedDeliveryMethod()
    );
  }

  isValidEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  isValidPostalCode(postalCode: string): boolean {
    if (!postalCode) return false;
    // Indian postal code format (6 digits)
    const postalRegex = /^[0-9]{6}$/;
    return postalRegex.test(postalCode);
  }

  isValidFullName(fullName: string): boolean {
    if (!fullName) return false;
    return fullName.trim().length >= 2;
  }

  getFieldError(field: string): string {
    const addr = this.checkoutService.shippingAddress();

    switch (field) {
      case 'fullName':
        if (!addr.fullName) return 'Full name is required';
        if (!this.isValidFullName(addr.fullName)) return 'Full name must be at least 2 characters';
        return '';
      case 'email':
        if (!addr.email) return 'Email is required';
        if (!this.isValidEmail(addr.email)) return 'Please enter a valid email address';
        return '';
      case 'phone':
        if (!addr.phone) return 'Phone number is required';
        if (!this.isValidPhone(addr.phone)) return 'Phone number must be 10-15 digits';
        return '';
      case 'address':
        if (!addr.address) return 'Address is required';
        return '';
      case 'postalCode':
        if (!addr.postalCode) return 'Postal code is required';
        if (!this.isValidPostalCode(addr.postalCode)) return 'Postal code must be 6 digits';
        return '';
      case 'state':
        if (!addr.state) return 'State is required';
        return '';
      case 'city':
        if (!addr.city) return 'City is required';
        return '';
      default:
        return '';
    }
  }

  proceedToPayment() {
    if (this.isCheckoutValid()) {
      this.router.navigate(['/payment']);
    }
  }

  goBackToCart() {
    console.log('↩️ Going back to cart...');
    this.router.navigate(['/cart']);
  }

  // Handle state selection change
  onStateChange(stateId: number | null) {
    console.log('🔧 onStateChange called with:', stateId, 'Type:', typeof stateId);

    // Convert to number if it's a string (ngModel returns string from select)
    const numericStateId = stateId ? Number(stateId) : null;
    console.log('🔢 Converted to number:', numericStateId);

    this.selectedStateId.set(numericStateId);
    this.selectedCityId.set(null);
    this.cityList.set([]);

    if (numericStateId) {
      console.log('📋 Available states:', this.locationService.states());
      const state = this.locationService.states().find(s => s.id === numericStateId);
      console.log('🔍 Found state:', state);

      if (state) {
        console.log('🗺️ State selected:', state.name, 'ID:', state.id);
        this.updateAddress('state', state.name);

        // Load cities for the selected state
        this.isLoadingCities.set(true);
        console.log('📡 Requesting cities for state ID:', numericStateId);
        this.locationService.getCitiesByStateId(numericStateId).subscribe({
          next: (response) => {
            console.log('📊 Cities API Response:', response);
            if (response && response.data) {
              this.cityList.set(response.data);
              console.log('✅ Cities loaded:', response.data.length, 'cities');
            } else {
              console.warn('⚠️ No cities in response or success is false');
              this.cityList.set([]);
            }
            this.isLoadingCities.set(false);
          },
          error: (error) => {
            console.error('❌ Error loading cities - Full Error:', error);
            console.error('   Status:', error.status);
            console.error('   Message:', error.message);
            console.error('   Response:', error.error);
            this.cityList.set([]);
            this.isLoadingCities.set(false);
          }
        });
      }
    } else {
      this.updateAddress('state', '');
    }
  }

  // Handle city selection change
  onCityChange(cityId: number | null) {
    // Convert to number if it's a string (ngModel returns string from select)
    const numericCityId = cityId ? Number(cityId) : null;
    this.selectedCityId.set(numericCityId);

    if (numericCityId) {
      const city = this.cityList().find(c => c.id === numericCityId);
      if (city) {
        console.log('🏙️ City selected:', city.name);
        this.updateAddress('city', city.name);
      }
    } else {
      this.updateAddress('city', '');
    }
  }

  // Get filtered cities for the selected state
  filteredCities() {
    return this.cityList();
  }
}
