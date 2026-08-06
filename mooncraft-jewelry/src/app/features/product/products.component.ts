import { Component, OnInit, OnDestroy, signal, computed, effect, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { CollectionService } from '../../core/services/collection.service';
import { MaterialService } from '../../core/services/material.service';
import { CategoryService } from '../../core/services/category.service';
import { CartService } from '../../core/services/cart.service';
import { UserService } from '../../core/services/user.service';
import { Product } from '../../core/models';
import { HeaderComponent } from '../home/components/header.component';
import { FooterComponent } from '../home/components/footer.component';
import { ProductGridComponent } from '../../shared/components/product-grid.component';

const FILTER_LABELS: Record<string, string> = {
  trending: 'Trending Now',
  'new-arrivals': 'New Arrivals',
  'best-sellers': 'Best Sellers',
  featured: 'Coming Soon Products',
};

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, HeaderComponent, FooterComponent, ProductGridComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-header></app-header>

    <div class="min-h-screen bg-gray-50">
      <!-- Page Title -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">{{ pageTitle() }}</h1>
          <p *ngIf="pageSubtitle()" class="text-sm text-gray-600 mt-2">{{ pageSubtitle() }}</p>
        </div>
      </div>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <!-- Loading State -->
        <div *ngIf="productService.loading()" class="text-center py-16">
          <p class="text-gray-600">Loading products...</p>
        </div>

        <!-- Empty State -->
        <div *ngIf="!productService.loading() && filteredProducts().length === 0" class="text-center py-16">
          <p class="text-gray-600">No products found.</p>
        </div>

        <!-- Products Grid -->
        <ng-container *ngIf="!productService.loading() && filteredProducts().length > 0">
          <app-product-grid
            [products]="pagedProducts()"
            (addToCart)="onAddToCart($event)"
            (wishlistToggle)="onWishlistToggle($event)"
          ></app-product-grid>

          <!-- Pagination -->
          <div *ngIf="totalPages() > 1" class="flex items-center justify-center gap-4 mt-10">
            <button
              (click)="goToPage(currentPage() - 1)"
              [disabled]="currentPage() === 1"
              class="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              ← Prev
            </button>
            <span class="text-sm text-gray-600">Page {{ currentPage() }} of {{ totalPages() }}</span>
            <button
              (click)="goToPage(currentPage() + 1)"
              [disabled]="currentPage() === totalPages()"
              class="px-4 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next →
            </button>
          </div>
        </ng-container>
      </div>
    </div>

    <app-footer></app-footer>
  `,
})
export class ProductsComponent implements OnInit, OnDestroy {
  pageTitle = signal('All Products');
  pageSubtitle = signal('');
  filteredProducts = signal<Product[]>([]);
  currentPage = signal(1);
  readonly pageSize = 12;

  totalPages = computed(() => Math.max(1, Math.ceil(this.filteredProducts().length / this.pageSize)));
  pagedProducts = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredProducts().slice(start, start + this.pageSize);
  });

  private subscriptions = new Subscription();

  constructor(
    public productService: ProductService,
    private collectionService: CollectionService,
    private materialService: MaterialService,
    private categoryService: CategoryService,
    public cartService: CartService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Re-apply the current filter whenever the product list (re)loads from the API
    effect(() => {
      this.productService.products();
      this.refresh();
    });
  }

  ngOnInit() {
    this.subscriptions.add(this.route.paramMap.subscribe(() => this.refresh()));
    this.subscriptions.add(this.route.queryParamMap.subscribe(() => this.refresh()));
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  private refresh() {
    const collectionId = this.route.snapshot.paramMap.get('id');
    const categoryId = this.route.snapshot.paramMap.get('categoryId');
    const materialId = this.route.snapshot.queryParamMap.get('material');
    const categorySlug = this.route.snapshot.queryParamMap.get('category');
    const filter = this.route.snapshot.queryParamMap.get('filter');

    if (collectionId) {
      this.loadCollection(collectionId);
    } else if (categoryId) {
      this.loadCategoryById(categoryId);
    } else if (materialId) {
      this.loadMaterial(materialId);
    } else if (categorySlug) {
      this.loadCategory(categorySlug);
    } else if (filter) {
      this.loadFilter(filter);
    } else {
      this.pageTitle.set('All Products');
      this.pageSubtitle.set('');
      this.applyFilter(() => true);
    }
  }

  private loadCollection(id: string) {
    this.collectionService.getCollectionById(id)
      .then((collection) => {
        this.pageTitle.set(collection?.name || 'Collection');
        this.pageSubtitle.set(collection?.description || '');
        const name = (collection?.name || '').toLowerCase();
        this.applyFilter((p) =>
          !!name &&
          (p.category.toLowerCase().includes(name) ||
            p.name.toLowerCase().includes(name) ||
            (p.collection || '').toLowerCase().includes(name))
        );
      })
      .catch(() => {
        this.pageTitle.set('Collection');
        this.pageSubtitle.set('');
        this.applyFilter(() => true);
      });
  }

  private loadMaterial(id: string) {
    this.materialService.getMaterialById(id)
      .then((material) => {
        this.pageTitle.set(material?.name ? `${material.name} Jewelry` : 'Material');
        this.pageSubtitle.set(material?.description || '');
        const name = (material?.name || '').toLowerCase();
        this.applySortFirst((p) =>
          (p as any).materialId?.toString() === id.toString() ||
          (!!name && p.material.toLowerCase() === name)
        );
      })
      .catch(() => {
        this.pageTitle.set('Material');
        this.pageSubtitle.set('');
        this.applyFilter(() => true);
      });
  }

  private loadCategory(slug: string) {
    const readable = slug.replace(/-/g, ' ');
    this.pageTitle.set(readable.replace(/\b\w/g, (c) => c.toUpperCase()));
    this.pageSubtitle.set('');
    const normalized = slug.toLowerCase();
    this.applyFilter((p) => {
      const categoryNormalized = p.category.toLowerCase().replace(/\s+/g, '-');
      return categoryNormalized === normalized || p.category.toLowerCase() === readable.toLowerCase();
    });
  }

  private loadCategoryById(categoryId: string) {
    const category = this.categoryService.getCategories().find(c => c.id.toString() === categoryId)
      || this.categoryService.getMaterials().find(c => c.id.toString() === categoryId);
    this.pageTitle.set(category?.name || 'Category');
    this.pageSubtitle.set(category?.description || '');
    this.applyFilter((p) => (p as any).categoryId?.toString() === categoryId.toString());
  }

  private loadFilter(filter: string) {
    this.pageTitle.set(FILTER_LABELS[filter] || 'All Products');
    this.pageSubtitle.set('');
    const predicates: Record<string, (p: Product) => boolean> = {
      trending: (p) => !!p.isTrending,
      'new-arrivals': (p) => !!p.isNewArrival,
      'best-sellers': (p) => !!p.isBestSeller,
      featured: (p) => !!p.isFeatured,
    };
    this.applyFilter(predicates[filter] || (() => true));
  }

  private applyFilter(predicate: (p: Product) => boolean) {
    const all = this.productService.getProducts();
    const matched = all.filter(predicate);
    this.filteredProducts.set(matched.length > 0 ? matched : all);
    this.currentPage.set(1);
    this.cdr.markForCheck();
  }

  private applySortFirst(predicate: (p: Product) => boolean) {
    const all = this.productService.getProducts();
    const matched = all.filter(predicate);
    const rest = all.filter((p) => !predicate(p));
    this.filteredProducts.set([...matched, ...rest]);
    this.currentPage.set(1);
    this.cdr.markForCheck();
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.currentPage.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAddToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  onWishlistToggle(product: Product) {
    this.userService.toggleWishlist(product.id);
  }
}
