import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  isLoading = signal(false);
  loadingMessage = signal('Loading...');
  progress = signal(0);
  private progressInterval: any;

  show(message: string = 'Loading...', showProgress: boolean = true) {
    console.log('🔄 Loader: Show -', message);
    this.loadingMessage.set(message);
    this.isLoading.set(true);

    if (showProgress) {
      this.startProgressAnimation();
    } else {
      this.progress.set(0);
    }
  }

  hide() {
    console.log('✅ Loader: Hide');
    this.isLoading.set(false);
    this.clearProgressAnimation();
    this.progress.set(0);
    this.loadingMessage.set('Loading...');
  }

  setProgress(value: number) {
    const clamped = Math.min(Math.max(value, 0), 100);
    this.progress.set(clamped);
  }

  complete() {
    this.progress.set(100);
    setTimeout(() => {
      this.hide();
    }, 300);
  }

  private startProgressAnimation() {
    this.clearProgressAnimation();
    this.progress.set(10);

    this.progressInterval = setInterval(() => {
      const current = this.progress();
      if (current < 90) {
        // Slow down as we approach 90%
        const increment = current < 30 ? 15 : current < 60 ? 10 : 5;
        this.progress.set(current + increment);
      }
    }, 300);
  }

  private clearProgressAnimation() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }
}
