import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MaterialService } from '../../../core/services/material.service';

@Component({
  selector: 'app-material-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-12 md:py-16 px-4 bg-inherit">
      <div class="max-w-7xl mx-auto">
        <!-- Title -->
        <div class="text-center mb-12">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Material</h2>
        </div>

        <!-- Loading State -->
        <div *ngIf="materialService.loading()" class="text-center py-8">
          <p class="text-gray-600">Loading materials...</p>
        </div>

        <!-- Material Grid -->
        <div *ngIf="!materialService.loading()" class="material-grid-wrapper grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <button
            *ngFor="let material of materialService.activeMaterials()"
            (click)="onMaterialClick(material)"
            class="group cursor-pointer text-center transition-transform hover:scale-105 active:scale-95"
            type="button"
          >
            <div class="relative overflow-hidden rounded-full aspect-square bg-gray-100 mb-3 group-hover:shadow-lg transition-all">
              <img
                [src]="material.image || getPlaceholder(material.name)"
                [alt]="material.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
            <h3 class="font-semibold text-gray-900 text-sm group-hover:text-rose-500 transition-colors">{{ material.name }}</h3>
          </button>
        </div>

        <!-- Empty State -->
        <div *ngIf="!materialService.loading() && materialService.activeMaterials().length === 0" class="text-center py-12">
          <p class="text-gray-600">No materials available</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .material-grid-wrapper {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }

    @media (min-width: 768px) {
      .material-grid-wrapper {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    @media (min-width: 1024px) {
      .material-grid-wrapper {
        grid-template-columns: repeat(8, minmax(0, 1fr));
      }
    }
  `]
})
export class MaterialGridComponent {
  constructor(
    public materialService: MaterialService,
    private router: Router
  ) {}

  getPlaceholder(text: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
      <rect width="200" height="200" fill="#f3e8ff"/>
      <text x="50%" y="50%" font-size="12" font-family="Arial" fill="#9333ea" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  onMaterialClick(material: any) {
    console.log('Material clicked:', material.slug);
    // Navigate to shop with material filter
    this.router.navigate(['/shop'], {
      queryParams: {
        material: material.slug,
        name: material.name
      }
    });
  }
}
