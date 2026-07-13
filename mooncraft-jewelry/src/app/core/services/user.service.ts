import { Injectable } from '@angular/core';
import { signal, computed } from '@angular/core';

export interface UserProfile {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  registeredDate: string;
  orders: Order[];
  wishlist: string[]; // product IDs
}

export interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'shipped' | 'delivered';
  shippingAddress: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly STORAGE_KEY = 'mooncraft_users';
  private readonly WISHLIST_KEY = 'mooncraft_wishlist';

  users = signal<UserProfile[]>([]);
  currentUserProfile = signal<UserProfile | null>(null);
  wishlistItems = signal<string[]>([]);
  wishlistCount = computed(() => this.wishlistItems().length);

  constructor() {
    this.loadUsers();
    this.loadWishlist();
  }

  private loadUsers() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.users.set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    }
  }

  private loadWishlist() {
    try {
      const saved = localStorage.getItem(this.WISHLIST_KEY);
      if (saved) {
        this.wishlistItems.set(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load wishlist:', e);
    }
  }

  private saveUsers() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.users()));
  }

  private saveWishlist() {
    localStorage.setItem(this.WISHLIST_KEY, JSON.stringify(this.wishlistItems()));
  }

  registerUser(email: string, password: string, name: string, phone: string, address: string, city: string, postalCode: string, country: string): boolean {
    if (!email || !password || !name) return false;

    // Check if user already exists
    if (this.users().find(u => u.email === email)) {
      return false;
    }

    const newUser: UserProfile = {
      id: Date.now().toString(),
      email,
      password,
      name,
      phone,
      address,
      city,
      postalCode,
      country,
      registeredDate: new Date().toISOString(),
      orders: [],
      wishlist: [],
    };

    const updated = [...this.users(), newUser];
    this.users.set(updated);
    this.saveUsers();
    this.currentUserProfile.set(newUser);

    return true;
  }

  loginUser(email: string, password: string): UserProfile | null {
    const user = this.users().find(u => u.email === email && u.password === password);
    if (user) {
      this.currentUserProfile.set(user);
      return user;
    }
    return null;
  }

  getUserById(userId: string): UserProfile | undefined {
    return this.users().find(u => u.id === userId);
  }

  updateUserProfile(userId: string, updates: Partial<UserProfile>): boolean {
    const users = this.users();
    const index = users.findIndex(u => u.id === userId);
    if (index === -1) return false;

    users[index] = { ...users[index], ...updates };
    this.users.set([...users]);
    this.saveUsers();

    if (this.currentUserProfile()?.id === userId) {
      this.currentUserProfile.set(users[index]);
    }

    return true;
  }

  addToWishlist(productId: string): boolean {
    const wishlist = this.wishlistItems();
    if (!wishlist.includes(productId)) {
      this.wishlistItems.set([...wishlist, productId]);
      this.saveWishlist();
      return true;
    }
    return false;
  }

  removeFromWishlist(productId: string): boolean {
    const wishlist = this.wishlistItems().filter(id => id !== productId);
    this.wishlistItems.set(wishlist);
    this.saveWishlist();
    return true;
  }

  isInWishlist(productId: string): boolean {
    return this.wishlistItems().includes(productId);
  }

  toggleWishlist(productId: string): void {
    if (this.isInWishlist(productId)) {
      this.removeFromWishlist(productId);
    } else {
      this.addToWishlist(productId);
    }
  }

  getWishlistItems(): string[] {
    return this.wishlistItems();
  }

  addOrder(userId: string, order: Order): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    const updatedOrders = [...user.orders, order];
    return this.updateUserProfile(userId, { orders: updatedOrders });
  }

  getAllUsers(): UserProfile[] {
    return this.users();
  }

  logoutUser() {
    this.currentUserProfile.set(null);
  }
}
