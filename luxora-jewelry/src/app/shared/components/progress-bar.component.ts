import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="show" class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-700">{{ label }}</span>
        <span class="text-sm font-semibold text-rose-500">{{ progress }}%</span>
      </div>
      <div class="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-300 ease-out"
          [style.width.%]="progress">
        </div>
      </div>
    </div>
  `,
})
export class ProgressBarComponent {
  @Input() progress = 0;
  @Input() show = false;
  @Input() label = 'Uploading...';
}
