import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface ProductWithFlags {
  id: string;
  name: string;
  price: number;
  image?: string;
  category_name?: string;
  is_trending: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
}

export interface ProductFlags {
  productId: string;
  productName: string;
  is_trending: boolean;
  is_new_arrival: boolean;
  is_best_seller: boolean;
  is_featured: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductFlagsService {
  private readonly API_URL = 'http://localhost:5000/api/v1/product-flags';
  productsWithFlags = signal<ProductWithFlags[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.fetchAllProductsWithFlags();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  fetchAllProductsWithFlags(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API_URL}/all`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.productsWithFlags.set(response.data || []);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error fetching products with flags:', error);
          this.error.set(error.message);
          this.loading.set(false);
        }
      });
  }

  getProductFlags(productId: string): Promise<ProductFlags> {
    return this.http.get<any>(`${this.API_URL}/${productId}/flags`, { headers: this.getHeaders() })
      .toPromise()
      .then(response => response.data)
      .catch(error => {
        this.error.set(error.message);
        throw error;
      });
  }

  updateProductFlags(productId: string, flags: Partial<ProductFlags>): Promise<any> {
    const flagsToUpdate = {
      is_trending: flags.is_trending,
      is_new_arrival: flags.is_new_arrival,
      is_best_seller: flags.is_best_seller,
      is_featured: flags.is_featured
    };

    return this.http.put<any>(`${this.API_URL}/${productId}/flags`, flagsToUpdate, { headers: this.getHeaders() })
      .toPromise()
      .then(response => {
        this.fetchAllProductsWithFlags();
        return response;
      })
      .catch(error => {
        this.error.set(error.error?.message || error.message);
        throw error;
      });
  }

  toggleFlag(productId: string, flagName: 'is_trending' | 'is_new_arrival' | 'is_best_seller' | 'is_featured', value: boolean): Promise<any> {
    const updatePayload: any = {};
    updatePayload[flagName] = value;

    return this.updateProductFlags(productId, updatePayload);
  }

  clearError(): void {
    this.error.set(null);
  }
}
