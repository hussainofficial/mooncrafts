import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface Collection {
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
export class CollectionService {
  private readonly API_URL = `${environment.apiUrl}/collections`;
  collections = signal<Collection[]>([]);
  activeCollections = signal<Collection[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    this.fetchActiveCollections();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  fetchActiveCollections(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API_URL}/active/list`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          console.log('✓ Active collections fetched:', response);
          this.activeCollections.set(response.data || []);
          this.error.set(null);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('✗ Error fetching active collections:', error);
          this.error.set(error.error?.message || 'Failed to load collections');
          this.loading.set(false);
        }
      });
  }

  fetchAllCollections(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API_URL}`, { headers: this.getHeaders() })
      .subscribe({
        next: (response) => {
          this.collections.set(response.data || []);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Error fetching collections:', error);
          this.error.set(error.message);
          this.loading.set(false);
        }
      });
  }

  getCollectionById(id: string): Promise<Collection> {
    return this.http.get<any>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .toPromise()
      .then(response => response.data)
      .catch(error => {
        this.error.set(error.message);
        throw error;
      });
  }

  getCollectionBySlug(slug: string): Promise<Collection> {
    return this.http.get<any>(`${this.API_URL}/by-slug/${slug}`)
      .toPromise()
      .then(response => response.data)
      .catch(error => {
        this.error.set(error.message);
        throw error;
      });
  }

  createCollection(collection: Partial<Collection>): Promise<any> {
    return this.http.post<any>(`${this.API_URL}`, collection, { headers: this.getHeaders() })
      .toPromise()
      .then(response => {
        this.fetchAllCollections();
        return response;
      })
      .catch(error => {
        this.error.set(error.error?.message || error.message);
        throw error;
      });
  }

  updateCollection(id: string, collection: Partial<Collection>): Promise<any> {
    return this.http.put<any>(`${this.API_URL}/${id}`, collection, { headers: this.getHeaders() })
      .toPromise()
      .then(response => {
        this.fetchAllCollections();
        return response;
      })
      .catch(error => {
        this.error.set(error.error?.message || error.message);
        throw error;
      });
  }

  deleteCollection(id: string): Promise<any> {
    return this.http.delete<any>(`${this.API_URL}/${id}`, { headers: this.getHeaders() })
      .toPromise()
      .then(response => {
        this.fetchAllCollections();
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
