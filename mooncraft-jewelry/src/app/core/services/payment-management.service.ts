import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_method: 'credit_card' | 'debit_card' | 'upi' | 'wallet';
  transaction_id: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PaymentManagementService {
  private readonly API_URL = `${environment.apiUrl}/payments`;
  payments = signal<Payment[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  stats = signal<any>({
    total: 0,
    pending: 0,
    completed: 0,
    failed: 0,
    refunded: 0,
    totalRevenue: 0
  });

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  fetchAllPayments(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.loading.set(true);

      // First fetch payments list
      this.http.get<any>(`${this.API_URL}/admin/all`, { headers: this.getHeaders() }).subscribe({
        next: (response) => {
          console.log('✓ Payments fetched:', response);
          this.payments.set(response.data || response.payments || []);

          // Then fetch analytics/stats
          this.http.get<any>(`${this.API_URL}/admin/analytics`, { headers: this.getHeaders() }).subscribe({
            next: (statsResponse) => {
              console.log('✓ Payment stats fetched:', statsResponse);
              this.stats.set(statsResponse.data || statsResponse.stats || this.calculateDefaultStats());
              this.error.set(null);
              this.loading.set(false);
              resolve({ success: true });
            },
            error: (statsError) => {
              console.warn('⚠ Could not fetch payment stats, using calculated values:', statsError);
              this.stats.set(this.calculateDefaultStats());
              this.error.set(null);
              this.loading.set(false);
              resolve({ success: true });
            }
          });
        },
        error: (error) => {
          console.error('✗ Failed to fetch payments:', error);
          this.error.set('Failed to load payments');
          this.loading.set(false);
          resolve({ success: false, error: 'Failed to load payments' });
        }
      });
    });
  }

  private calculateDefaultStats() {
    const allPayments = this.payments();
    return {
      total: allPayments.length,
      pending: this.getPaymentsByStatus('pending').length,
      completed: this.getPaymentsByStatus('completed').length,
      failed: this.getPaymentsByStatus('failed').length,
      refunded: this.getPaymentsByStatus('refunded').length,
      totalRevenue: this.getTotalRevenue()
    };
  }

  getPayments(): Payment[] {
    return this.payments();
  }

  getPaymentsByStatus(status: string): Payment[] {
    return this.payments().filter(p => p.status === status);
  }

  getTotalRevenue(): number {
    return this.payments()
      .filter(p => p.status === 'completed')
      .reduce((sum, payment) => sum + payment.amount, 0);
  }

  getPaymentMethodBreakdown() {
    const payments = this.payments();
    return {
      credit_card: payments.filter(p => p.payment_method === 'credit_card').length,
      debit_card: payments.filter(p => p.payment_method === 'debit_card').length,
      upi: payments.filter(p => p.payment_method === 'upi').length,
      wallet: payments.filter(p => p.payment_method === 'wallet').length,
    };
  }

  getPaymentStats() {
    return this.stats();
  }
}
