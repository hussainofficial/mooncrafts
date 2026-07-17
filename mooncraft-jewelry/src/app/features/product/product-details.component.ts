import { Component, OnInit, AfterViewInit, signal, ViewChild, ElementRef, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { UserService } from '../../core/services/user.service';
import { HeaderComponent } from '../home/components/header.component';
import { Product } from '../../core/models';

// Import Drift.js zoom library
import Drift from 'drift-zoom';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Full Navigation Header -->
    <app-header></app-header>

    <div class="min-h-screen bg-gray-50">
      <!-- Back Button Bar -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 py-4">
          <button
            (click)="goBack()"
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold">
            ← Back to Home
          </button>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 py-8" *ngIf="product()">
        <div class="grid grid-cols-2 gap-8 lg:gap-12">
          <!-- Image Section - Gallery (Left) -->
          <div class="space-y-4">
            <!-- Main Image with Drift.js Zoom -->
            <div class="bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                #productImage
                [src]="getCurrentImage()"
                [alt]="product()?.name"
                class="w-full aspect-square object-cover cursor-crosshair"
                style="display: block;">
            </div>

            <!-- Thumbnail Gallery -->
            <div class="flex gap-2 overflow-x-auto pb-2">
              <!-- Main image thumbnail -->
              <div
                (click)="selectImage(-1)"
                [class.border-rose-500]="selectedImageIndex() === -1"
                [class.border-gray-300]="selectedImageIndex() !== -1"
                class="w-20 h-20 flex-shrink-0 bg-white rounded-lg shadow cursor-pointer border-2 overflow-hidden hover:border-rose-400 transition-all">
                <img [src]="product()?.image" [alt]="product()?.name" class="w-full h-full object-cover">
              </div>

              <!-- Additional images from gallery -->
              <div
                *ngFor="let img of product()?.images; let i = index"
                (click)="selectImage(i)"
                [class.border-rose-500]="selectedImageIndex() === i"
                [class.border-gray-300]="selectedImageIndex() !== i"
                class="w-20 h-20 flex-shrink-0 bg-white rounded-lg shadow cursor-pointer border-2 overflow-hidden hover:border-rose-400 transition-all relative group">
                <img [src]="img" [alt]="'Image ' + (i + 1)" class="w-full h-full object-cover">
                <span class="absolute top-1 right-1 bg-gray-900 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {{ i + 1 }}
                </span>
              </div>
            </div>

            <!-- Image counter -->
            <div *ngIf="product()?.images && product()!.images!.length > 0" class="text-center text-sm text-gray-600">
              {{ selectedImageIndex() === -1 ? 'Main' : 'Image ' + (selectedImageIndex() + 1) }} / {{ 1 + (product()?.images?.length || 0) }}
            </div>

            <!-- Fullscreen Button -->
            <button
              (click)="openImageModal()"
              class="w-full mt-2 px-4 py-2 text-sm text-rose-600 hover:text-rose-700 font-semibold border border-rose-300 rounded-lg hover:bg-rose-50 transition-colors">
              🔍 View Full Size
            </button>
          </div>

          <!-- Image Modal (Lightbox) -->
          <div *ngIf="showImageModal()" class="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-2 sm:p-4">
            <!-- Close Button -->
            <button
              (click)="closeImageModal()"
              class="absolute top-4 left-4 text-white hover:text-gray-300 text-2xl sm:text-3xl font-bold transition-colors">
              ✕
            </button>

            <!-- Main Image Container -->
            <div class="relative w-full max-w-4xl">
              <!-- Main Image -->
              <img
                [src]="getCurrentImage()"
                [alt]="product()?.name"
                class="w-full h-auto max-h-[70vh] object-contain">

              <!-- Left Arrow -->
              <button
                (click)="prevImage()"
                class="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-12 sm:-translate-x-16 text-white hover:text-gray-300 transition-colors">
                <span class="text-3xl sm:text-5xl font-bold">‹</span>
              </button>

              <!-- Right Arrow -->
              <button
                (click)="nextImage()"
                class="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-12 sm:translate-x-16 text-white hover:text-gray-300 transition-colors">
                <span class="text-3xl sm:text-5xl font-bold">›</span>
              </button>

              <!-- Image Counter -->
              <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded text-sm">
                {{ selectedImageIndex() === -1 ? '1' : selectedImageIndex() + 2 }} / {{ 1 + (product()?.images?.length || 0) }}
              </div>
            </div>

            <!-- Thumbnails at Bottom -->
            <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div class="flex justify-center gap-2 flex-wrap">
                <!-- Main image thumbnail -->
                <button
                  (click)="selectImage(-1)"
                  [class.ring-2]="selectedImageIndex() === -1"
                  class="w-12 h-12 sm:w-16 sm:h-16 rounded border border-white/30 hover:border-white overflow-hidden transition-all">
                  <img [src]="product()?.image" [alt]="product()?.name" class="w-full h-full object-cover">
                </button>

                <!-- Additional images thumbnails -->
                <button
                  *ngFor="let img of product()?.images; let i = index"
                  (click)="selectImage(i)"
                  [class.ring-2]="selectedImageIndex() === i"
                  class="w-12 h-12 sm:w-16 sm:h-16 rounded border border-white/30 hover:border-white overflow-hidden transition-all">
                  <img [src]="img" [alt]="'Image ' + (i + 1)" class="w-full h-full object-cover">
                </button>
              </div>
            </div>
          </div>

          <!-- Details Section (Right) -->
          <div class="space-y-6">
            <!-- Title & Rating -->
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product()?.name }}</h1>
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1">
                  <span class="text-yellow-400 text-lg">★</span>
                  <span class="font-semibold text-gray-900">{{ product()?.rating }}</span>
                  <span class="text-gray-600 text-sm">({{ product()?.reviews }} reviews)</span>
                </div>
              </div>
            </div>

            <!-- Price Section -->
            <div class="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-lg">
              <div class="flex items-baseline gap-4 mb-4">
                <span class="text-4xl font-bold text-rose-600">₹{{ product()?.price }}</span>
                <span *ngIf="product()?.originalPrice && (product()?.originalPrice ?? 0) > (product()?.price ?? 0)" class="text-xl text-gray-500 line-through">
                  ₹{{ product()?.originalPrice }}
                </span>
              </div>
              <div *ngIf="product()?.discount" class="flex items-center gap-2">
                <span class="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {{ product()?.discount }}% OFF
                </span>
                <span class="text-green-600 font-semibold">Save ₹{{ getSavingsAmount() }}</span>
              </div>
            </div>

            <!-- Stock Status -->
            <div class="flex items-center gap-3">
              <div [class.bg-green-100]="product()?.inStock" [class.bg-red-100]="!product()?.inStock" class="px-4 py-2 rounded-lg">
                <span [class.text-green-700]="product()?.inStock" [class.text-red-700]="!product()?.inStock" class="font-semibold">
                  {{ product()?.inStock ? '✓ In Stock' : '✗ Out of Stock' }}
                </span>
              </div>
            </div>

            <!-- Product Details -->
            <div class="border-t border-b py-6 space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <p class="text-gray-600 text-sm">Category</p>
                  <p class="font-semibold text-gray-900">{{ product()?.category }}</p>
                </div>
                <div>
                  <p class="text-gray-600 text-sm">Material</p>
                  <p class="font-semibold text-gray-900">{{ product()?.material }}</p>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div>
              <h3 class="font-bold text-gray-900 mb-2">Description</h3>
              <p class="text-gray-600 leading-relaxed">{{ product()?.description }}</p>
            </div>

            <!-- Special Tags -->
            <div class="flex gap-2" *ngIf="product()?.isNewArrival">
              <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                🆕 New Arrival
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="flex gap-4">
              <button
                [disabled]="!product()?.inStock"
                (click)="addToCart()"
                class="flex-1 bg-rose-500 text-white py-3 rounded-lg font-bold hover:bg-rose-600 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2">
                🛒 Add to Cart
              </button>
              <button
                (click)="toggleWishlist()"
                [class.bg-rose-100]="isInWishlist()"
                [class.text-rose-600]="isInWishlist()"
                [class.bg-gray-100]="!isInWishlist()"
                [class.text-gray-700]="!isInWishlist()"
                class="flex-1 py-3 rounded-lg font-bold hover:bg-opacity-80 transition-colors flex items-center justify-center gap-2">
                {{ isInWishlist() ? '❤️ In Wishlist' : '🤍 Add to Wishlist' }}
              </button>
            </div>

            <!-- Share Section -->
            <div class="bg-gray-100 p-4 rounded-lg">
              <p class="text-sm text-gray-600 mb-2">Share this product:</p>
              <div class="flex gap-2">
                <button class="p-2 bg-white rounded hover:bg-gray-200">📌</button>
                <button class="p-2 bg-white rounded hover:bg-gray-200">📧</button>
                <button class="p-2 bg-white rounded hover:bg-gray-200">🔗</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Products (Optional) -->
        <div class="mt-16 border-t pt-12 col-span-12">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">You might also like</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div *ngFor="let item of relatedProducts()"
              class="bg-white rounded-lg shadow hover:shadow-xl transition-all duration-300 overflow-hidden group relative">

              <!-- Product Image Container -->
              <div class="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
                <img
                  [src]="item.image"
                  [alt]="item.name"
                  (click)="goToProduct(item.id)"
                  class="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer">

                <!-- Wishlist Button (Top Right) -->
                <button
                  (click)="toggleRelatedWishlist(item.id, $event)"
                  class="absolute top-2 right-2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-rose-100 transition-colors z-10"
                  [class.bg-rose-100]="isRelatedInWishlist(item.id)"
                  [class.text-rose-600]="isRelatedInWishlist(item.id)"
                  [class.text-gray-700]="!isRelatedInWishlist(item.id)">
                  <span class="text-lg">{{ isRelatedInWishlist(item.id) ? '❤️' : '🤍' }}</span>
                </button>
              </div>

              <!-- Product Details -->
              <div class="p-4 space-y-3">
                <!-- Product Name & Price -->
                <div (click)="goToProduct(item.id)" class="cursor-pointer hover:opacity-80 transition-opacity">
                  <h3 class="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">{{ item.name }}</h3>
                  <div class="flex items-center gap-2 mb-2">
                    <span class="text-yellow-400">★</span>
                    <span class="font-semibold text-gray-900 text-sm">{{ item.rating }}</span>
                    <span class="text-gray-500 text-xs">({{ item.reviews }})</span>
                  </div>
                  <p class="text-rose-600 font-bold text-lg">₹{{ item.price }}</p>
                </div>

                <!-- Add to Cart Button (appears on hover) -->
                <button
                  (click)="addRelatedToCart(item, $event)"
                  class="w-full bg-rose-500 text-white py-2 rounded-lg font-semibold hover:bg-rose-600 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
                  <span>🛒</span>
                  <span>Add to Cart</span>
                </button>

                <!-- View Details Link -->
                <button
                  (click)="goToProduct(item.id)"
                  class="w-full text-center text-rose-600 font-semibold text-sm hover:underline py-1 opacity-0 group-hover:opacity-100">
                  View Details →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="!product()" class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <p class="text-gray-600 text-lg">Product not found</p>
          <a routerLink="/" class="inline-block mt-4 px-6 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600">
            Back to Home
          </a>
        </div>
      </div>
    </div>

  `,
  styles: [`
    .aspect-square {
      aspect-ratio: 1;
    }

    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('productImage') productImage!: ElementRef<HTMLImageElement>;

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  selectedImageIndex = signal<number>(-1);
  showImageModal = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    public userService: UserService,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        const loadProductData = async () => {
          // Load product with gallery images
          const product = await this.productService.getProductWithGallery(id);
          this.product.set(product);

          if (product) {
            const allProducts = this.productService.products();
            this.relatedProducts.set(
              allProducts
                .filter(p => p.category === product.category && p.id !== product.id)
                .slice(0, 4)
            );
          }
        };

        // If products are already loaded, use them
        if (this.productService.products().length > 0) {
          loadProductData();
        } else {
          // Wait for products to load
          const interval = setInterval(() => {
            if (this.productService.products().length > 0) {
              clearInterval(interval);
              loadProductData();
            }
          }, 100);

          // Timeout after 5 seconds
          setTimeout(() => clearInterval(interval), 5000);
        }
      }
    });
  }

  ngAfterViewInit() {
    // Initialize Drift.js zoom on product image
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.productImage?.nativeElement) {
          console.log('🔍 Initializing Drift.js zoom on image:', this.productImage.nativeElement.src);
          try {
            const driftElement = this.productImage.nativeElement;

            new Drift(driftElement, {
              paneWidth: 350,
              paneHeight: 350,
              inlinePane: false,
              containInline: false,
              sourceAttribute: 'src',
              zoomFactor: 2.5,
              onShow: function() {
                const pane = document.querySelector('.drift-pane') as HTMLElement;
                if (pane) {
                  pane.style.position = 'absolute';
                  pane.style.top = '0';
                  pane.style.left = (driftElement.offsetWidth + 15) + 'px';
                  pane.style.display = 'block';
                }
              }
            });
            console.log('✅ Drift.js initialized with RIGHT SIDE zoom panel');
          } catch (error) {
            console.error('❌ Error initializing Drift.js:', error);
          }
        }
      }, 100);
    });
  }


  getSavingsAmount(): number {
    const prod = this.product();
    if (!prod?.originalPrice || !prod?.price) return 0;
    return prod.originalPrice - prod.price;
  }

  addToCart() {
    if (this.product()) {
      this.cartService.addToCart(this.product()!);
    }
  }

  toggleWishlist() {
    if (this.product()) {
      this.userService.toggleWishlist(this.product()!.id);
    }
  }

  isInWishlist(): boolean {
    if (this.product()) {
      return this.userService.isInWishlist(this.product()!.id);
    }
    return false;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  getCurrentImage(): string {
    const prod = this.product();
    if (!prod) return '';

    const index = this.selectedImageIndex();
    if (index === -1) {
      return prod.image;
    }

    return prod.images && prod.images[index] ? prod.images[index] : prod.image;
  }

  selectImage(index: number) {
    this.selectedImageIndex.set(index);

    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (this.productImage?.nativeElement) {
          try {
            new Drift(this.productImage.nativeElement, {
              paneWidth: 350,
              paneHeight: 350,
              inlinePane: false,
              containInline: false,
              sourceAttribute: 'src',
              zoomFactor: 2.5,
              onShow: function() {
                const pane = document.querySelector('.drift-pane') as HTMLElement;
                if (pane) {
                  pane.style.position = 'absolute';
                  pane.style.top = '0';
                  pane.style.left = (this.productImage.nativeElement.offsetWidth + 15) + 'px';
                  pane.style.display = 'block';
                }
              }
            });
          } catch (error) {
            console.log('Drift already initialized or error:', error);
          }
        }
      }, 100);
    });
  }

  goToProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  addRelatedToCart(item: Product, event: Event) {
    event.stopPropagation();
    this.cartService.addToCart(item);
  }

  toggleRelatedWishlist(productId: string, event: Event) {
    event.stopPropagation();
    this.userService.toggleWishlist(productId);
  }

  isRelatedInWishlist(productId: string): boolean {
    return this.userService.isInWishlist(productId);
  }

  openImageModal() {
    this.showImageModal.set(true);
  }

  closeImageModal() {
    this.showImageModal.set(false);
  }

  nextImage() {
    const prod = this.product();
    if (!prod) return;

    const currentIndex = this.selectedImageIndex();
    const maxIndex = (prod.images?.length || 0);

    if (currentIndex === -1) {
      this.selectImage(0);
    } else if (currentIndex < maxIndex - 1) {
      this.selectImage(currentIndex + 1);
    } else {
      this.selectImage(-1);
    }
  }

  prevImage() {
    const prod = this.product();
    if (!prod) return;

    const currentIndex = this.selectedImageIndex();
    const maxIndex = (prod.images?.length || 0);

    if (currentIndex === -1) {
      this.selectImage(maxIndex - 1);
    } else if (currentIndex > 0) {
      this.selectImage(currentIndex - 1);
    } else {
      this.selectImage(-1);
    }
  }
}
