import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

export interface WishlistItem {
  id: number;
  product_id: number;
  created_at: string;
  product_name: string;
  product_image: string;
  product_price: number;
}

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private readonly API_URL = `${environment.apiUrl}/wishlist`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getWishlist() {
    return this.http.get<{ success: boolean; data: WishlistItem[] }>(this.API_URL, { headers: this.getHeaders() });
  }

  addToWishlist(productId: number) {
    return this.http.post<{ success: boolean; message: string }>(
      this.API_URL,
      { productId },
      { headers: this.getHeaders() }
    );
  }

  removeFromWishlist(productId: number) {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.API_URL}/${productId}`,
      { headers: this.getHeaders() }
    );
  }
}
