import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoaderService } from '../../core/services/loader.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="loaderService.isLoading()" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-sm mx-auto text-center">
        <!-- Spinner -->
        <div class="inline-flex items-center justify-center">
          <div class="w-12 h-12 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin"></div>
        </div>
        <!-- Message -->
        <p class="mt-4 text-gray-700 font-medium">{{ loaderService.loadingMessage() }}</p>
      </div>
    </div>
  `,
})
export class GlobalLoaderComponent {
  loaderService = inject(LoaderService);
}
