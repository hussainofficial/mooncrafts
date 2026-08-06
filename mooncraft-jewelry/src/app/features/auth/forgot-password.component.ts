import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-rose-500">MOONCRAFT</h1>
          <p class="text-gray-600 mt-2">Reset your password</p>
        </div>

        <p class="text-sm text-gray-600 mb-6">
          Enter the email address associated with your account, and we'll send you a link to reset your password.
        </p>

        <form (ngSubmit)="submit()" class="space-y-6">
          <!-- Email -->
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="you@example.com"
              [disabled]="isLoading()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
          </div>

          <!-- Error Message -->
          <div *ngIf="error()" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ error() }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage()" class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {{ successMessage() }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="isLoading() || !!successMessage()"
            class="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 disabled:bg-gray-400 transition-colors">
            {{ isLoading() ? 'Sending...' : 'Send Reset Link' }}
          </button>
        </form>

        <!-- Back to Login -->
        <div class="mt-6 text-center border-t pt-4">
          <a href="/signin" class="text-rose-500 hover:text-rose-600 font-semibold">Back to Login</a>
        </div>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  email = '';
  error = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  constructor(private authService: AuthService) {}

  submit() {
    this.error.set('');
    this.successMessage.set('');

    if (!this.email || !this.email.includes('@')) {
      this.error.set('Please enter a valid email address');
      return;
    }

    this.isLoading.set(true);

    this.authService.requestPasswordReset(this.email).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(response.message);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Something went wrong. Please try again.');
      },
    });
  }
}
