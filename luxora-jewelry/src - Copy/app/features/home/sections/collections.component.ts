import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CollectionService } from '../../../core/services/collection.service';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-12 md:py-16 px-4 lg:px-8 bg-inherit">
      <div class="w-full max-w-7xl mx-auto">
        <!-- Title -->
        <div class="text-center mb-8">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Shop by Collection</h2>
          <p class="text-sm text-gray-600 max-w-2xl mx-auto">
            Explore our curated collections for every moment of your life
          </p>
        </div>

        <!-- Loading State -->
        <div *ngIf="collectionService.loading()" class="text-center py-8">
          <p class="text-gray-600">Loading collections...</p>
        </div>

        <!-- Collections Grid -->
        <div *ngIf="!collectionService.loading()" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 overflow-visible">
          <div
            *ngFor="let collection of collectionService.activeCollections()"
            (click)="onCollectionClick(collection)"
            class="group cursor-pointer"
          >
            <div class="relative overflow-hidden rounded-2xl aspect-square bg-gray-100">
              <img
                [src]="collection.image || getPlaceholder(collection.name)"
                [alt]="collection.name"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 flex flex-col justify-end p-4">
                <h3 class="text-white font-bold text-lg">{{ collection.name }}</h3>
                <button
                  (click)="shopCollection(collection); $event.stopPropagation()"
                  class="text-rose-300 hover:text-rose-200 text-sm font-semibold mt-2 transition-colors hover:translate-x-1 transition-transform"
                >
                  Shop Now →
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!collectionService.loading() && collectionService.activeCollections().length === 0" class="text-center py-12">
          <p class="text-gray-600">No collections available</p>
        </div>
      </div>
    </section>
  `,
})
export class CollectionsComponent {
  constructor(
    public collectionService: CollectionService,
    private router: Router
  ) {}

  getPlaceholder(text: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f3e8ff"/>
      <text x="50%" y="50%" font-size="14" font-family="Arial" fill="#9333ea" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  onCollectionClick(collection: any) {
    console.log('Collection clicked:', collection.slug);
    // Navigate to shop page
    this.router.navigate(['/shop'], { queryParams: { collection: collection.slug } });
  }

  shopCollection(collection: any) {
    console.log('Shopping collection:', collection.name);
    // Navigate to shop with collection filter
    this.router.navigate(['/shop'], {
      queryParams: {
        collection: collection.slug,
        name: collection.name
      }
    });
  }
}
