import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="bg-gray-900 text-gray-300">
      <!-- Main Footer -->
      <div class="max-w-7xl mx-auto px-4 py-12">
        <div class="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
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
                <a [href]="link.href" class="hover:text-rose-400 transition-colors">
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
        { label: 'All Products', href: '#' },
        { label: 'New Arrivals', href: '#' },
        { label: 'Best Sellers', href: '#' },
        { label: 'Sale', href: '#' },
      ],
    },
    {
      title: 'COLLECTIONS',
      links: [
        { label: 'Bridal Collection', href: '#' },
        { label: 'Party Wear', href: '#' },
        { label: 'Daily Wear', href: '#' },
        { label: 'Office Wear', href: '#' },
      ],
    },
    {
      title: 'CUSTOMER SERVICE',
      links: [
        { label: 'Track Order', href: '#' },
        { label: 'Returns & Exchanges', href: '#' },
        { label: 'Shipping Policy', href: '#' },
        { label: 'Contact Us', href: '#' },
      ],
    },
    {
      title: 'COMPANY',
      links: [
        { label: 'About Us', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Press', href: '#' },
      ],
    },
  ];
}
