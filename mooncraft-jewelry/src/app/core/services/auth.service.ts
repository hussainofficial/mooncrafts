import { Injectable, effect } from '@angular/core';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly STORAGE_KEY = 'mooncraft_user';
  private readonly TOKEN_KEY = 'mooncraft_access_token';
  private readonly REFRESH_TOKEN_KEY = 'mooncraft_refresh_token';
  private readonly EXPIRY_TIME_KEY = 'mooncraft_token_expiry';
  private readonly API_URL = 'http://localhost:5000/api/v1/auth';

  currentUser = signal<User | null>(null);
  isLoggedIn = signal(false);
  isAdmin = signal(false);
  tokenExpiresIn = signal<number | null>(null);
  showTokenExpiryWarning = signal(false);

  private tokenExpiryTimer: any = null;
  private warningTimer: any = null;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.loadUser();
    this.setupTokenExpiryMonitoring();
  }

  private setupTokenExpiryMonitoring() {
    effect(() => {
      if (this.isLoggedIn()) {
        this.startTokenExpiryMonitoring();
      } else {
        this.clearTokenTimers();
      }
    });
  }

  private startTokenExpiryMonitoring() {
    this.clearTokenTimers();
    const expiryTime = this.getTokenExpiryTime();
    if (expiryTime) {
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      if (timeUntilExpiry > 0) {
        this.tokenExpiresIn.set(Math.floor(timeUntilExpiry / 1000));

        // Show warning 5 minutes before expiry
        const warningTime = timeUntilExpiry - (5 * 60 * 1000);
        if (warningTime > 0) {
          this.warningTimer = setTimeout(() => {
            this.showTokenExpiryWarning.set(true);
          }, warningTime);
        } else if (timeUntilExpiry < 5 * 60 * 1000) {
          this.showTokenExpiryWarning.set(true);
        }

        // Auto-logout when token expires
        this.tokenExpiryTimer = setTimeout(() => {
          console.warn('🔐 Token expired, logging out...');
          this.logout();
        }, timeUntilExpiry);
      } else {
        // Token already expired
        this.logout();
      }
    }
  }

  private clearTokenTimers() {
    if (this.tokenExpiryTimer) {
      clearTimeout(this.tokenExpiryTimer);
      this.tokenExpiryTimer = null;
    }
    if (this.warningTimer) {
      clearTimeout(this.warningTimer);
      this.warningTimer = null;
    }
    this.showTokenExpiryWarning.set(false);
  }

  private getTokenExpiryTime(): number | null {
    const token = this.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp ? payload.exp * 1000 : null;
    } catch (e) {
      console.error('Failed to decode token:', e);
      return null;
    }
  }

  renewToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return new Observable(observer => {
        observer.error('No refresh token available');
      });
    }

    return this.http.post<AuthResponse>(`${this.API_URL}/refresh`, {
      refreshToken
    }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          this.showTokenExpiryWarning.set(false);
          this.startTokenExpiryMonitoring();
        }
      }),
      catchError((error) => {
        console.error('Token refresh error:', error);
        this.logout();
        return of(null as any);
      })
    );
  }

  private loadUser() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const user = JSON.parse(saved);
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
        this.isAdmin.set(user.role === 'admin');
      }
    } catch (e) {
      console.error('Failed to load user:', e);
    }
  }

  register(email: string, password: string, name: string, phone: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, {
      email,
      password,
      name,
      phone,
    }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          const user = response.data.user;
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
          this.isAdmin.set(user.role === 'admin');
          this.startTokenExpiryMonitoring();
        }
      }),
      catchError((error) => {
        console.error('Register error:', error);
        throw error;
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, {
      email,
      password,
    }).pipe(
      tap((response) => {
        if (response.success && response.data) {
          const user = response.data.user;
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
          localStorage.setItem(this.TOKEN_KEY, response.data.accessToken);
          localStorage.setItem(this.REFRESH_TOKEN_KEY, response.data.refreshToken);
          this.currentUser.set(user);
          this.isLoggedIn.set(true);
          this.isAdmin.set(user.role === 'admin');
          this.startTokenExpiryMonitoring();
        }
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

  logout() {
    this.clearTokenTimers();
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRY_TIME_KEY);
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.isAdmin.set(false);
    this.tokenExpiresIn.set(null);
    this.router.navigate(['/']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  isAdminUser(): boolean {
    return this.isAdmin();
  }
}
