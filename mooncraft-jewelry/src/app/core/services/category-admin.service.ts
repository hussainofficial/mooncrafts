import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface CategoryAdmin {
  id: string;
  name: string;
  slug: string;
  type: 'material' | 'type' | 'collection';
  description?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryAdminService {
  private readonly API_URL = `${environment.apiUrl}/categories`;
  categories = signal<CategoryAdmin[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

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

  fetchAllCategories(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API_URL}`, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        console.log('✓ Categories fetched:', response);
        const categories = (response.data || []).map((cat: any) => ({
          id: cat.id?.toString() || '',
          name: cat.name || '',
          slug: cat.slug || '',
          type: cat.type || 'type',
          description: cat.description || '',
          status: cat.is_active ? 'active' : 'inactive',
          createdAt: cat.created_at
        }));
        this.categories.set(categories);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('✗ Failed to fetch categories:', error);
        this.error.set('Failed to load categories');
        this.loading.set(false);
      }
    });
  }

  getCategories(): CategoryAdmin[] {
    return this.categories();
  }

  getCategoryById(id: string): CategoryAdmin | undefined {
    return this.categories().find(c => c.id === id);
  }

  addCategory(category: Omit<CategoryAdmin, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.post<any>(`${this.API_URL}`, {
        name: category.name,
        slug: category.slug,
        description: category.description,
        type: category.type,
        is_active: category.status === 'active'
      }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchAllCategories();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to add category:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to add category' });
        }
      });
    });
  }

  updateCategory(id: string, updates: Partial<CategoryAdmin>): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.slug !== undefined) payload.slug = updates.slug;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.type !== undefined) payload.type = updates.type;
      if (updates.status !== undefined) payload.is_active = updates.status === 'active';

      this.http.put<any>(`${this.API_URL}/${id}`, payload, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchAllCategories();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to update category:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to update category' });
        }
      });
    });
  }

  deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.delete<any>(`${this.API_URL}/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchAllCategories();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to delete category:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to delete category' });
        }
      });
    });
  }

  searchCategories(query: string): CategoryAdmin[] {
    const q = query.toLowerCase();
    return this.categories().filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q)
    );
  }
}
