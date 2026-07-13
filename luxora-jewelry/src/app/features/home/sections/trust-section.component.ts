import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TrustItem {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-trust-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="py-8 md:py-12 px-4 bg-gradient-to-b from-white to-rose-50">
      <div class="max-w-7xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
          <div *ngFor="let item of trustItems" class="text-center">
            <div class="flex justify-center mb-3">
              <div class="text-4xl">{{ item.icon }}</div>
            </div>
            <h3 class="font-semibold text-gray-900 text-sm md:text-base">{{ item.title }}</h3>
            <p class="text-xs md:text-sm text-gray-600 mt-1">{{ item.description }}</p>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class TrustSectionComponent {
  trustItems: TrustItem[] = [
    {
      icon: '🚚',
      title: 'Free Shipping',
      description: 'On orders above ₹999',
    },
    {
      icon: '🔒',
      title: 'Secure Payment',
      description: '100% secure transactions',
    },
    {
      icon: '↩️',
      title: 'Easy Returns',
      description: '15 days return policy',
    },
    {
      icon: '✓',
      title: 'Hallmark Certified',
      description: '925 Pure Silver',
    },
    {
      icon: '⭐',
      title: 'Premium Quality',
      description: 'Crafted with perfection',
    },
  ];
}
