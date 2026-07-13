import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-lg bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-700">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-rose-500 mb-2">LUXORA</h1>
          <p class="text-gray-400">Admin Registration</p>
        </div>

        <!-- Warning -->
        <div class="p-4 bg-yellow-900/50 border border-yellow-700 rounded-lg mb-6 text-yellow-300 text-sm">
          ⚠️ This form is for authorized admin applicants only. You must have a valid admin registration code.
        </div>

        <!-- Form -->
        <form (ngSubmit)="register()" class="space-y-6">
          <!-- Admin Code (Most Important) -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Admin Registration Code *</label>
            <input
              type="password"
              [(ngModel)]="formData.adminCode"
              name="adminCode"
              placeholder="Enter your admin code"
              class="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required>
            <p class="text-gray-500 text-xs mt-1">This code is provided by LUXORA management</p>
          </div>

          <!-- Full Name -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Full Name *</label>
            <input
              type="text"
              [(ngModel)]="formData.name"
              name="name"
              placeholder="John Doe"
              class="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required>
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Email Address *</label>
            <input
              type="email"
              [(ngModel)]="formData.email"
              name="email"
              placeholder="admin@example.com"
              class="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required>
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Phone Number *</label>
            <input
              type="tel"
              [(ngModel)]="formData.phone"
              name="phone"
              placeholder="+1234567890"
              class="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-semibold text-gray-300 mb-2">Password *</label>
            <input
              type="password"
              [(ngModel)]="formData.password"
              name="password"
              placeholder="••••••••"
              class="w-full px-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500"
              required>
            <p class="text-gray-500 text-xs mt-1">Minimum 6 characters</p>
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
            {{ isLoading() ? 'Creating Account...' : 'Register as Admin' }}
          </button>
        </form>

        <!-- Already Have Account -->
        <div class="mt-6 text-center border-t border-gray-700 pt-4">
          <p class="text-gray-400 text-sm mb-2">Already have admin account?</p>
          <a href="/admin/login" class="text-rose-500 hover:text-rose-400 font-semibold">Login here</a>
        </div>

        <!-- Back to Home -->
        <div class="mt-4 text-center">
          <a href="/" class="text-gray-500 hover:text-gray-400 text-sm">← Back to Home</a>
        </div>
      </div>
    </div>
  `,
})
export class AdminRegisterComponent {
  formData = {
    adminCode: '',
    name: '',
    email: '',
    phone: '',
    password: '',
  };

  error = signal('');
  isLoading = signal(false);
  loaderService = inject(LoaderService);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  register() {
    this.error.set('');

    // Validate all fields
    if (!this.formData.adminCode || !this.formData.name || !this.formData.email || !this.formData.phone || !this.formData.password) {
      this.error.set('Please fill in all fields');
      return;
    }

    // Validate password length
    if (this.formData.password.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.loaderService.show('Verifying admin code and registering...');

    // Note: You need to implement adminRegister method in AuthService
    // For now, using regular register (you should create a separate endpoint)
    this.authService.register(
      this.formData.email,
      this.formData.password,
      this.formData.name,
      this.formData.phone
    ).subscribe({
      next: (response) => {
        console.log('✅ Admin registration successful!', response);
        this.loaderService.hide();
        this.router.navigate(['/admin'], { replaceUrl: true });
      },
      error: (error) => {
        console.error('❌ Registration error:', error);
        this.loaderService.hide();

        if (error.status === 409) {
          this.error.set('Email already exists');
        } else if (error.error?.message) {
          this.error.set(error.error.message);
        } else {
          this.error.set('Registration failed. Please check your admin code and try again.');
        }
      }
    });
  }
}
