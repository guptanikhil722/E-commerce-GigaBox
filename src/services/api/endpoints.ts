export const BASE_URL = 'https://dummyjson.com';

export const ENDPOINTS = {
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: number) => `/products/${id}`,
  SEARCH_PRODUCTS: '/products/search',
  CATEGORIES: '/products/categories',
  PRODUCTS_BY_CATEGORY: (category: string) => `/products/category/${encodeURIComponent(category)}`,
} as const;

export default ENDPOINTS;
