import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-rose-500">MOONCRAFT</h1>
          <p class="text-gray-600 mt-2">Premium Jewelry Store</p>
        </div>

        <!-- Login Info -->
        <div class="mb-8 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          <p class="font-semibold">🚀 Connected to Backend API</p>
          <p class="mt-1">Login with your registered account credentials</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="login()" class="space-y-6">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="you@example.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500">
          </div>

          <!-- Error Message -->
          <div *ngIf="error()" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ error() }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 disabled:bg-gray-400 transition-colors">
            {{ isLoading() ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <!-- Registration Link -->
        <div class="mt-6 text-center border-t pt-4">
          <p class="text-gray-600 mb-2">Don't have an account?</p>
          <a href="/register" class="text-rose-500 hover:text-rose-600 font-semibold">Create Account Now</a>
        </div>

        <!-- Back to Home -->
        <div class="mt-4 text-center">
          <a href="/" class="text-gray-500 hover:text-gray-700 text-sm">← Back to Home</a>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  email = '';
  password = '';
  activeTab = signal<'user' | 'admin'>('user');
  error = signal('');
  isLoading = signal(false);
  loaderService = inject(LoaderService);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  switchTab(tab: 'user' | 'admin') {
    this.activeTab.set(tab);
    this.email = '';
    this.password = '';
    this.error.set('');
  }

  login() {
    this.error.set('');

    if (!this.email || !this.password) {
      this.error.set('Please enter email and password');
      return;
    }

    this.loaderService.show('Logging in...');

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Login successful!', response);
        this.loaderService.hide();
        this.router.navigate([''], { replaceUrl: true });
      },
      error: (error) => {
        console.error('❌ Login error:', error);
        this.loaderService.hide();

        if (error.status === 401) {
          this.error.set('Invalid email or password');
        } else if (error.error?.message) {
          this.error.set(error.error.message);
        } else {
          this.error.set('Login failed. Please try again.');
        }
      }
    });
  }
}
