import { Component, OnInit, AfterViewInit, signal, ViewChild, ElementRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { UserService } from '../../core/services/user.service';
import { HeaderComponent } from '../home/components/header.component';
import { CartDrawerComponent } from '../../shared/components/cart-drawer.component';
import { WishlistDrawerComponent } from '../../shared/components/wishlist-drawer.component';
import { Product } from '../../core/models';

// Import Drift.js zoom library
import Drift from 'drift-zoom';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, CartDrawerComponent, WishlistDrawerComponent],
  template: `
    <!-- Full Navigation Header -->
    <app-header (openWishlistDrawer)="openWishlistDrawer()"></app-header>

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
        <div class="grid grid-cols-2 gap-8">
          <!-- Image Section - Main Image (Left) with Drift Zoom -->
          <div class="space-y-4">
            <!-- Main Image with Drift.js Zoom -->
            <div class="bg-white rounded-lg overflow-hidden shadow-lg">
              <img
                #productImage
                [src]="product()?.image"
                [alt]="product()?.name"
                class="w-full aspect-square object-cover cursor-crosshair"
                style="display: block;">
            </div>

            <!-- Thumbnail Gallery -->
            <div class="flex gap-2">
              <div class="w-20 h-20 bg-white rounded-lg shadow cursor-pointer border-2 border-rose-500 overflow-hidden">
                <img [src]="product()?.image" [alt]="product()?.name" class="w-full h-full object-cover">
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
          <div class="grid grid-cols-4 gap-6">
            <div *ngFor="let item of relatedProducts()" class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer">
              <div class="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover hover:scale-110 transition-transform duration-300">
              </div>
              <div class="p-4">
                <h3 class="font-semibold text-gray-900 text-sm mb-1">{{ item.name }}</h3>
                <p class="text-rose-600 font-bold">₹{{ item.price }}</p>
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

    <!-- Cart Drawer -->
    <app-cart-drawer
      [isOpen]="showCartDrawer()"
      [currentProduct]="selectedProductForCart()"
      (closed)="closeCartDrawer()">
    </app-cart-drawer>

    <!-- Wishlist Drawer -->
    <app-wishlist-drawer
      [isOpen]="showWishlistDrawer()"
      (closed)="closeWishlistDrawer()"
      (openCart)="closeWishlistDrawer()">
    </app-wishlist-drawer>
  `,
  styles: [`
    .aspect-square {
      aspect-ratio: 1;
    }
  `]
})
export class ProductDetailsComponent implements OnInit, AfterViewInit {
  @ViewChild('productImage') productImage!: ElementRef<HTMLImageElement>;

  product = signal<Product | null>(null);
  relatedProducts = signal<Product[]>([]);
  showCartDrawer = signal(false);
  showWishlistDrawer = signal(false);
  selectedProductForCart = signal<Product | null>(null);

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
        const allProducts = this.productService.getProducts();
        const found = allProducts.find(p => p.id === id);
        this.product.set(found || null);

        if (found) {
          this.relatedProducts.set(
            allProducts
              .filter(p => p.category === found.category && p.id !== found.id)
              .slice(0, 4)
          );
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
      this.selectedProductForCart.set(this.product());
      this.showCartDrawer.set(true);
    }
  }

  closeCartDrawer() {
    this.showCartDrawer.set(false);
    setTimeout(() => {
      this.selectedProductForCart.set(null);
    }, 300);
  }

  toggleWishlist() {
    if (this.product()) {
      this.userService.toggleWishlist(this.product()!.id);
    }
  }

  openWishlistDrawer() {
    this.showWishlistDrawer.set(true);
  }

  closeWishlistDrawer() {
    this.showWishlistDrawer.set(false);
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
}
