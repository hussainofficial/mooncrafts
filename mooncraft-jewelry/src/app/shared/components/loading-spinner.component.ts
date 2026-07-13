import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="flex items-center justify-center gap-3">
      <div class="relative w-5 h-5">
        <div class="absolute inset-0 border-2 border-transparent border-t-rose-500 border-r-rose-500 rounded-full animate-spin"></div>
      </div>
      <span class="text-sm font-medium text-gray-700">{{ message }}</span>
    </div>
  `,
  styles: [`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .animate-spin {
      animation: spin 1s linear infinite;
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
}
