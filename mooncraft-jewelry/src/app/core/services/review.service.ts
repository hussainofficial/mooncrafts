import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface PublicReview {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  avatar_url: string | null;
  created_at: string;
}

export interface PendingReview extends PublicReview {
  order_id: number;
  status: 'pending' | 'approved' | 'rejected';
}

export interface PublicReviewsResponse {
  reviews: PublicReview[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly API_URL = `${environment.apiUrl}/reviews`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getPublicReviews(page: number = 1, limit: number = 10): Promise<PublicReviewsResponse> {
    return this.http
      .get<any>(`${this.API_URL}/public`, { params: { page: page.toString(), limit: limit.toString() } })
      .toPromise()
      .then((response) => ({
        reviews: response.data || [],
        total: response.pagination?.total || 0,
        page: response.pagination?.page || page,
        limit: response.pagination?.limit || limit,
        pages: response.pagination?.pages || 0,
      }));
  }

  checkOrderReviewed(orderId: number): Promise<boolean> {
    return this.http
      .get<any>(`${this.API_URL}/check/${orderId}`, { headers: this.getAuthHeaders() })
      .toPromise()
      .then((response) => !!response.data?.hasReviewed)
      .catch(() => false);
  }

  submitPublicReview(data: {
    orderId: number;
    customerName: string;
    rating: number;
    comment: string;
    avatar?: File | null;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('orderId', data.orderId.toString());
    formData.append('customerName', data.customerName);
    formData.append('rating', data.rating.toString());
    formData.append('comment', data.comment);
    if (data.avatar) {
      formData.append('avatar', data.avatar);
    }

    return this.http.post<any>(`${this.API_URL}/public`, formData).toPromise();
  }

  getPendingReviews(page: number = 1, limit: number = 20): Promise<PendingReview[]> {
    return this.http
      .get<any>(`${this.API_URL}/admin/pending`, {
        headers: this.getAuthHeaders(),
        params: { page: page.toString(), limit: limit.toString() },
      })
      .toPromise()
      .then((response) => response.data || []);
  }

  updateReviewStatus(id: number, status: 'approved' | 'rejected'): Promise<any> {
    return this.http
      .patch<any>(`${this.API_URL}/admin/${id}/status`, { status }, { headers: this.getAuthHeaders() })
      .toPromise();
  }
}
