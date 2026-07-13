import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface Material {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root',
})
export class MaterialService {
  private readonly API_URL = 'http://localhost:5000/api/v1/materials';
  materials = signal<Material[]>([]);
  activeMaterials = signal<Material[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.fetchActiveMaterials();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  fetchActiveMaterials(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API_URL}/active/list`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          console.log('✓ Active materials fetched:', response);
          this.activeMaterials.set(response.data || []);
          this.error.set(null);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('✗ Error fetching active materials:', error);
          this.error.set(error.error?.message || 'Failed to load materials');
          this.loading.set(false);
        }
      });
  }

  fetchAllMaterials(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API_URL}`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.materials.set(response.data || []);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error fetching materials:', error);
          this.error.set(error.message);
          this.loading.set(false);
        }
      });
  }

  getMaterialById(id: string): Promise<Material> {
    return this.http.get<any>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .toPromise()
      .then(response => response.data)
      .catch(error => {
        this.error.set(error.message);
        throw error;
      });
  }

  getMaterialBySlug(slug: string): Promise<Material> {
    return this.http.get<any>(`${this.API_URL}/by-slug/${slug}`)
      .toPromise()
      .then(response => response.data)
      .catch(error => {
        this.error.set(error.message);
        throw error;
      });
  }

  createMaterial(material: Partial<Material>): Promise<any> {
    return this.http.post<any>(`${this.API_URL}`, material, { headers: this.getHeaders() })
      .toPromise()
      .then(response => {
        this.fetchAllMaterials();
        return response;
      })
      .catch(error => {
        this.error.set(error.error?.message || error.message);
        throw error;
      });
  }

  updateMaterial(id: string, material: Partial<Material>): Promise<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, material, { headers: this.getHeaders() })
      .toPromise()
      .then(response => {
        this.fetchAllMaterials();
        return response;
      })
      .catch(error => {
        this.error.set(error.error?.message || error.message);
        throw error;
      });
  }

  deleteMaterial(id: string): Promise<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .toPromise()
      .then(response => {
        this.fetchAllMaterials();
        return response;
      })
      .catch(error => {
        this.error.set(error.error?.message || error.message);
        throw error;
      });
  }

  clearError(): void {
    this.error.set(null);
  }
}
