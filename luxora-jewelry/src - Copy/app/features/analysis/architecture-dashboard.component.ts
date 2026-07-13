import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Section {
  id: string;
  title: string;
  icon: string;
  color: string;
  count: string;
  description: string;
}

interface RoadmapPhase {
  phase: number;
  title: string;
  duration: string;
  deliverables: string[];
  status: 'completed' | 'in-progress' | 'pending';
}

@Component({
  selector: 'app-architecture-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <!-- Header -->
      <div class="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div class="max-w-7xl mx-auto px-6 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-white">LUXORA Backend Architecture</h1>
              <p class="text-slate-400 mt-2">Complete Phase 1 Analysis & Development Roadmap</p>
            </div>
            <div class="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 rounded-lg">
              <span class="text-white font-bold">📊 Analysis Complete</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-6 py-12">
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-rose-500/50 transition-all">
            <div class="text-4xl font-bold text-rose-500">16</div>
            <p class="text-slate-400 mt-2">Database Tables</p>
            <p class="text-xs text-slate-500 mt-3">Fully normalized schema</p>
          </div>
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all">
            <div class="text-4xl font-bold text-blue-500">40+</div>
            <p class="text-slate-400 mt-2">REST APIs</p>
            <p class="text-xs text-slate-500 mt-3">Complete specification</p>
          </div>
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-purple-500/50 transition-all">
            <div class="text-4xl font-bold text-purple-500">10</div>
            <p class="text-slate-400 mt-2">Development Phases</p>
            <p class="text-xs text-slate-500 mt-3">14 weeks timeline</p>
          </div>
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition-all">
            <div class="text-4xl font-bold text-green-500">12,000+</div>
            <p class="text-slate-400 mt-2">Documentation Words</p>
            <p class="text-xs text-slate-500 mt-3">Complete specification</p>
          </div>
        </div>

        <!-- Analysis Sections Grid -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6">📋 Analysis Sections</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let section of sections" class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-rose-500/50 hover:bg-slate-800/80 transition-all cursor-pointer group">
              <div class="flex items-start justify-between mb-4">
                <div class="text-4xl">{{ section.icon }}</div>
                <span [class]="'px-3 py-1 rounded-full text-xs font-semibold ' + section.color">
                  {{ section.count }}
                </span>
              </div>
              <h3 class="text-lg font-bold text-white mb-2 group-hover:text-rose-400 transition-colors">
                {{ section.title }}
              </h3>
              <p class="text-slate-400 text-sm">{{ section.description }}</p>
            </div>
          </div>
        </div>

        <!-- Technology Stack -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6">🏗️ Backend Architecture</h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Frontend Current State -->
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <h3 class="text-xl font-bold text-white mb-4">Current Frontend Stack</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">Framework</span>
                  <span class="text-rose-400 font-semibold">Angular 21.2.17</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">State Management</span>
                  <span class="text-rose-400 font-semibold">Angular Signals</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">Styling</span>
                  <span class="text-rose-400 font-semibold">Tailwind CSS</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">Components</span>
                  <span class="text-rose-400 font-semibold">40+ Standalone</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">Routes</span>
                  <span class="text-rose-400 font-semibold">14 Pages</span>
                </div>
              </div>
            </div>

            <!-- Backend Technology -->
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-8">
              <h3 class="text-xl font-bold text-white mb-4">Backend Stack (To Build)</h3>
              <div class="space-y-3">
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">Runtime</span>
                  <span class="text-blue-400 font-semibold">Node.js 22.18.0</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">Framework</span>
                  <span class="text-blue-400 font-semibold">Express.js</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">Database</span>
                  <span class="text-blue-400 font-semibold">MySQL 8.0</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">Authentication</span>
                  <span class="text-blue-400 font-semibold">JWT + bcrypt</span>
                </div>
                <div class="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                  <span class="text-slate-300">ORM</span>
                  <span class="text-blue-400 font-semibold">mysql2/promise</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bugs & Issues Found -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6">⚠️ Critical Issues Found</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <h3 class="text-lg font-bold text-red-400 mb-3">🐛 Bugs (6)</h3>
              <ul class="space-y-2 text-sm text-slate-300">
                <li>• Cart not synced across devices</li>
                <li>• Wishlist not user-specific</li>
                <li>• No inventory checks</li>
                <li>• Orders not linked to users</li>
                <li>• No session expiration</li>
                <li>• Hardcoded coupons</li>
              </ul>
            </div>
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <h3 class="text-lg font-bold text-yellow-400 mb-3">🔒 Security (5)</h3>
              <ul class="space-y-2 text-sm text-slate-300">
                <li>• No password hashing</li>
                <li>• No HTTPS enforcement</li>
                <li>• No input validation</li>
                <li>• No CSRF protection</li>
                <li>• No rate limiting</li>
              </ul>
            </div>
            <div class="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
              <h3 class="text-lg font-bold text-orange-400 mb-3">⚡ Performance (4)</h3>
              <ul class="space-y-2 text-sm text-slate-300">
                <li>• No pagination</li>
                <li>• No search indexing</li>
                <li>• No image optimization</li>
                <li>• No caching</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Development Roadmap -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6">🚀 Development Roadmap (10 Phases)</h2>
          <div class="space-y-4">
            <div *ngFor="let phase of roadmapPhases" class="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-rose-500/50 transition-all">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h3 class="text-lg font-bold text-white">
                    Phase {{ phase.phase }}: {{ phase.title }}
                  </h3>
                  <p class="text-slate-400 text-sm mt-1">⏱️ {{ phase.duration }}</p>
                </div>
                <span [ngClass]="getStatusClass(phase.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ phase.status === 'completed' ? '✅ Done' : phase.status === 'in-progress' ? '⚙️ In Progress' : '⏳ Pending' }}
                </span>
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                <div *ngFor="let deliverable of phase.deliverables" class="bg-slate-700/30 px-3 py-2 rounded text-sm text-slate-300">
                  ✓ {{ deliverable }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Database Design Summary -->
        <div class="mb-12">
          <h2 class="text-2xl font-bold text-white mb-6">📊 Database Schema (16 Tables)</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 class="text-lg font-bold text-white mb-4">Core Tables</h3>
              <ul class="space-y-2 text-slate-300">
                <li class="flex items-center"><span class="text-rose-500 mr-2">•</span> users</li>
                <li class="flex items-center"><span class="text-rose-500 mr-2">•</span> user_addresses</li>
                <li class="flex items-center"><span class="text-rose-500 mr-2">•</span> categories</li>
                <li class="flex items-center"><span class="text-rose-500 mr-2">•</span> products</li>
                <li class="flex items-center"><span class="text-rose-500 mr-2">•</span> product_images</li>
                <li class="flex items-center"><span class="text-rose-500 mr-2">•</span> product_variants</li>
                <li class="flex items-center"><span class="text-rose-500 mr-2">•</span> product_reviews</li>
              </ul>
            </div>
            <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <h3 class="text-lg font-bold text-white mb-4">Commerce Tables</h3>
              <ul class="space-y-2 text-slate-300">
                <li class="flex items-center"><span class="text-blue-500 mr-2">•</span> carts & cart_items</li>
                <li class="flex items-center"><span class="text-blue-500 mr-2">•</span> wishlist_items</li>
                <li class="flex items-center"><span class="text-blue-500 mr-2">•</span> orders & order_items</li>
                <li class="flex items-center"><span class="text-blue-500 mr-2">•</span> payments</li>
                <li class="flex items-center"><span class="text-blue-500 mr-2">•</span> coupons & coupon_usage</li>
                <li class="flex items-center"><span class="text-blue-500 mr-2">•</span> audit_logs</li>
                <li class="flex items-center"><span class="text-blue-500 mr-2">•</span> notifications</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Next Steps -->
        <div class="bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/50 rounded-xl p-8 mb-12">
          <h2 class="text-2xl font-bold text-white mb-4">📌 Next Steps</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex items-start gap-4">
              <span class="text-2xl">1️⃣</span>
              <div>
                <h3 class="text-white font-bold">Review Analysis</h3>
                <p class="text-slate-300 text-sm mt-2">Review the complete backend architecture document (12,000+ words)</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <span class="text-2xl">2️⃣</span>
              <div>
                <h3 class="text-white font-bold">Approve Architecture</h3>
                <p class="text-slate-300 text-sm mt-2">Confirm database design, API spec, security approach</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <span class="text-2xl">3️⃣</span>
              <div>
                <h3 class="text-white font-bold">Begin Phase 1</h3>
                <p class="text-slate-300 text-sm mt-2">Start with Database Schema + Authentication APIs</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Call to Action -->
        <div class="text-center">
          <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-12">
            <h2 class="text-3xl font-bold text-white mb-4">Ready to Build Backend?</h2>
            <p class="text-slate-400 text-lg mb-6">Complete Phase 1 Analysis + Database Design + API Specification</p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <button class="px-8 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg hover:shadow-rose-500/50 transition-all">
                👉 View Full Documentation
              </button>
              <button class="px-8 py-3 border-2 border-rose-500 text-rose-400 rounded-lg font-bold hover:bg-rose-500/10 transition-all">
                💬 Ask Questions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ArchitectureDashboardComponent {
  sections: Section[] = [
    {
      id: 'frontend',
      title: 'Frontend Analysis',
      icon: '🎨',
      color: 'bg-rose-500/20 text-rose-400',
      count: '40+ Components',
      description: 'Complete Angular architecture, 14 routes, Signals, Tailwind CSS',
    },
    {
      id: 'features',
      title: 'Feature Inventory',
      icon: '✨',
      color: 'bg-blue-500/20 text-blue-400',
      count: '11 Modules',
      description: 'Auth, Products, Cart, Checkout, Payments, Admin, etc.',
    },
    {
      id: 'userflows',
      title: 'User Flows',
      icon: '👥',
      color: 'bg-purple-500/20 text-purple-400',
      count: '4 Journeys',
      description: 'Guest, User, Admin flows completely mapped',
    },
    {
      id: 'requirements',
      title: 'Business Rules',
      icon: '📋',
      color: 'bg-green-500/20 text-green-400',
      count: '10 Modules',
      description: 'Complete business logic for each feature',
    },
    {
      id: 'apis',
      title: 'REST APIs',
      icon: '🔌',
      color: 'bg-yellow-500/20 text-yellow-400',
      count: '40+ Endpoints',
      description: 'Full specification with requests, responses, validation',
    },
    {
      id: 'database',
      title: 'Database Design',
      icon: '📊',
      color: 'bg-cyan-500/20 text-cyan-400',
      count: '16 Tables',
      description: 'Normalized MySQL schema with indexes and relationships',
    },
    {
      id: 'architecture',
      title: 'Backend Architecture',
      icon: '🏗️',
      color: 'bg-indigo-500/20 text-indigo-400',
      count: '5 Layers',
      description: 'Routes, Controllers, Services, Repositories, Database',
    },
    {
      id: 'security',
      title: 'Security Design',
      icon: '🔒',
      color: 'bg-orange-500/20 text-orange-400',
      count: '8 Layers',
      description: 'JWT, bcrypt, SQL injection prevention, CORS, rate limiting',
    },
    {
      id: 'roadmap',
      title: 'Development Roadmap',
      icon: '🚀',
      color: 'bg-pink-500/20 text-pink-400',
      count: '10 Phases',
      description: '14 weeks timeline with independent deliverables',
    },
    {
      id: 'audit',
      title: 'Frontend Audit',
      icon: '🔍',
      color: 'bg-red-500/20 text-red-400',
      count: '15 Issues',
      description: 'Bugs, security, performance, accessibility findings',
    },
    {
      id: 'risks',
      title: 'Risks & Solutions',
      icon: '⚠️',
      color: 'bg-amber-500/20 text-amber-400',
      count: '8 Risks',
      description: 'Scope, payments, scaling, security, data loss mitigations',
    },
    {
      id: 'future',
      title: 'Future Roadmap',
      icon: '🌟',
      color: 'bg-violet-500/20 text-violet-400',
      count: '20+ Items',
      description: 'Enhancements for months 2-12 and beyond',
    },
  ];

  roadmapPhases: RoadmapPhase[] = [
    {
      phase: 1,
      title: 'Foundation',
      duration: 'Weeks 1-2',
      deliverables: ['Database', 'Auth APIs', 'JWT', 'Users'],
      status: 'pending',
    },
    {
      phase: 2,
      title: 'Product Catalog',
      duration: 'Weeks 3-4',
      deliverables: ['Products', 'Categories', 'Search', 'Filters'],
      status: 'pending',
    },
    {
      phase: 3,
      title: 'Cart',
      duration: 'Week 5',
      deliverables: ['Add to Cart', 'Quantity', 'Clear', 'Merge'],
      status: 'pending',
    },
    {
      phase: 4,
      title: 'Wishlist',
      duration: 'Week 5',
      deliverables: ['Add/Remove', 'Get List', 'Move to Cart'],
      status: 'pending',
    },
    {
      phase: 5,
      title: 'Checkout',
      duration: 'Weeks 6-7',
      deliverables: ['Orders', 'Shipping', 'Invoice', 'Inventory'],
      status: 'pending',
    },
    {
      phase: 6,
      title: 'Payments',
      duration: 'Week 8',
      deliverables: ['Razorpay', 'Verify', 'Webhooks', 'Refunds'],
      status: 'pending',
    },
    {
      phase: 7,
      title: 'Coupons',
      duration: 'Week 9',
      deliverables: ['Validate', 'Apply', 'Track', 'Admin CRUD'],
      status: 'pending',
    },
    {
      phase: 8,
      title: 'Admin Panel',
      duration: 'Weeks 10-11',
      deliverables: ['Products', 'Categories', 'Orders', 'Users'],
      status: 'pending',
    },
    {
      phase: 9,
      title: 'Reviews & Notifications',
      duration: 'Week 12',
      deliverables: ['Reviews', 'Email', 'Notifications', 'Moderation'],
      status: 'pending',
    },
    {
      phase: 10,
      title: 'Optimization',
      duration: 'Weeks 13-14',
      deliverables: ['Caching', 'Indexing', 'Security', 'Deploy'],
      status: 'pending',
    },
  ];

  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in-progress':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'pending':
        return 'bg-slate-500/20 text-slate-400';
      default:
        return '';
    }
  }
}
