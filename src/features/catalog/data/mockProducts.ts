import type { Product } from '../types';
export type { Product };

export const CATEGORIES = [
  'All',
  'Electronics',
  'Accessories',
  'Footwear',
  'Apparel',
  'Home & Living',
] as const;

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    title: 'Aura ANC Wireless Headphones',
    price: 249.99,
    rating: 4.8,
    ratingCount: 124,
    category: 'Electronics',
    description:
      'Engineered with hybrid active noise cancellation, custom 40mm beryllium drivers, and up to 36 hours of battery life. Crafted with premium memory foam ear cushions for all-day listening bliss.',
    imageUrl:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    features: [
      'Active Noise Cancellation',
      '36-Hour Battery Life',
      'Bluetooth 5.3 Multipoint',
      'Ultra-Comfort Memory Foam',
    ],
  },
  {
    id: 2,
    title: 'Pulse Pro Running Sneakers',
    price: 139.5,
    rating: 4.7,
    ratingCount: 88,
    category: 'Footwear',
    description:
      'Breathable engineered mesh upper paired with responsive supercritical nitrogen-infused foam. Designed to deliver high energy return on 5K runs to marathons.',
    imageUrl:
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    features: [
      'Carbon Composite Plate',
      'Supercritical Foam Cushioning',
      'Breathable Seamless Mesh',
      'High-Traction Outsole',
    ],
  },
  {
    id: 3,
    title: 'Vanguard Chronograph Watch',
    price: 189.0,
    rating: 4.9,
    ratingCount: 215,
    category: 'Accessories',
    description:
      'Sapphire crystal glass with anti-reflective coating, 316L stainless steel casing, and Italian top-grain calfskin leather strap. Water-resistant up to 50 meters.',
    imageUrl:
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    features: [
      'Sapphire Crystal Glass',
      'Japanese Quartz Movement',
      'Italian Leather Strap',
      '50m Water Resistance',
    ],
  },
  {
    id: 4,
    title: 'Horizon Fitness Tracker Band',
    price: 79.99,
    rating: 4.4,
    ratingCount: 65,
    category: 'Electronics',
    description:
      'Continuous 24/7 heart rate, SpO2 blood oxygen, sleep stage tracking, and 120 sports modes on a vivid 1.62-inch AMOLED always-on display.',
    imageUrl:
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    features: [
      '1.62" AMOLED Display',
      'Continuous SpO2 & Heart Rate',
      '14-Day Battery Life',
      '5 ATM Water Resistant',
    ],
  },
  {
    id: 5,
    title: 'ErgoLift Aluminum Laptop Stand',
    price: 49.0,
    rating: 4.7,
    ratingCount: 142,
    category: 'Home & Living',
    description:
      'Precision CNC-machined aircraft-grade aluminum stand. Elevates your laptop to eye level to promote posture and maximize heat dissipation.',
    imageUrl:
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    features: [
      'Aircraft-Grade Aluminum',
      'Ergonomic Eye-Level Tilt',
      'Thermal Heat Dissipation',
      'Anti-Slip Silicone Pads',
    ],
  },
  {
    id: 6,
    title: 'Terra Waterproof Urban Backpack',
    price: 94.0,
    rating: 4.6,
    ratingCount: 97,
    category: 'Accessories',
    description:
      'Crafted from 100% recycled ripstop nylon with weatherproof YKK AquaGuard zippers. Includes dedicated 16-inch padded laptop sleeve and hidden passport pocket.',
    imageUrl:
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    features: [
      'Recycled Weatherproof Nylon',
      '16" Padded Laptop Sleeve',
      'Luggage Pass-Through Strap',
      'AquaGuard Waterproof Zippers',
    ],
  },
  {
    id: 7,
    title: 'Essential Heavyweight Oversized Tee',
    price: 36.0,
    rating: 4.5,
    ratingCount: 53,
    category: 'Apparel',
    description:
      '280 GSM heavyweight 100% organic combed cotton. Pre-shrunk with a relaxed drop-shoulder silhouette and ribbed collar that retains shape wash after wash.',
    imageUrl:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    features: [
      '280 GSM Heavyweight Cotton',
      '100% Certified Organic',
      'Pre-Shrunk Treatment',
      'Relaxed Drop Shoulder',
    ],
  },
  {
    id: 8,
    title: 'Apex RGB Mechanical Keyboard',
    price: 129.0,
    rating: 4.8,
    ratingCount: 312,
    category: 'Electronics',
    description:
      'Hot-swappable custom lubricated linear switches, per-key RGB backlighting, double-shot PBT keycaps, and sound-dampening silicon gasket mount.',
    imageUrl:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    inStock: true,
    features: [
      'Hot-Swappable Switches',
      'Gasket Mount Acoustics',
      'Double-Shot PBT Keycaps',
      'Per-Key RGB Lighting',
    ],
  },
];
