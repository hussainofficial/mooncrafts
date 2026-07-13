import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Banner } from '../../../core/models';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative w-full bg-white">
      <!-- Main Carousel -->
      <div class="relative h-96 sm:h-[450px] md:h-[550px] lg:h-[600px] overflow-hidden rounded-3xl mx-3 sm:mx-4 lg:mx-6 mt-3 sm:mt-4">
        <!-- Background Slides with Zoom Effect -->
        <div class="relative w-full h-full" (mouseenter)="pauseSlide()" (mouseleave)="resumeSlide()">
          <div
            *ngFor="let banner of banners; let i = index"
            class="absolute inset-0 transition-all duration-1000 ease-out"
            [ngClass]="i === currentSlide() ? 'scale-100 opacity-100' : 'scale-110 opacity-0'"
          >
            <img
              [src]="banner.image"
              [alt]="banner.title"
              class="w-full h-full object-cover"
            />
            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
          </div>

          <!-- Content -->
          <div class="absolute inset-0 flex flex-col justify-end pb-20 md:pb-24 px-6 md:px-12 text-white z-5">
            <div class="max-w-2xl">
              <p class="text-rose-300 font-semibold mb-3 text-sm md:text-base">{{ currentSlide() + 1 }} / {{ banners.length }}</p>
              <h1 class="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                {{ banners[currentSlide()]?.title }}
              </h1>
              <p class="text-lg md:text-xl mb-8 text-gray-200 max-w-xl">
                {{ banners[currentSlide()]?.subtitle }}
              </p>
              <button
                class="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
                (click)="onCtaClick(banners[currentSlide()]?.ctaLink || '#')"
              >
                {{ banners[currentSlide()]?.cta }}
              </button>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20">
          <div
            class="h-full bg-gradient-to-r from-rose-400 to-rose-500 transition-all duration-300"
            [style.width.%]="progressBar()"
          ></div>
        </div>

        <!-- Previous Button -->
        <button
          (click)="previousSlide()"
          class="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 rounded-full transition-all duration-300 backdrop-blur-sm group/btn"
        >
          <svg class="w-6 h-6 text-white transform group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
          </svg>
        </button>

        <!-- Next Button -->
        <button
          (click)="nextSlide()"
          class="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white/20 hover:bg-white/40 rounded-full transition-all duration-300 backdrop-blur-sm group/btn"
        >
          <svg class="w-6 h-6 text-white transform group-hover/btn:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </button>
      </div>

      <!-- Thumbnail Preview Below -->
      <div class="px-4 md:px-8 py-8">
        <div class="flex gap-3 overflow-x-auto pb-4 scroll-smooth">
          <button
            *ngFor="let banner of banners; let i = index"
            (click)="goToSlide(i)"
            class="flex-shrink-0 relative h-20 w-32 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 group"
            [ngClass]="i === currentSlide() ? 'ring-2 ring-rose-500 scale-105' : 'hover:scale-110 opacity-70 hover:opacity-100'"
          >
            <img
              [src]="banner.image"
              [alt]="banner.title"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div
              *ngIf="i === currentSlide()"
              class="absolute inset-0 bg-gradient-to-r from-rose-500/50 to-transparent"
            ></div>
          </button>
        </div>
      </div>

      <!-- Dot Navigation -->
      <div class="flex justify-center gap-2 pb-6">
        <button
          *ngFor="let banner of banners; let i = index"
          (click)="goToSlide(i)"
          class="h-2 rounded-full transition-all duration-300"
          [ngClass]="i === currentSlide() ? 'bg-rose-500 w-8' : 'bg-gray-300 w-2 hover:bg-gray-400'"
        ></button>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep {
      .scroll-smooth {
        scroll-behavior: smooth;
      }
    }
  `]
})
export class HeroBannerComponent implements OnInit {
  banners: Banner[] = [];
  currentSlide = signal(0);
  progressBar = signal(0);
  private autoSlideInterval: any;
  private isAutoSliding = true;

  constructor(private mockDataService: MockDataService) {}

  ngOnInit() {
    this.banners = this.mockDataService.getBanners();
    this.startAutoSlide();
  }

  nextSlide() {
    this.currentSlide.set((this.currentSlide() + 1) % this.banners.length);
    this.resetProgress();
  }

  previousSlide() {
    this.currentSlide.set(
      this.currentSlide() === 0 ? this.banners.length - 1 : this.currentSlide() - 1
    );
    this.resetProgress();
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.resetProgress();
  }

  pauseSlide() {
    this.isAutoSliding = false;
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  resumeSlide() {
    this.isAutoSliding = true;
    this.startAutoSlide();
  }

  onCtaClick(link: string) {
    console.log('CTA clicked:', link);
  }

  private resetProgress() {
    this.progressBar.set(0);
  }

  private startAutoSlide() {
    // Update progress bar
    const progressInterval = setInterval(() => {
      const current = this.progressBar();
      if (current >= 100) {
        this.progressBar.set(0);
      } else {
        this.progressBar.set(current + 1);
      }
    }, 50);

    // Auto advance slide
    this.autoSlideInterval = setInterval(() => {
      if (this.isAutoSliding) {
        this.nextSlide();
      }
    }, 5000);
  }
}
