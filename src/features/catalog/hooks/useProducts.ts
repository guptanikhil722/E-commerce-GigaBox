import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { productRepository } from '../services/productRepository';
import type { Product, ProductsResponse } from '../types';
import type { ApiError } from '../../../services/api/apiError';

export const PRODUCT_QUERY_KEYS = {
  all: ['products'] as const,
  lists: () => [...PRODUCT_QUERY_KEYS.all, 'list'] as const,
  infinite: (params: { search?: string; category?: string; limit?: number }) =>
    [
      ...PRODUCT_QUERY_KEYS.all,
      'infinite',
      {
        search: params.search?.trim().toLowerCase() || '',
        category: params.category || 'All',
        limit: params.limit || 10,
      },
    ] as const,
  details: () => [...PRODUCT_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: number) => [...PRODUCT_QUERY_KEYS.details(), id] as const,
  categories: () => [...PRODUCT_QUERY_KEYS.all, 'categories'] as const,
};

export interface UseInfiniteProductsParams {
  search?: string;
  category?: string;
  limit?: number;
}

/**
 * Infinite query hook for paginated product lists with search and category filtering.
 * Passes AbortSignal down to axios for automatic cancellation on rapid search inputs.
 */
export const useInfiniteProducts = (params: UseInfiniteProductsParams = {}) => {
  const { search, category, limit = 10 } = params;

  return useInfiniteQuery<ProductsResponse, ApiError>({
    queryKey: PRODUCT_QUERY_KEYS.infinite({ search, category, limit }),
    queryFn: ({ pageParam = 0, signal }) =>
      productRepository.fetchProducts({
        limit,
        skip: pageParam as number,
        search,
        category,
        signal,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const nextSkip = lastPage.skip + lastPage.limit;
      return nextSkip < lastPage.total ? nextSkip : undefined;
    },
  });
};

/**
 * Standard batch query for all products
 */
export const useProducts = () => {
  return useQuery<ProductsResponse, ApiError>({
    queryKey: PRODUCT_QUERY_KEYS.lists(),
    queryFn: ({ signal }) => productRepository.getProducts(signal),
  });
};

/**
 * Hook to fetch single product by ID
 */
export const useProductDetails = (id: number) => {
  return useQuery<Product, ApiError>({
    queryKey: PRODUCT_QUERY_KEYS.detail(id),
    queryFn: ({ signal }) => productRepository.getProductById(id, signal),
    enabled: Boolean(id) && id > 0,
  });
};

/**
 * Hook to fetch available categories
 */
export const useCategories = () => {
  return useQuery<string[], ApiError>({
    queryKey: PRODUCT_QUERY_KEYS.categories(),
    queryFn: ({ signal }) => productRepository.getCategories(signal),
  });
};

export default useProducts;
