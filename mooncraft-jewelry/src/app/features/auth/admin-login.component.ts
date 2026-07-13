import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4">
      <div class="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-rose-500 mb-2">MOONCRAFT</h1>
          <p class="text-gray-400">Admin Portal</p>
        </div>

        <!-- Form -->
        <form (ngSubmit)="login()" class="space-y-6">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@example.com"
              class="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500">
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              class="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500">
          </div>

          <!-- Error Message -->
          <div *ngIf="error()" class="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {{ error() }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 disabled:bg-gray-500 transition-colors">
            {{ isLoading() ? 'Logging in...' : 'Admin Login' }}
          </button>
        </form>

        <!-- No Admin Account Link -->
        <div class="mt-6 text-center border-t border-gray-700 pt-4">
          <p class="text-gray-400 text-sm mb-2">Don't have an admin account?</p>
          <a href="/admin/register" class="text-rose-500 hover:text-rose-400 font-semibold">Apply for Admin Access</a>
        </div>

        <!-- Back to Home -->
        <div class="mt-4 text-center">
          <a href="/" class="text-gray-500 hover:text-gray-400 text-sm">← Back to Home</a>
        </div>
      </div>
    </div>
  `,
})
export class AdminLoginComponent {
  email = '';
  password = '';
  error = signal('');
  isLoading = signal(false);
  loaderService = inject(LoaderService);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  login() {
    this.error.set('');

    if (!this.email || !this.password) {
      this.error.set('Please enter email and password');
      return;
    }

    this.loaderService.show('Verifying admin credentials...');

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        console.log('✅ Admin login successful!', response);
        this.loaderService.hide();
        this.router.navigate(['/admin'], { replaceUrl: true });
      },
      error: (error) => {
        console.error('❌ Login error:', error);
        this.loaderService.hide();

        if (error.status === 401) {
          this.error.set('Invalid credentials');
        } else if (error.error?.message) {
          this.error.set(error.error.message);
        } else {
          this.error.set('Login failed. Please try again.');
        }
      }
    });
  }
}
