import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutService, OrderDetails } from '../../core/services/checkout.service';
import { HeaderComponent } from '../home/components/header.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <!-- Header -->
    <app-header></app-header>

    <div class="min-h-screen bg-gray-50">
      <!-- Page Title -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-gray-900">My Orders</h1>
          <a href="/" class="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold">
            Continue Shopping
          </a>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Empty State -->
        <div *ngIf="orders().length === 0" class="text-center py-16 bg-white rounded-lg shadow">
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
        <div *ngIf="orders().length > 0" class="space-y-6">
          <!-- Order Card -->
          <div *ngFor="let order of orders()" class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <!-- Order Header -->
            <div class="border-b p-6 flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-4 mb-2">
                  <h2 class="text-lg font-bold text-gray-900">Order #{{ order.orderId }}</h2>
                  <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                    ✓ Delivered
                  </span>
                </div>
                <p class="text-sm text-gray-600">
                  Placed on {{ formatDate(order.timestamp) }}
                </p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">Order Total</p>
                <p class="text-2xl font-bold text-rose-600">₹{{ order.amount }}</p>
              </div>
            </div>

            <!-- Order Items -->
            <div class="p-6 border-b">
              <h3 class="font-semibold text-gray-900 mb-4">Items ({{ order.cartItems.length }})</h3>
              <div class="space-y-3">
                <div *ngFor="let item of order.cartItems" class="flex items-center gap-4 pb-3 border-b last:border-b-0">
                  <img [src]="item.product.image" [alt]="item.product.name" class="w-16 h-16 rounded-lg object-cover">
                  <div class="flex-1">
                    <p class="font-semibold text-gray-900">{{ item.product.name }}</p>
                    <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                  </div>
                  <p class="font-bold text-gray-900">₹{{ item.product.price * item.quantity }}</p>
                </div>
              </div>
            </div>

            <!-- Order Details & Actions -->
            <div class="p-6 grid grid-cols-3 gap-6">
              <!-- Shipping Info -->
              <div>
                <p class="text-sm text-gray-600 font-semibold mb-2">Shipping Address</p>
                <p class="text-sm text-gray-900 font-semibold">{{ order.shippingAddress.fullName }}</p>
                <p class="text-xs text-gray-600">{{ order.shippingAddress.address }}</p>
                <p class="text-xs text-gray-600">{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }}</p>
                <p class="text-xs text-gray-600">{{ order.shippingAddress.postalCode }}</p>
              </div>

              <!-- Delivery Info -->
              <div>
                <p class="text-sm text-gray-600 font-semibold mb-2">Delivery Method</p>
                <p class="text-sm text-gray-900 font-semibold">{{ order.deliveryMethod.name }}</p>
                <p class="text-xs text-gray-600">{{ order.deliveryMethod.description }}</p>
                <p class="text-xs text-blue-600 font-semibold mt-2">
                  Est. Delivery: {{ order.deliveryMethod.estimatedDays }} days
                </p>
              </div>

              <!-- Payment Info -->
              <div>
                <p class="text-sm text-gray-600 font-semibold mb-2">Payment Method</p>
                <p class="text-sm text-gray-900 font-semibold">{{ order.paymentMethod }}</p>
                <p class="text-xs text-gray-600 mt-2">Transaction ID:</p>
                <p class="text-xs font-mono text-gray-700 truncate">{{ order.transactionId }}</p>
              </div>
            </div>

            <!-- Order Footer with Actions -->
            <div class="p-6 bg-gray-50 rounded-b-lg flex items-center justify-between border-t">
              <div class="flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
                <span class="text-gray-700">Order confirmed and paid</span>
              </div>
              <div class="flex gap-3">
                <button
                  (click)="trackOrder(order)"
                  class="px-6 py-2 border-2 border-rose-500 text-rose-600 rounded-lg hover:bg-rose-50 font-semibold transition-colors">
                  Track Order
                </button>
                <button
                  (click)="viewOrderDetails(order)"
                  class="px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
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
        <div class="sticky top-0 bg-white border-b p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Order Details</h2>
          <button
            (click)="closeDetailsModal()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 space-y-6">
          <!-- Order IDs -->
          <div class="grid grid-cols-3 gap-4">
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs text-gray-600 font-semibold mb-1">Order ID</p>
              <p class="text-lg font-mono font-bold text-gray-900">{{ selectedOrder()!.orderId }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs text-gray-600 font-semibold mb-1">Transaction ID</p>
              <p class="text-lg font-mono font-bold text-gray-900 truncate">{{ selectedOrder()!.transactionId }}</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4">
              <p class="text-xs text-gray-600 font-semibold mb-1">Payment ID</p>
              <p class="text-lg font-mono font-bold text-gray-900 truncate">{{ selectedOrder()!.paymentId }}</p>
            </div>
          </div>

          <!-- Shipping Address -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Shipping Address</h3>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="font-semibold text-gray-900">{{ selectedOrder()!.shippingAddress.fullName }}</p>
              <p class="text-gray-600 mt-2">{{ selectedOrder()!.shippingAddress.address }}</p>
              <p class="text-gray-600">{{ selectedOrder()!.shippingAddress.city }}, {{ selectedOrder()!.shippingAddress.state }} {{ selectedOrder()!.shippingAddress.postalCode }}</p>
              <p class="text-gray-600">{{ selectedOrder()!.shippingAddress.country }}</p>
              <p class="text-gray-600 mt-3">📱 {{ selectedOrder()!.shippingAddress.phone }}</p>
              <p class="text-gray-600">✉️ {{ selectedOrder()!.shippingAddress.email }}</p>
            </div>
          </div>

          <!-- Delivery Info -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Delivery Method</h3>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p class="font-semibold text-gray-900">{{ selectedOrder()!.deliveryMethod.name }}</p>
              <p class="text-sm text-gray-600 mt-2">{{ selectedOrder()!.deliveryMethod.description }}</p>
              <p class="text-sm font-semibold text-blue-700 mt-3">
                Estimated Delivery: {{ selectedOrder()!.deliveryMethod.estimatedDays }} business days
              </p>
            </div>
          </div>

          <!-- Order Items Detail -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Items ({{ selectedOrder()!.cartItems.length }})</h3>
            <div class="space-y-3">
              <div *ngFor="let item of selectedOrder()!.cartItems" class="flex items-start gap-4 pb-4 border-b last:border-b-0">
                <img [src]="item.product.image" [alt]="item.product.name" class="w-20 h-20 rounded-lg object-cover">
                <div class="flex-1">
                  <p class="font-semibold text-gray-900">{{ item.product.name }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ item.product.description }}</p>
                  <p class="text-sm text-gray-600 mt-2">
                    <span class="font-semibold">₹{{ item.product.price }}</span> x {{ item.quantity }} =
                    <span class="font-bold text-gray-900">₹{{ item.product.price * item.quantity }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Order Summary</h3>
            <div class="space-y-2 bg-gray-50 rounded-lg p-4">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal</span>
                <span class="font-semibold">₹{{ getOrderSubtotal(selectedOrder()!) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Tax (18%)</span>
                <span class="font-semibold">₹{{ Math.round(getOrderSubtotal(selectedOrder()!) * 0.18) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Delivery</span>
                <span class="font-semibold">₹{{ selectedOrder()!.deliveryMethod.price }}</span>
              </div>
              <div class="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total Paid</span>
                <span class="text-rose-600">₹{{ selectedOrder()!.amount }}</span>
              </div>
            </div>
          </div>

          <!-- Payment Info -->
          <div>
            <h3 class="font-bold text-gray-900 mb-3">Payment Information</h3>
            <div class="space-y-2 bg-green-50 rounded-lg p-4 border border-green-200">
              <div class="flex justify-between">
                <span class="text-gray-700">Payment Method</span>
                <span class="font-semibold">{{ selectedOrder()!.paymentMethod }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-700">Order Date</span>
                <span class="font-semibold">{{ formatDate(selectedOrder()!.timestamp) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-700">Status</span>
                <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                  ✓ Completed
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="border-t bg-gray-50 p-6 flex gap-3 rounded-b-xl">
          <button
            (click)="downloadInvoice(selectedOrder()!)"
            class="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-semibold transition-colors">
            📥 Download Invoice
          </button>
          <button
            (click)="closeDetailsModal()"
            class="flex-1 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Track Order Modal -->
    <div *ngIf="showTrackingModal() && selectedOrder()" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <!-- Modal Header -->
        <div class="border-b p-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900">Track Order #{{ selectedOrder()!.orderId }}</h2>
          <button
            (click)="closeTrackingModal()"
            class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Tracking Timeline -->
        <div class="p-8">
          <div class="space-y-6">
            <!-- Order Placed -->
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div class="w-1 h-12 bg-green-500 mt-2"></div>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Order Placed</h3>
                <p class="text-sm text-gray-600">{{ formatDate(selectedOrder()!.timestamp) }}</p>
                <p class="text-sm text-gray-600 mt-1">Your order has been confirmed</p>
              </div>
            </div>

            <!-- Payment Confirmed -->
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div class="w-1 h-12 bg-green-500 mt-2"></div>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Payment Confirmed</h3>
                <p class="text-sm text-gray-600">{{ getPaymentDate(selectedOrder()!.timestamp) }}</p>
                <p class="text-sm text-gray-600 mt-1">Payment via {{ selectedOrder()!.paymentMethod }} received</p>
              </div>
            </div>

            <!-- Item Packed -->
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div class="w-1 h-12 bg-green-500 mt-2"></div>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Item Packed</h3>
                <p class="text-sm text-gray-600">{{ getPackedDate(selectedOrder()!.timestamp) }}</p>
                <p class="text-sm text-gray-600 mt-1">Your item is being packed for shipment</p>
              </div>
            </div>

            <!-- Shipped -->
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div class="w-1 h-12 bg-green-500 mt-2"></div>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Shipped</h3>
                <p class="text-sm text-gray-600">{{ getShippedDate(selectedOrder()!.timestamp) }}</p>
                <p class="text-sm text-gray-600 mt-1">
                  Tracking #: <span class="font-mono font-semibold">LUX{{ selectedOrder()!.orderId.substring(3) }}</span>
                </p>
              </div>
            </div>

            <!-- In Transit -->
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <div class="w-1 h-12 bg-green-500 mt-2"></div>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">In Transit</h3>
                <p class="text-sm text-gray-600">{{ getInTransitDate(selectedOrder()!.timestamp) }}</p>
                <p class="text-sm text-gray-600 mt-1">Your package is on its way</p>
              </div>
            </div>

            <!-- Delivery -->
            <div class="flex gap-4">
              <div class="flex flex-col items-center">
                <div class="w-10 h-10 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">Delivered</h3>
                <p class="text-sm text-gray-600">{{ getDeliveryDate(selectedOrder()!.timestamp) }}</p>
                <p class="text-sm text-gray-600 mt-1">Package delivered to {{ selectedOrder()!.shippingAddress.address }}</p>
              </div>
            </div>
          </div>

          <!-- Delivery Address -->
          <div class="mt-8 pt-8 border-t">
            <h3 class="font-bold text-gray-900 mb-3">Delivery Address</h3>
            <div class="bg-blue-50 rounded-lg p-4">
              <p class="font-semibold text-gray-900">{{ selectedOrder()!.shippingAddress.fullName }}</p>
              <p class="text-gray-600 mt-2">{{ selectedOrder()!.shippingAddress.address }}</p>
              <p class="text-gray-600">{{ selectedOrder()!.shippingAddress.city }}, {{ selectedOrder()!.shippingAddress.state }} {{ selectedOrder()!.shippingAddress.postalCode }}</p>
              <p class="text-gray-600">{{ selectedOrder()!.shippingAddress.country }}</p>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="border-t bg-gray-50 p-6 flex gap-3 rounded-b-xl">
          <button
            (click)="closeTrackingModal()"
            class="flex-1 px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 font-semibold transition-colors">
            Close Tracking
          </button>
        </div>
      </div>
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  showDetailsModal = signal(false);
  showTrackingModal = signal(false);
  selectedOrder = signal<OrderDetails | null>(null);
  Math = Math;

  constructor(
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit() {
    // Orders are loaded from CheckoutService
  }

  orders() {
    return this.checkoutService.getOrders();
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

  getPaymentDate(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 0.5);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getPackedDate(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 2);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getShippedDate(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 4);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getInTransitDate(dateString: string): string {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 8);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getDeliveryDate(dateString: string): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 5); // Default 5 days delivery
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  getOrderSubtotal(order: OrderDetails): number {
    return order.cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }

  viewOrderDetails(order: OrderDetails) {
    this.selectedOrder.set(order);
    this.showDetailsModal.set(true);
  }

  closeDetailsModal() {
    this.showDetailsModal.set(false);
    this.selectedOrder.set(null);
  }

  trackOrder(order: OrderDetails) {
    this.selectedOrder.set(order);
    this.showTrackingModal.set(true);
  }

  closeTrackingModal() {
    this.showTrackingModal.set(false);
    this.selectedOrder.set(null);
  }

  downloadInvoice(order: OrderDetails) {
    const invoiceContent = this.generateInvoice(order);
    const element = document.createElement('a');
    element.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(invoiceContent);
    element.download = `LUXORA-Invoice-${order.orderId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  private generateInvoice(order: OrderDetails): string {
    const subtotal = this.getOrderSubtotal(order);
    const tax = Math.round(subtotal * 0.18);
    const total = order.amount;

    return `
LUXORA JEWELRY - Invoice
================================

Order ID: ${order.orderId}
Transaction ID: ${order.transactionId}
Payment ID: ${order.paymentId}
Date: ${this.formatDate(order.timestamp)}

CUSTOMER DETAILS
================================
Name: ${order.shippingAddress.fullName}
Email: ${order.shippingAddress.email}
Phone: ${order.shippingAddress.phone}

SHIPPING ADDRESS
================================
${order.shippingAddress.address}
${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}
${order.shippingAddress.country}

ITEMS
================================
${order.cartItems.map(item => `${item.product.name} x${item.quantity} = ₹${item.product.price * item.quantity}`).join('\n')}

ORDER SUMMARY
================================
Subtotal:           ₹${subtotal}
Tax (18%):          ₹${tax}
Delivery Charge:    ₹${order.deliveryMethod.price}
Total Paid:         ₹${total}

DELIVERY METHOD
================================
${order.deliveryMethod.name}
${order.deliveryMethod.description}
Est. Delivery: ${order.deliveryMethod.estimatedDays} days

PAYMENT METHOD
================================
${order.paymentMethod}

Status: Completed
Thank you for your purchase!
    `.trim();
  }
}
