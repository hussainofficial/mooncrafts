import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="py-12 md:py-16 px-4 bg-gradient-to-r from-rose-100 to-pink-100">
      <div class="max-w-2xl mx-auto">
        <div class="text-center">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Join Our Newsletter</h2>
          <p class="text-gray-700 mb-8">
            Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
          </p>

          <!-- Newsletter Form -->
          <form (submit)="onSubscribe()" class="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="Enter your email"
              class="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
              required
            />
            <button
              type="submit"
              class="bg-rose-500 hover:bg-rose-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Subscribe
            </button>
          </form>

          <!-- Privacy Note -->
          <p class="text-xs text-gray-600 mt-4">
            We respect your privacy. You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  `,
})
export class NewsletterComponent {
  email = '';

  onSubscribe() {
    if (this.email) {
      // TODO: Send to backend API
      console.log('Subscribe:', this.email);
      this.email = '';
      // Show success message
    }
  }
}
