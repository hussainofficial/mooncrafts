import { Injectable } from '@angular/core';
import { signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isLoading = signal(false);

  show() {
    console.log('🔄 Loader: Show');
    this.isLoading.set(true);
  }

  hide() {
    console.log('✅ Loader: Hide');
    this.isLoading.set(false);
  }

  toggle() {
    this.isLoading.set(!this.isLoading());
  }
}
