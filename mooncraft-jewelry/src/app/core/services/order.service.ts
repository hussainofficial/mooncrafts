import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

export interface OrderItem {
  productId: number;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
  shippingAddressId: number;
  billingAddressId: number;
  paymentMethod: string;
  totalAmount: number;
}

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: string;
  shippingAddressId: number;
  billingAddressId: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly API_URL = `${environment.apiUrl}/orders`;

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

  // Create a new order
  createOrder(orderData: CreateOrderRequest) {
    console.log('📦 Creating order with items:', orderData);
    return this.http.post<OrderResponse>(
      this.API_URL,
      orderData,
      { headers: this.getHeaders() }
    );
  }

  // Get order by ID
  getOrderById(orderId: number) {
    return this.http.get<OrderResponse>(
      `${this.API_URL}/${orderId}`,
      { headers: this.getHeaders() }
    );
  }

  // Get user's orders
  getUserOrders(page: number = 1, limit: number = 20) {
    return this.http.get<any>(
      `${this.API_URL}/user/my-orders?page=${page}&limit=${limit}`,
      { headers: this.getHeaders() }
    );
  }

  // Cancel an order
  cancelOrder(orderId: number) {
    return this.http.put<OrderResponse>(
      `${this.API_URL}/${orderId}/cancel`,
      {},
      { headers: this.getHeaders() }
    );
  }
}
