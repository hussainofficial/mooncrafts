import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FooterLink {
  label: string;
  route: string;
  fragment?: string;
  queryParams?: Record<string, string>;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-gray-900 text-gray-300">
      <!-- Main Footer -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <!-- About -->
          <div>
            <h3 class="text-white font-bold mb-4">MOONCRAFT</h3>
            <p class="text-sm">
              Premium jewelry crafted with elegance and quality.
            </p>
            <div class="flex gap-4 mt-4">
              <a href="#" class="hover:text-rose-400">f</a>
              <a href="#" class="hover:text-rose-400">i</a>
              <a href="#" class="hover:text-rose-400">t</a>
              <a href="#" class="hover:text-rose-400">p</a>
            </div>
          </div>

          <!-- Quick Links -->
          <div *ngFor="let section of footerSections">
            <h4 class="text-white font-semibold mb-4">{{ section.title }}</h4>
            <ul class="space-y-2 text-sm">
              <li *ngFor="let link of section.links">
                <a
                  [routerLink]="link.route"
                  [fragment]="link.fragment"
                  [queryParams]="link.queryParams"
                  class="hover:text-rose-400 transition-colors">
                  {{ link.label }}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Divider -->
        <div class="border-t border-gray-800 pt-8">
          <!-- Payment Methods & Copyright -->
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <p class="text-sm">
              © 2024 Mooncraft Jewelry. All rights reserved.
            </p>
            <div class="flex gap-2">
              <span class="text-xs">💳 💰 🏦</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  footerSections: FooterSection[] = [
    {
      title: 'QUICK LINKS',
      links: [
        { label: 'All Products', route: '/products' },
        { label: 'New Arrivals', route: '/', fragment: 'new-arrivals' },
        { label: 'Best Sellers', route: '/', fragment: 'best-sellers' },
        { label: 'Sale', route: '/products' },
      ],
    },
    {
      title: 'COLLECTIONS',
      links: [
        { label: 'Bridal Collection', route: '/products', queryParams: { category: 'bridal-collection' } },
        { label: 'Party Wear', route: '/products', queryParams: { category: 'party-wear' } },
        { label: 'Daily Wear', route: '/products', queryParams: { category: 'daily-wear' } },
        { label: 'Office Wear', route: '/products', queryParams: { category: 'office-wear' } },
      ],
    },
    {
      title: 'CUSTOMER SERVICE',
      links: [
        { label: 'Track Order', route: '/orders' },
        // { label: 'Returns & Exchanges', route: '/' },
        { label: 'Shipping Policy', route: '/' },
        { label: 'Contact Us', route: '/', fragment: 'contact' },
      ],
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', route: '/', fragment: 'about' },
        // { label: 'Blog', route: '/' },
        // { label: 'Careers', route: '/' },
        // { label: 'Press', route: '/' },
      ],
    },
  ];
}
