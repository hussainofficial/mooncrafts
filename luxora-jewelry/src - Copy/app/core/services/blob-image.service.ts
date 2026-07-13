import { Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { signal, Signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BlobImageService {
  private blobUrls = new Map<string, string>();
  private blobSignals = new Map<string, Signal<SafeUrl | string>>();

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * Convert blob data to object URL
   * @param blobData Blob, File, or base64 string
   * @param id Unique identifier for tracking
   * @returns Safe URL for use in img src
   */
  getBlobUrl(blobData: Blob | File | string, id: string): SafeUrl | string {
    // If it's already a URL string, return it
    if (typeof blobData === 'string' && (blobData.startsWith('http') || blobData.startsWith('data:'))) {
      return blobData;
    }

    // If we've already created a URL for this ID, return it
    if (this.blobUrls.has(id)) {
      return this.blobUrls.get(id)!;
    }

    let objectUrl: string;

    if (typeof blobData === 'string') {
      // Handle base64 string
      if (blobData.startsWith('data:')) {
        objectUrl = blobData;
      } else {
        // Convert base64 to blob
        const byteCharacters = atob(blobData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        objectUrl = URL.createObjectURL(blob);
      }
    } else if (typeof blobData === 'object' && blobData !== null) {
      // Handle Blob or File object
      objectUrl = URL.createObjectURL(blobData as Blob);
    } else {
      // Fallback - return local SVG placeholder
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <rect width="400" height="400" fill="#f3e8ff"/>
        <text x="50%" y="50%" font-size="14" font-family="Arial" fill="#9333ea" text-anchor="middle" dominant-baseline="middle">No Image</text>
      </svg>`;
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }

    // Store the URL for cleanup later
    this.blobUrls.set(id, objectUrl);
    return objectUrl;
  }

  /**
   * Get a safe URL signal for blob data
   */
  getBlobUrlSignal(blobData: Blob | File | string, id: string): Signal<SafeUrl | string> {
    if (!this.blobSignals.has(id)) {
      const url = this.getBlobUrl(blobData, id);
      this.blobSignals.set(id, signal(url));
    }
    return this.blobSignals.get(id)!;
  }

  /**
   * Sanitize URL for safe use in templates
   */
  sanitizeUrl(url: string | SafeUrl): SafeUrl {
    if (typeof url === 'string') {
      return this.sanitizer.bypassSecurityTrustUrl(url);
    }
    return url;
  }

  /**
   * Release blob URL to free memory
   */
  releaseUrl(id: string): void {
    const url = this.blobUrls.get(id);
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
    this.blobUrls.delete(id);
    this.blobSignals.delete(id);
  }

  /**
   * Release all blob URLs
   */
  releaseAllUrls(): void {
    this.blobUrls.forEach((url) => {
      if (url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
    this.blobUrls.clear();
    this.blobSignals.clear();
  }

  /**
   * Convert file to base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Get only the base64 part
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert blob to base64
   */
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Get only the base64 part
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}
