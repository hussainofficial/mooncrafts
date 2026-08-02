import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface MaterialAdmin {
  id: string;
  name: string;
  slug: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MaterialAdminService {
  private readonly API_URL = `${environment.apiUrl}/materials`;
  materials = signal<MaterialAdmin[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private extractErrorMessage(error: any, fallback: string): string {
    return error.error?.message
      || error.error?.errors?.[0]?.msg
      || fallback;
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  fetchAllMaterials(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API_URL}`, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        const materials = (response.data || []).map((mat: any) => ({
          id: mat.id?.toString() || '',
          name: mat.name || '',
          slug: mat.slug || '',
          description: mat.description || '',
          status: mat.is_active ? 'active' : 'inactive',
          createdAt: mat.created_at
        }));
        this.materials.set(materials);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('✗ Failed to fetch materials:', error);
        this.error.set('Failed to load materials');
        this.loading.set(false);
      }
    });
  }

  getMaterials(): MaterialAdmin[] {
    return this.materials();
  }

  getMaterialById(id: string): MaterialAdmin | undefined {
    return this.materials().find(m => m.id === id);
  }

  addMaterial(material: Omit<MaterialAdmin, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.post<any>(`${this.API_URL}`, {
        name: material.name,
        slug: material.slug,
        description: material.description,
        is_active: material.status === 'active'
      }, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchAllMaterials();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to add material:', error);
          resolve({ success: false, error: this.extractErrorMessage(error, 'Failed to add material') });
        }
      });
    });
  }

  updateMaterial(id: string, updates: Partial<MaterialAdmin>): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      const payload: any = {};
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.slug !== undefined) payload.slug = updates.slug;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.status !== undefined) payload.is_active = updates.status === 'active';

      this.http.put<any>(`${this.API_URL}/${id}`, payload, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchAllMaterials();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to update material:', error);
          resolve({ success: false, error: this.extractErrorMessage(error, 'Failed to update material') });
        }
      });
    });
  }

  deleteMaterial(id: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.delete<any>(`${this.API_URL}/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchAllMaterials();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to delete material:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to delete material' });
        }
      });
    });
  }

  searchMaterials(query: string): MaterialAdmin[] {
    const q = query.toLowerCase();
    return this.materials().filter(m => m.name.toLowerCase().includes(q));
  }
}
