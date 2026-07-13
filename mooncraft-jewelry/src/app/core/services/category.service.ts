import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  type?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly API_URL = 'http://localhost:5000/api/v1/categories';
  private readonly MATERIALS_API_URL = 'http://localhost:5000/api/v1/materials';
  categories = signal<Category[]>([]);
  materials = signal<Category[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.fetchCategories();
    this.fetchMaterials();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  fetchCategories(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API_URL}`, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        console.log('✓ Categories fetched:', response);
        const categoryList = response.categories || response.data || [];
        console.log('📊 Product categories count:', categoryList.length);

        // Filter only type categories (not materials)
        const productCategories = categoryList.filter((cat: Category) => !cat.type || cat.type === 'type');
        console.log('📦 Filtered product categories:', productCategories.length);

        this.categories.set(productCategories);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('✗ Failed to fetch categories:', error);
        this.error.set(error.error?.message || 'Failed to load categories');
        this.loading.set(false);
      }
    });
  }

  fetchMaterials(): void {
    this.http.get<any>(`${this.MATERIALS_API_URL}`, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        console.log('✓ Materials fetched:', response);
        const materialList = response.materials || response.data || [];
        console.log('💎 Materials count:', materialList.length);

        this.materials.set(materialList);
        this.error.set(null);
      },
      error: (error) => {
        console.error('✗ Failed to fetch materials:', error);
        this.error.set(error.error?.message || 'Failed to load materials');
      }
    });
  }

  getCategories(): Category[] {
    return this.categories();
  }

  getMaterials(): Category[] {
    return this.materials();
  }
}
