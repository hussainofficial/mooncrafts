import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { signal } from '@angular/core';
import { Product } from '../models';
import { AuthService } from './auth.service';
import { BlobImageService } from './blob-image.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly API_URL = 'http://localhost:5000/api/v1/products';
  products = signal<Product[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private blobImageService: BlobImageService
  ) {
    this.fetchAllProducts();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getPlaceholderImage(text: string = 'Product'): string {
    // Create a local SVG placeholder instead of external URL
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f3e8ff"/>
      <text x="50%" y="50%" font-size="16" font-family="Arial" fill="#9333ea" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>`;
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  private transformBackendProduct(data: any): Product {
    let imageUrl = this.getPlaceholderImage('Product');

    // Handle blob image data
    if (data.image) {
      if (data.image instanceof Blob || data.image instanceof File) {
        // Convert blob to object URL
        imageUrl = this.blobImageService.getBlobUrl(data.image, `product-${data.id}`) as string;
      } else if (typeof data.image === 'string') {
        // If it's a base64 string or data URL
        if (data.image.startsWith('data:') || data.image.startsWith('blob:')) {
          imageUrl = data.image;
        } else if (!data.image.startsWith('http')) {
          // Assume it's base64
          imageUrl = this.blobImageService.getBlobUrl(data.image, `product-${data.id}`) as string;
        } else {
          // It's a regular URL
          imageUrl = data.image;
        }
      }
    }

    return {
      id: data.id?.toString() || '',
      name: data.name || '',
      description: data.description || '',
      price: parseFloat(data.price) || 0,
      image: imageUrl,
      category: data.category_name || data.category || 'Uncategorized',
      material: data.material_name || data.material || 'Unknown',
      rating: parseFloat(data.rating) || 4.5,
      reviews: parseInt(data.reviews) || 0,
      inStock: (data.stock || 0) > 0,
      originalPrice: data.original_price,
      discount: data.discount,
      collection: data.collection,
      isTrending: data.is_trending || data.isTrending || false,
      isFeatured: data.is_featured || data.isFeatured || false,
      isNewArrival: data.is_new_arrival || data.isNewArrival || false,
      isBestSeller: data.is_best_seller || data.isBestSeller || false,
      // Store category and material IDs for form binding
      categoryId: data.category_id,
      materialId: data.material_id
    } as any;
  }

  fetchAllProducts(): Promise<void> {
    this.loading.set(true);
    const token = this.authService.getAccessToken();
    console.log('🔑 Token exists:', !!token);
    console.log('📡 Fetching from:', this.API_URL);
    console.log('📊 Signal BEFORE fetch:', this.products().length, 'products');

    return new Promise((resolve) => {
      this.http.get<any>(`${this.API_URL}`, { headers: this.getHeaders() }).subscribe({
        next: (response) => {
          console.log('✓ Raw response:', response);
          console.log('✓ Products array:', response.products);
          console.log('✓ Products count:', response.products?.length || 0);

          const transformedProducts = (response.products || []).map((p: any) => {
            const transformed = this.transformBackendProduct(p);
            return transformed;
          });

          console.log('✓ Transformed array length:', transformedProducts.length);
          console.log('✓ First product:', transformedProducts[0]);

          console.log('⚙️ BEFORE set, signal contains:', this.products().length);
          this.products.set(transformedProducts);
          console.log('⚙️ AFTER set, signal contains:', this.products().length);
          console.log('✅ VERIFY - reading signal again:', this.products().length);

          this.error.set(null);
          this.loading.set(false);
          resolve();
        },
        error: (error) => {
          console.error('✗ Failed to fetch products:', error);
          this.error.set(error.error?.message || 'Failed to load products');
          this.loading.set(false);
          resolve();
        }
      });
    });
  }

  getProducts(): Product[] {
    return this.products();
  }

  getProductById(id: string): Product | undefined {
    return this.products().find(p => p.id === id);
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.post<any>(`${this.API_URL}`, {
        name: product.name,
        description: product.description,
        price: product.price,
        category_id: product.category,
        material_id: product.material,
        image: product.image,
        stock: product.inStock ? 50 : 0,
        is_trending: product.isTrending || false,
        is_new_arrival: product.isNewArrival || false,
        is_best_seller: product.isBestSeller || false,
        is_featured: product.isFeatured || false
      }, { headers: this.getHeaders() }).subscribe({
        next: async () => {
          await this.fetchAllProducts();
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to add product:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to add product' });
        }
      });
    });
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.put<any>(`${this.API_URL}/${id}`, {
        name: updates.name,
        description: updates.description,
        price: updates.price,
        category_id: updates.category,
        material_id: updates.material,
        image: updates.image,
        stock: updates.inStock ? 50 : 0,
        status: 'active',
        is_trending: updates.isTrending || false,
        is_new_arrival: updates.isNewArrival || false,
        is_best_seller: updates.isBestSeller || false,
        is_featured: updates.isFeatured || false
      }, { headers: this.getHeaders() }).subscribe({
        next: async () => {
          console.log('✅ Product update successful, refreshing list...');
          await this.fetchAllProducts();
          console.log('✅ Product list refreshed, resolving...');
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to update product:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to update product' });
        }
      });
    });
  }

  async deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
    return new Promise((resolve) => {
      this.http.delete<any>(`${this.API_URL}/${id}`, { headers: this.getHeaders() }).subscribe({
        next: async () => {
          console.log('✅ Product delete successful, refreshing list...');
          await this.fetchAllProducts();
          console.log('✅ Product list refreshed after delete');
          resolve({ success: true });
        },
        error: (error) => {
          console.error('Failed to delete product:', error);
          resolve({ success: false, error: error.error?.message || 'Failed to delete product' });
        }
      });
    });
  }

  searchProducts(query: string): Product[] {
    const q = query.toLowerCase();
    return this.products().filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
    );
  }

  async getTopProducts(limit: number = 10, sortBy: string = 'price', order: string = 'DESC'): Promise<Product[]> {
    try {
      const response = await this.http.get<any>(
        `${this.API_URL}/admin/top-products?limit=${limit}&sortBy=${sortBy}&order=${order}`,
        { headers: this.getHeaders() }
      ).toPromise();

      if (response?.data && Array.isArray(response.data)) {
        return response.data.map((p: any) => this.transformBackendProduct(p));
      }
      return [];
    } catch (error) {
      console.error('Error fetching top products:', error);
      return [];
    }
  }
}
