import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeImage',
  standalone: true
})
export class SafeImagePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: any): SafeUrl | string {
    if (!value) {
      return 'data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%22400%22%20height=%22400%22%20viewBox=%220%200%20400%20400%22%3E%3Crect%20width=%22400%22%20height=%22400%22%20fill=%22%23f3e8ff%22/%3E%3Ctext%20x=%2250%25%22%20y=%2250%25%22%20font-size=%2214%22%20font-family=%22Arial%22%20fill=%22%239333ea%22%20text-anchor=%22middle%22%20dominant-baseline=%22middle%22%3ENo%20Image%3C/text%3E%3C/svg%3E';
    }

    // If it's a string (URL or data URL), return it directly
    if (typeof value === 'string') {
      if (value.startsWith('data:') || value.startsWith('blob:') || value.startsWith('http')) {
        return this.sanitizer.bypassSecurityTrustUrl(value);
      }
      // Assume it's base64, convert to data URL
      return this.sanitizer.bypassSecurityTrustUrl(`data:image/jpeg;base64,${value}`);
    }

    // If it's a Blob or File, convert to object URL
    if (value instanceof Blob || value instanceof File) {
      const objectUrl = URL.createObjectURL(value);
      return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f3e8ff"/>
      <text x="50%" y="50%" font-size="14" font-family="Arial" fill="#9333ea" text-anchor="middle" dominant-baseline="middle">Invalid Image</text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }
}
