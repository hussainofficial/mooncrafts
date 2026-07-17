import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface Order {
  id: string;
  user_id: string;
  customer_name?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address?: string;
  created_at: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderManagementService {
  private readonly API_URL = `${environment.apiUrl}/orders`;
  orders = signal<Order[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  stats = signal<any>({
    total: 0,
    pending: 0,
    confirmed: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
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

  fetchAllOrders(): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.loading.set(true);

      // First fetch orders list
      this.http.get<any>(`${this.API_URL}/admin/all`, { headers: this.getHeaders() }).subscribe({
        next: (response) => {
          console.log('✓ Orders fetched:', response);
          this.orders.set(response.data || response.orders || []);

          // Then fetch analytics/stats
          this.http.get<any>(`${this.API_URL}/admin/analytics`, { headers: this.getHeaders() }).subscribe({
            next: (statsResponse) => {
              console.log('✓ Order stats fetched:', statsResponse);
              this.stats.set(statsResponse.data || statsResponse.stats || this.calculateDefaultStats());
              this.error.set(null);
              this.loading.set(false);
              resolve({ success: true });
            },
            error: (statsError) => {
              console.warn('⚠ Could not fetch order stats, using calculated values:', statsError);
              this.stats.set(this.calculateDefaultStats());
              this.error.set(null);
              this.loading.set(false);
              resolve({ success: true });
            }
          });
        },
        error: (error) => {
          console.error('✗ Failed to fetch orders:', error);
          this.error.set('Failed to load orders');
          this.loading.set(false);
          resolve({ success: false, error: 'Failed to load orders' });
        }
      });
    });
  }

  private calculateDefaultStats() {
    const allOrders = this.orders();
    return {
      total: allOrders.length,
      pending: this.getOrdersByStatus('pending').length,
      confirmed: this.getOrdersByStatus('confirmed').length,
      shipped: this.getOrdersByStatus('shipped').length,
      delivered: this.getOrdersByStatus('delivered').length,
      cancelled: this.getOrdersByStatus('cancelled').length,
      totalRevenue: this.getTotalRevenue()
    };
  }

  getOrders(): Order[] {
    return this.orders();
  }

  getOrdersByStatus(status: string): Order[] {
    return this.orders().filter(o => o.status === status);
  }

  getTotalRevenue(): number {
    return this.orders()
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, order) => sum + order.total_amount, 0);
  }

  getOrderStats() {
    return this.stats();
  }
}
