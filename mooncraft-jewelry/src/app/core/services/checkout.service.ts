import { Injectable, signal } from '@angular/core';
import { CartService } from './cart.service';

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
}

export interface OrderDetails {
  orderId: string;
  transactionId: string;
  paymentId: string;
  timestamp: string;
  status: 'success' | 'failed';
  amount: number;
  paymentMethod: string;
  shippingAddress: ShippingAddress;
  deliveryMethod: DeliveryMethod;
  cartItems: any[];
}

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  // Checkout state signals
  shippingAddress = signal<ShippingAddress>({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  selectedDeliveryMethod = signal<DeliveryMethod | null>(null);
  couponCode = signal<string>('');
  couponDiscount = signal<number>(0);

  // Payment state signals
  selectedPaymentMethod = signal<string>('');
  selectedUPIApp = signal<string>('');
  manualUPIId = signal<string>('');

  // Testing/Development
  forcePaymentFailure = signal<boolean>(false);

  // Order history
  orders = signal<OrderDetails[]>([]);

  deliveryMethods: DeliveryMethod[] = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      description: 'Free delivery on orders above ₹999',
      price: 0,
      estimatedDays: 5,
    },
    {
      id: 'express',
      name: 'Express Delivery',
      description: '2-3 days delivery',
      price: 149,
      estimatedDays: 3,
    },
    {
      id: 'overnight',
      name: 'Overnight Delivery',
      description: 'Deliver tomorrow',
      price: 299,
      estimatedDays: 1,
    },
  ];

  paymentMethods = [
    { id: 'upi', name: 'UPI', icon: '📱' },
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'netbanking', name: 'Net Banking', icon: '🏦' },
    { id: 'wallet', name: 'Digital Wallet', icon: '💰' },
    { id: 'cod', name: 'Cash on Delivery', icon: '🚚' },
  ];

  upiApps = [
    { id: 'googlepay', name: 'Google Pay', icon: '🔵' },
    { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
    { id: 'paytm', name: 'Paytm', icon: '🔵' },
    { id: 'bhim', name: 'BHIM', icon: '🟠' },
    { id: 'manual', name: 'Manual UPI ID', icon: '📝' },
  ];

  constructor(private cartService: CartService) {
    this.loadOrders();
  }

  private loadOrders() {
    try {
      const saved = localStorage.getItem('mooncraft_orders');
      if (saved) {
        this.orders.set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load orders:', e);
    }
  }

  private saveOrders() {
    localStorage.setItem('mooncraft_orders', JSON.stringify(this.orders()));
  }

  updateShippingAddress(address: Partial<ShippingAddress>) {
    this.shippingAddress.update(current => ({ ...current, ...address }));
  }

  selectDeliveryMethod(method: DeliveryMethod) {
    this.selectedDeliveryMethod.set(method);
  }

  applyCoupon(code: string): { valid: boolean; discount: number } {
    // Mock coupon validation
    const coupons: { [key: string]: number } = {
      MOONCRAFT10: 10,
      MOONCRAFT20: 20,
      MOONCRAFT50: 50,
      NEWUSER15: 15,
    };

    const discount = coupons[code.toUpperCase()] || 0;
    if (discount > 0) {
      this.couponCode.set(code);
      this.couponDiscount.set(discount);
      return { valid: true, discount };
    }
    return { valid: false, discount: 0 };
  }

  removeCoupon() {
    this.couponCode.set('');
    this.couponDiscount.set(0);
  }

  selectPaymentMethod(method: string) {
    this.selectedPaymentMethod.set(method);
    if (method !== 'upi') {
      this.selectedUPIApp.set('');
      this.manualUPIId.set('');
    }
  }

  selectUPIApp(app: string) {
    this.selectedUPIApp.set(app);
  }

  updateManualUPIId(upiId: string) {
    this.manualUPIId.set(upiId);
  }

  getOrderTotal(): number {
    const cartTotal = this.cartService.cartItems().reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const tax = Math.round(cartTotal * 0.18);
    const deliveryCharge = this.selectedDeliveryMethod()?.price || 0;
    const subtotal = cartTotal + tax + deliveryCharge;
    const discountAmount = Math.round(subtotal * (this.couponDiscount() / 100));

    return Math.max(0, subtotal - discountAmount);
  }

  getOrderBreakdown() {
    const cartTotal = this.cartService.cartItems().reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    const tax = Math.round(cartTotal * 0.18);
    const deliveryCharge = this.selectedDeliveryMethod()?.price || 0;
    const subtotal = cartTotal + tax + deliveryCharge;
    const discountAmount = Math.round(subtotal * (this.couponDiscount() / 100));

    return {
      cartTotal,
      tax,
      deliveryCharge,
      subtotal,
      discountAmount,
      finalTotal: Math.max(0, subtotal - discountAmount),
    };
  }

  // Mock payment processing
  async processPayment(): Promise<OrderDetails> {
    return new Promise((resolve) => {
      // Simulate API call delay (2-3 seconds)
      setTimeout(() => {
        const success = !this.forcePaymentFailure();

        const order: OrderDetails = {
          orderId: 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          transactionId: 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          paymentId: 'PAY' + Math.random().toString(36).substr(2, 9).toUpperCase(),
          timestamp: new Date().toISOString(),
          status: success ? 'success' : 'failed',
          amount: this.getOrderTotal(),
          paymentMethod: this.getSelectedPaymentMethodName(),
          shippingAddress: this.shippingAddress(),
          deliveryMethod: this.selectedDeliveryMethod()!,
          cartItems: this.cartService.cartItems(),
        };

        if (success) {
          // Save order to history
          this.orders.update(orders => [...orders, order]);
          this.saveOrders();

          // Clear cart on success
          this.cartService.clearCart();
        }

        resolve(order);
      }, 2000 + Math.random() * 1000); // 2-3 seconds
    });
  }

  private getSelectedPaymentMethodName(): string {
    const method = this.paymentMethods.find(m => m.id === this.selectedPaymentMethod());
    if (this.selectedPaymentMethod() === 'upi' && this.selectedUPIApp()) {
      const upiApp = this.upiApps.find(u => u.id === this.selectedUPIApp());
      return `UPI - ${upiApp?.name}`;
    }
    return method?.name || 'Unknown';
  }

  getOrders(): OrderDetails[] {
    return this.orders();
  }

  getOrderById(orderId: string): OrderDetails | undefined {
    return this.orders().find(o => o.orderId === orderId);
  }

  resetCheckout() {
    this.shippingAddress.set({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
    });
    this.selectedDeliveryMethod.set(null);
    this.couponCode.set('');
    this.couponDiscount.set(0);
    this.selectedPaymentMethod.set('');
    this.selectedUPIApp.set('');
    this.manualUPIId.set('');
    this.forcePaymentFailure.set(false);
  }

  // Development helper
  togglePaymentFailure() {
    this.forcePaymentFailure.update(v => !v);
  }

  isPaymentFailureEnabled(): boolean {
    return this.forcePaymentFailure();
  }
}
