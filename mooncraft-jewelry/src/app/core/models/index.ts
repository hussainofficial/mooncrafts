export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating: number;
  reviews: number;
  category: string;
  material: string;
  collection?: string;
  colors?: string[];
  sizes?: string[];
  isTrending?: boolean;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  discount?: number;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  productCount?: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  cta: string;
  ctaLink: string;
  order: number;
}

export interface AnnouncementItem {
  id: string;
  icon: string;
  text: string;
  order: number;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
  image?: string;
  date?: string;
}

export interface Material {
  id: string;
  name: string;
  image: string;
  slug: string;
}

export interface NavLink {
  label: string;
  route: string;
  children?: NavLink[];
}
