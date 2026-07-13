import { Injectable } from '@angular/core';
import {
  Product,
  Category,
  Collection,
  Banner,
  AnnouncementItem,
  Review,
  Material,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class MockDataService {
  getAnnouncements(): AnnouncementItem[] {
    return [
      {
        id: '1',
        icon: 'truck',
        text: 'Free Shipping on orders above ₹999',
        order: 1,
      },
      {
        id: '2',
        icon: 'gift',
        text: '30% Off on Prepaid Orders',
        order: 2,
      },
      {
        id: '3',
        icon: 'award',
        text: '925 Pure Silver | Lifetime Polish',
        order: 3,
      },
      {
        id: '4',
        icon: 'phone',
        text: 'Customer Support: +91 98765 43210',
        order: 4,
      },
      {
        id: '5',
        icon: 'map-pin',
        text: 'Our Stores',
        order: 5,
      },
    ];
  }

  getBanners(): Banner[] {
    return [
      {
        id: '1',
        title: 'Bridal Collection',
        subtitle: 'Discover elegant jewelry that tells your story',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=600&fit=crop',
        cta: 'Explore Now',
        ctaLink: '#bridal-collection',
        order: 1,
      },
      {
        id: '2',
        title: 'Shine Every Moment',
        subtitle: 'Premium jewelry for every occasion',
        image: 'https://images.unsplash.com/photo-1587599810487-e86aed5a6a5f?w=1200&h=600&fit=crop',
        cta: 'Shop Now',
        ctaLink: '#featured',
        order: 2,
      },
      {
        id: '3',
        title: 'New Season Collection',
        subtitle: 'Latest designs and timeless elegance',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&h=600&fit=crop&q=80',
        cta: 'Discover',
        ctaLink: '#new-arrivals',
        order: 3,
      },
    ];
  }

  getCategories(): Category[] {
    return [
      {
        id: '1',
        name: 'Silver Jewelry',
        slug: 'silver-jewelry',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop',
        description: 'Premium silver jewelry collection',
      },
      {
        id: '2',
        name: 'Kundan Jewelry',
        slug: 'kundan-jewelry',
        image: 'https://images.unsplash.com/photo-1515562141207-6811bcdd56cd?w=300&h=300&fit=crop',
        description: 'Traditional kundan designs',
      },
      {
        id: '3',
        name: 'Artificial Jewelry',
        slug: 'artificial-jewelry',
        image: 'https://images.unsplash.com/photo-1588561561272-5f5a42a5ee67?w=300&h=300&fit=crop',
        description: 'Stylish artificial jewelry',
      },
      {
        id: '4',
        name: 'Necklaces',
        slug: 'necklaces',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop',
        description: 'Elegant necklace collection',
      },
      {
        id: '5',
        name: 'Earrings',
        slug: 'earrings',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=300&h=300&fit=crop',
        description: 'Beautiful earring designs',
      },
      {
        id: '6',
        name: 'Rings',
        slug: 'rings',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop',
        description: 'Stunning ring collection',
      },
      {
        id: '7',
        name: 'Bracelets',
        slug: 'bracelets',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop',
        description: 'Trendy bracelet designs',
      },
      {
        id: '8',
        name: 'Anklets',
        slug: 'anklets',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=300&h=300&fit=crop',
        description: 'Delicate anklet collection',
      },
    ];
  }

  getCollections(): Collection[] {
    return [
      {
        id: '1',
        name: 'Bridal Collection',
        description: 'Beautiful jewelry for your special day',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop',
        slug: 'bridal-collection',
      },
      {
        id: '2',
        name: 'Party Wear',
        description: 'Glamorous jewelry for celebrations',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&h=300&fit=crop',
        slug: 'party-wear',
      },
      {
        id: '3',
        name: 'Daily Wear',
        description: 'Elegant everyday jewelry',
        image: 'https://images.unsplash.com/photo-1515562141207-6811bcdd56cd?w=400&h=300&fit=crop',
        slug: 'daily-wear',
      },
      {
        id: '4',
        name: 'Office Wear',
        description: 'Professional jewelry collection',
        image: 'https://images.unsplash.com/photo-1588561561272-5f5a42a5ee67?w=400&h=300&fit=crop',
        slug: 'office-wear',
      },
      {
        id: '5',
        name: 'Wedding Collection',
        description: 'Premium wedding jewelry',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=300&fit=crop',
        slug: 'wedding-collection',
      },
    ];
  }

  getMaterials(): Material[] {
    return [
      {
        id: '1',
        name: 'Silver',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop',
        slug: 'silver',
      },
      {
        id: '2',
        name: 'Gold Plated',
        image: 'https://images.unsplash.com/photo-1515562141207-6811bcdd56cd?w=200&h=200&fit=crop',
        slug: 'gold-plated',
      },
      {
        id: '3',
        name: 'Oxidized',
        image: 'https://images.unsplash.com/photo-1588561561272-5f5a42a5ee67?w=200&h=200&fit=crop',
        slug: 'oxidized',
      },
      {
        id: '4',
        name: 'Kundan',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop',
        slug: 'kundan',
      },
      {
        id: '5',
        name: 'Artificial',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200&h=200&fit=crop',
        slug: 'artificial',
      },
      {
        id: '6',
        name: 'Rose Gold',
        image: 'https://images.unsplash.com/photo-1515562141207-6811bcdd56cd?w=200&h=200&fit=crop',
        slug: 'rose-gold',
      },
      {
        id: '7',
        name: 'Pearl',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=200&h=200&fit=crop',
        slug: 'pearl',
      },
    ];
  }

  getProducts(): Product[] {
    return [
      {
        id: '1',
        name: 'Kundan Choker Necklace',
        description: 'Beautiful kundan choker with intricate design',
        price: 4999,
        originalPrice: 7999,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
        images: [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
        ],
        rating: 4.5,
        reviews: 128,
        category: 'kundan-jewelry',
        material: 'kundan',
        collection: 'bridal-collection',
        isTrending: true,
        isBestSeller: true,
        discount: 37,
        inStock: true,
      },
      {
        id: '2',
        name: 'Silver Stud Earrings',
        description: 'Elegant silver studs for everyday wear',
        price: 1299,
        originalPrice: 2099,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
        rating: 4.8,
        reviews: 95,
        category: 'earrings',
        material: 'silver',
        isTrending: true,
        discount: 38,
        inStock: true,
      },
      {
        id: '3',
        name: 'Gold Plated Bangles',
        description: 'Premium gold plated bangle set',
        price: 1899,
        originalPrice: 3499,
        image: 'https://images.unsplash.com/photo-1515562141207-6811bcdd56cd?w=500&h=500&fit=crop',
        rating: 4.6,
        reviews: 156,
        category: 'bracelets',
        material: 'gold-plated',
        collection: 'daily-wear',
        isFeatured: true,
        isBestSeller: true,
        discount: 45,
        inStock: true,
      },
      {
        id: '4',
        name: 'Oxidized Silver Ring',
        description: 'Traditional oxidized silver ring',
        price: 899,
        originalPrice: 1599,
        image: 'https://images.unsplash.com/photo-1588561561272-5f5a42a5ee67?w=500&h=500&fit=crop',
        rating: 4.4,
        reviews: 82,
        category: 'rings',
        material: 'oxidized',
        isNewArrival: true,
        discount: 43,
        inStock: true,
      },
      {
        id: '5',
        name: 'Pearl Necklace Set',
        description: 'Elegant pearl necklace with matching earrings',
        price: 2499,
        originalPrice: 4499,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
        rating: 4.7,
        reviews: 203,
        category: 'necklaces',
        material: 'pearl',
        collection: 'party-wear',
        isBestSeller: true,
        discount: 44,
        inStock: true,
      },
      {
        id: '6',
        name: 'Artificial Jewelry Set',
        description: 'Complete jewelry set for all occasions',
        price: 799,
        originalPrice: 1799,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
        rating: 4.3,
        reviews: 112,
        category: 'artificial-jewelry',
        material: 'artificial',
        isNewArrival: true,
        discount: 55,
        inStock: true,
      },
      {
        id: '7',
        name: 'Silver Infinity Bracelet',
        description: 'Modern infinity design in pure silver',
        price: 1699,
        originalPrice: 2999,
        image: 'https://images.unsplash.com/photo-1515562141207-6811bcdd56cd?w=500&h=500&fit=crop',
        rating: 4.6,
        reviews: 167,
        category: 'bracelets',
        material: 'silver',
        collection: 'office-wear',
        isTrending: true,
        discount: 43,
        inStock: true,
      },
      {
        id: '8',
        name: 'Jhumka Earrings',
        description: 'Traditional jhumka earrings with modern twist',
        price: 1599,
        originalPrice: 2699,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
        rating: 4.5,
        reviews: 198,
        category: 'earrings',
        material: 'kundan',
        collection: 'party-wear',
        isBestSeller: true,
        discount: 40,
        inStock: true,
      },
      {
        id: '9',
        name: 'Rose Gold Anklet',
        description: 'Delicate rose gold ankle jewelry',
        price: 1199,
        originalPrice: 2199,
        image: 'https://images.unsplash.com/photo-1588561561272-5f5a42a5ee67?w=500&h=500&fit=crop',
        rating: 4.4,
        reviews: 76,
        category: 'anklets',
        material: 'rose-gold',
        isNewArrival: true,
        discount: 45,
        inStock: true,
      },
      {
        id: '10',
        name: 'Silver Toe Ring',
        description: 'Pure silver toe ring set',
        price: 599,
        originalPrice: 999,
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=500&h=500&fit=crop',
        rating: 4.2,
        reviews: 54,
        category: 'rings',
        material: 'silver',
        discount: 40,
        inStock: true,
      },
      {
        id: '11',
        name: 'Bangle Set',
        description: 'Colorful bangle set for festive occasions',
        price: 2799,
        originalPrice: 4999,
        image: 'https://images.unsplash.com/photo-1515562141207-6811bcdd56cd?w=500&h=500&fit=crop',
        rating: 4.7,
        reviews: 241,
        category: 'bracelets',
        material: 'gold-plated',
        collection: 'wedding-collection',
        isFeatured: true,
        isBestSeller: true,
        discount: 44,
        inStock: true,
      },
      {
        id: '12',
        name: 'Mangalsutra',
        description: 'Traditional mangalsutra with diamond pendant',
        price: 3999,
        originalPrice: 7499,
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&h=500&fit=crop',
        rating: 4.8,
        reviews: 187,
        category: 'necklaces',
        material: 'gold-plated',
        collection: 'bridal-collection',
        isFeatured: true,
        discount: 46,
        inStock: true,
      },
    ];
  }

  getReviews(): Review[] {
    return [
      {
        id: '1',
        author: 'Priya Sharma',
        rating: 5,
        text: 'Beautiful collection and amazing quality. Delivery was fast and packaging was perfect!',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
        date: '2 weeks ago',
      },
      {
        id: '2',
        author: 'Ananya Singh',
        rating: 4.5,
        text: 'Love the designs! The jewelry looks exactly like in the pictures. Highly recommend!',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
        date: '1 week ago',
      },
      {
        id: '3',
        author: 'Meera Verma',
        rating: 5,
        text: 'Got my wedding jewelry here. The kundan work is exceptional and worth every penny!',
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
        date: '3 days ago',
      },
      {
        id: '4',
        author: 'Divya Patel',
        rating: 4,
        text: 'Premium quality jewelry at affordable prices. Customer service is very helpful.',
        image: 'https://images.unsplash.com/photo-1517746915202-2194036c0b2d?w=100&h=100&fit=crop',
        date: '5 days ago',
      },
      {
        id: '5',
        author: 'Isha Gupta',
        rating: 5,
        text: 'Exceeded my expectations! The finish and design are absolutely stunning.',
        image: 'https://images.unsplash.com/photo-1524847a36e30cc0ffd46d7b3e4f7c5a?w=100&h=100&fit=crop',
        date: 'Just now',
      },
    ];
  }

  getTrendingProducts(): Product[] {
    return this.getProducts().filter((p) => p.isTrending).slice(0, 6);
  }

  getFeaturedProducts(): Product[] {
    return this.getProducts().filter((p) => p.isFeatured).slice(0, 6);
  }

  getNewArrivals(): Product[] {
    return this.getProducts().filter((p) => p.isNewArrival).slice(0, 6);
  }

  getBestSellers(): Product[] {
    return this.getProducts().filter((p) => p.isBestSeller).slice(0, 6);
  }

  getProductsByCategory(categorySlug: string): Product[] {
    return this.getProducts().filter((p) => p.category === categorySlug);
  }

  getProductsByMaterial(materialSlug: string): Product[] {
    return this.getProducts().filter((p) => p.material === materialSlug);
  }
}
