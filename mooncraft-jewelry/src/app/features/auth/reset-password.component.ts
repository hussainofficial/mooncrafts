import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50 flex items-center justify-center px-4">
      <div class="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8">
        <!-- Logo -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-rose-500">MOONCRAFT</h1>
          <p class="text-gray-600 mt-2">Set a new password</p>
        </div>

        <!-- Missing token -->
        <div *ngIf="!token" class="space-y-6">
          <div class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            This password reset link is invalid or missing. Please request a new one.
          </div>
          <a href="/forgot-password" class="block text-center w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 transition-colors">
            Request New Link
          </a>
        </div>

        <!-- Reset form -->
        <form *ngIf="token" (ngSubmit)="submit()" class="space-y-6">
          <div>
            <label class="block text-sm font-semibold text-gray-900 mb-2">New Password</label>
            <input
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              placeholder="••••••••"
              [disabled]="isLoading() || !!successMessage()"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:bg-gray-100">
            <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
          </div>

          <!-- Error Message -->
          <div *ngIf="error()" class="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {{ error() }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage()" class="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            {{ successMessage() }} Redirecting to login...
          </div>

          <button
            type="submit"
            [disabled]="isLoading() || !!successMessage()"
            class="w-full bg-rose-500 text-white py-3 rounded-lg font-semibold hover:bg-rose-600 disabled:bg-gray-400 transition-colors">
            {{ isLoading() ? 'Resetting...' : 'Reset Password' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  error = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] || '';
  }

  submit() {
    this.error.set('');
    this.successMessage.set('');

    if (!this.newPassword || this.newPassword.length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);

    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.successMessage.set(response.message);
        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.error.set(err.error?.message || 'Invalid or expired password reset token.');
      },
    });
  }
}
