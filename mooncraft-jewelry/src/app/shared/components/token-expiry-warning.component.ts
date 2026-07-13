import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-token-expiry-warning',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="authService.showTokenExpiryWarning()"
      class="fixed top-0 left-0 right-0 bg-amber-50 border-b-2 border-amber-400 px-4 py-3 z-50">
      <div class="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-1">
          <svg class="w-5 h-5 text-amber-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
          </svg>
          <div class="flex-1">
            <p class="font-semibold text-amber-900">
              Your session is expiring soon
            </p>
            <p class="text-sm text-amber-800">
              Session expires in {{ formatTime(authService.tokenExpiresIn()) }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-shrink-0">
          <button
            (click)="renewSession()"
            class="px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors text-sm">
            Renew Session
          </button>
          <button
            (click)="dismissWarning()"
            class="p-2 hover:bg-amber-100 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
})
export class TokenExpiryWarningComponent implements OnInit, OnDestroy {
  private warningDismissalTimeout: any;

  constructor(public authService: AuthService) {}

  ngOnInit() {
    // Auto-dismiss warning after 30 seconds if not interacted
    this.warningDismissalTimeout = setTimeout(() => {
      this.dismissWarning();
    }, 30000);
  }

  ngOnDestroy() {
    if (this.warningDismissalTimeout) {
      clearTimeout(this.warningDismissalTimeout);
    }
  }

  renewSession() {
    this.authService.renewToken().subscribe({
      next: () => {
        console.log('✅ Session renewed successfully');
      },
      error: (err) => {
        console.error('❌ Failed to renew session:', err);
      }
    });
  }

  dismissWarning() {
    this.authService.showTokenExpiryWarning.set(false);
  }

  formatTime(seconds: number | null): string {
    if (!seconds || seconds < 0) return '0m 0s';

    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  }
}
