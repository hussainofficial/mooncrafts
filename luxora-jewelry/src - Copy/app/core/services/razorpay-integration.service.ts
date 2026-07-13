import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoaderService } from './loader.service';

export interface RazorpayOrderResponse {
  success: boolean;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
  orderId: number;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  data: {
    orderId: number;
    paymentId: string;
    status: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class RazorpayIntegrationService {
  private readonly API_URL = 'http://localhost:5000/api/v1/razorpay';
  paymentInProgress = signal(false);
  paymentError = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private loaderService: LoaderService
  ) {
    // Load Razorpay checkout script
    this.loadRazorpayScript();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    const headers: any = {
      'Content-Type': 'application/json'
    };

    // Only add Authorization header if token exists (logged-in user)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  // Load Razorpay checkout script from CDN with retry
  private loadRazorpayScript(): void {
    if (document.getElementById('razorpay-checkout')) {
      console.log('✅ Razorpay script already loaded');
      return;
    }

    console.log('📥 Loading Razorpay checkout script...');

    const script = document.createElement('script');
    script.id = 'razorpay-checkout';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    script.onload = () => {
      console.log('✅ Razorpay script loaded successfully');
      if ((window as any).Razorpay) {
        console.log('✅ Razorpay object available');
      }
    };

    script.onerror = () => {
      console.error('❌ Failed to load Razorpay checkout script');
      this.paymentError.set('Failed to load payment gateway. Please refresh and try again.');
    };

    document.body.appendChild(script);

    // Fallback: if script doesn't load in 10 seconds, show error
    setTimeout(() => {
      if (!(window as any).Razorpay) {
        console.warn('⚠️ Razorpay script timeout - trying alternative loading');
      }
    }, 10000);
  }

  // Create Razorpay Order
  async createOrder(orderId: number, amount: number, currency: string = 'INR'): Promise<RazorpayOrderResponse> {
    try {
      this.loaderService.show('Creating payment order...', true);
      this.paymentError.set(null);

      console.log('📡 Creating Razorpay order for order:', orderId);

      const response = await this.http.post<any>(
        `${this.API_URL}/create-order`,
        { orderId, amount, currency },
        { headers: this.getHeaders() }
      ).toPromise();

      if (!response?.success) {
        throw new Error(response?.message || 'Failed to create order');
      }

      // Extract data from response (backend wraps it in data field)
      const orderData = response.data || response;

      console.log('✅ Razorpay order created:', orderData.razorpayOrderId);
      console.log('   Key ID:', orderData.keyId);
      console.log('   Amount:', orderData.amount);
      console.log('   Currency:', orderData.currency);

      this.loaderService.complete();

      return orderData as RazorpayOrderResponse;
    } catch (error: any) {
      console.error('❌ Error creating order:', error);
      this.loaderService.hide();
      const errorMessage = error.error?.message || error.message || 'Failed to create payment order';
      this.paymentError.set(errorMessage);
      throw error;
    }
  }

  // Open Razorpay Checkout
  async openCheckout(orderData: RazorpayOrderResponse, userEmail: string, userPhone: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔍 Checking Razorpay availability...');
        console.log('   orderData:', orderData);

        // Validate order data
        if (!orderData || !orderData.razorpayOrderId || !orderData.keyId) {
          throw new Error(`Invalid order data: razorpayOrderId=${orderData?.razorpayOrderId}, keyId=${orderData?.keyId}`);
        }

        // Check if Razorpay script is loaded
        if (!(window as any).Razorpay) {
          console.warn('⚠️ Razorpay script not loaded, waiting...');
          // Wait up to 5 seconds for Razorpay to load
          let attempts = 0;
          const checkRazorpay = setInterval(() => {
            attempts++;
            if ((window as any).Razorpay) {
              clearInterval(checkRazorpay);
              console.log('✅ Razorpay loaded after wait');
              openCheckoutNow();
            } else if (attempts > 50) { // 5 seconds (50 * 100ms)
              clearInterval(checkRazorpay);
              throw new Error('Razorpay checkout script not loaded after 5 seconds');
            }
          }, 100);
          return;
        }

        const openCheckoutNow = () => {
          const options = {
            key: orderData.keyId, // Test key from backend
            amount: Math.round(orderData.amount * 100), // Amount in paise
            currency: orderData.currency,
            order_id: orderData.razorpayOrderId,
            name: 'LUXORA Jewelry',
            description: `Order #${orderData.orderId}`,
            image: '/logo.png', // Optional: your logo
            handler: (response: RazorpayPaymentResponse) => {
              console.log('✅ Payment successful, verifying...');
              this.verifyPayment(
                orderData.orderId,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              ).then(() => resolve()).catch(reject);
            },
            prefill: {
              email: userEmail || '',
              contact: userPhone || ''
            },
            theme: {
              color: '#ec4899' // Rose-500 from Tailwind
            },
            modal: {
              ondismiss: () => {
                console.log('❌ Payment cancelled by user');
                this.handlePaymentFailure(orderData.orderId, 'User cancelled payment');
                reject(new Error('Payment cancelled'));
              }
            }
          };

          console.log('🎯 Opening Razorpay checkout with options:', options);
          const rzp = new (window as any).Razorpay(options);

          rzp.on('payment.failed', (response: any) => {
            console.log('❌ Payment failed:', response.error);
            this.handlePaymentFailure(
              orderData.orderId,
              response.error?.description || 'Payment failed'
            ).then(() => reject(response.error)).catch(reject);
          });

          console.log('📲 Opening Razorpay popup...');
          rzp.open();
        };

        openCheckoutNow();
      } catch (error: any) {
        console.error('❌ Error opening checkout:', error);
        this.paymentError.set(error.message || 'Failed to open payment gateway');
        reject(error);
      }
    });
  }

  // Verify Payment (signature verification)
  async verifyPayment(
    orderId: number,
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<PaymentVerificationResponse> {
    try {
      this.loaderService.show('Verifying payment...', true);
      console.log('🔐 Verifying payment signature...');

      const response = await this.http.post<PaymentVerificationResponse>(
        `${this.API_URL}/verify-payment`,
        {
          orderId,
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        },
        { headers: this.getHeaders() }
      ).toPromise();

      if (!response?.success) {
        throw new Error(response?.message || 'Payment verification failed');
      }

      console.log('✅ Payment verified successfully');
      this.loaderService.complete();

      // Redirect to success page after a short delay
      setTimeout(() => {
        this.router.navigate(['/payment-success'], {
          queryParams: {
            orderId: orderId,
            paymentId: razorpayPaymentId
          }
        });
      }, 1500);

      return response;
    } catch (error: any) {
      console.error('❌ Payment verification error:', error);
      this.loaderService.hide();
      const errorMessage = error.error?.message || error.message || 'Payment verification failed';
      this.paymentError.set(errorMessage);

      // Redirect to failure page after a short delay
      setTimeout(() => {
        this.router.navigate(['/payment-failure'], {
          queryParams: {
            orderId: orderId,
            error: errorMessage
          }
        });
      }, 1500);

      throw error;
    }
  }

  // Handle Payment Failure
  async handlePaymentFailure(orderId: number, reason: string): Promise<void> {
    try {
      this.loaderService.show('Recording payment failure...', false);
      console.log('❌ Recording payment failure for order:', orderId);

      const response = await this.http.post(
        `${this.API_URL}/payment-failure`,
        { orderId, reason },
        { headers: this.getHeaders() }
      ).toPromise();

      this.loaderService.hide();
      this.paymentError.set(reason);

      // Redirect to failure page
      setTimeout(() => {
        this.router.navigate(['/payment-failure'], {
          queryParams: {
            orderId: orderId,
            error: reason
          }
        });
      }, 1000);
    } catch (error: any) {
      console.error('❌ Error recording payment failure:', error);
      this.loaderService.hide();
      this.paymentError.set('Failed to record payment status');
      throw error;
    }
  }

  // Get Payment Status
  async getPaymentStatus(orderId: number): Promise<any> {
    try {
      const response = await this.http.get(
        `${this.API_URL}/status/${orderId}`,
        { headers: this.getHeaders() }
      ).toPromise();

      return response;
    } catch (error) {
      console.error('❌ Error fetching payment status:', error);
      throw error;
    }
  }

  // Clear payment error
  clearError(): void {
    this.paymentError.set(null);
  }
}
