import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loaderService.isLoading()" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl p-10 shadow-2xl w-96 max-w-[90%]">
        <!-- Modern Spinner -->
        <div class="flex flex-col items-center gap-6">
          <!-- Animated Gradient Spinner -->
          <div class="relative w-20 h-20">
            <div class="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 opacity-20"></div>
            <div class="absolute inset-0 border-4 border-transparent border-t-rose-500 border-r-rose-500 rounded-full animate-spin"></div>
          </div>

          <!-- Loading Message -->
          <div class="text-center">
            <p class="text-lg font-semibold text-gray-900">{{ loaderService.loadingMessage() }}</p>
            <p class="text-sm text-gray-500 mt-1">{{ getSubMessage() }}</p>
          </div>

          <!-- Progress Bar -->
          <div class="w-full" *ngIf="loaderService.progress() > 0">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-gray-600">Progress</span>
              <span class="text-xs font-semibold text-rose-600">{{ loaderService.progress() }}%</span>
            </div>
            <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                class="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300"
                [style.width.%]="loaderService.progress()">
              </div>
            </div>
          </div>

          <!-- Animated Dots -->
          <div class="flex items-center justify-center gap-1">
            <span class="inline-block w-2 h-2 bg-rose-500 rounded-full animate-bounce" style="animation-delay: 0s;"></span>
            <span class="inline-block w-2 h-2 bg-rose-400 rounded-full animate-bounce" style="animation-delay: 0.2s;"></span>
            <span class="inline-block w-2 h-2 bg-rose-300 rounded-full animate-bounce" style="animation-delay: 0.4s;"></span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .animate-spin {
      animation: spin 1.5s linear infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-8px); }
    }

    .animate-bounce {
      animation: bounce 1.4s infinite;
    }
  `]
})
export class LoaderComponent {
  loaderService = inject(LoaderService);

  getSubMessage(): string {
    const message = this.loaderService.loadingMessage();
    if (message.toLowerCase().includes('upload')) return 'Processing image...';
    if (message.toLowerCase().includes('save')) return 'Saving changes...';
    if (message.toLowerCase().includes('delete')) return 'Removing...';
    if (message.toLowerCase().includes('fetch') || message.toLowerCase().includes('load')) return 'Fetching data...';
    return 'Please wait...';
  }
}
