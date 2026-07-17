import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { AuthService } from './auth.service';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  status: 'active' | 'inactive' | 'banned';
  createdAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserManagementService {
  private readonly API_URL = `${environment.apiUrl}/users`;
  users = signal<User[]>([]);
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

  fetchAllUsers(): void {
    this.loading.set(true);
    this.http.get<any>(`${this.API_URL}`, { headers: this.getHeaders() }).subscribe({
      next: (response) => {
        console.log('✓ Users fetched:', response);
        this.users.set(response.data || []);
        this.error.set(null);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('✗ Failed to fetch users:', error);
        this.error.set('Failed to load users');
        this.loading.set(false);
      }
    });
  }

  getUsers(): User[] {
    return this.users();
  }

  getUserById(id: string): User | undefined {
    return this.users().find(u => u.id === id);
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.post<any>(`${this.API_URL}`, user, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchAllUsers();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to add user:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to add user' });
        }
      });
    });
  }

  updateUser(id: string, updates: Partial<User>): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.put<any>(`${this.API_URL}/${id}`, updates, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchAllUsers();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to update user:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to update user' });
        }
      });
    });
  }

  deleteUser(id: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.delete<any>(`${this.API_URL}/${id}`, { headers: this.getHeaders() }).subscribe({
        next: () => {
          this.fetchAllUsers();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to delete user:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to delete user' });
        }
      });
    });
  }

  searchUsers(query: string): User[] {
    const q = query.toLowerCase();
    return this.users().filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }
}
