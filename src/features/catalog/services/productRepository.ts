import { apiClient } from '../../../services/api';
import { ENDPOINTS } from '../../../services/api/endpoints';
import { logger } from '../../../services/logger';
import type { Product, ProductsResponse } from '../types';

export interface FetchProductsParams {
  limit?: number;
  skip?: number;
  search?: string;
  category?: string;
  signal?: AbortSignal;
}

/**
 * Product Repository
 * Handles all network requests to the /products endpoints.
 * Includes explicit try-catch blocks, robust response validation, and logging for each call.
 */
export const productRepository = {
  /**
   * Universal fetch products method with pagination, search, and category filtering
   */
  fetchProducts: async (params: FetchProductsParams = {}): Promise<ProductsResponse> => {
    const { limit = 10, skip = 0, search, category, signal } = params;
    const trimmedSearch = search?.trim();

    let url = `${ENDPOINTS.PRODUCTS}?limit=${limit}&skip=${skip}`;
    if (trimmedSearch) {
      url = `${ENDPOINTS.SEARCH_PRODUCTS}?q=${encodeURIComponent(trimmedSearch)}&limit=${limit}&skip=${skip}`;
    } else if (category && category !== 'All') {
      url = `${ENDPOINTS.PRODUCTS_BY_CATEGORY(category)}?limit=${limit}&skip=${skip}`;
    }

    try {
      const response = await apiClient.get<ProductsResponse>(url, { signal });
      if (response && response.products && Array.isArray(response.products)) {
        if (response.products.length > 0) {
          logger.info(
            `[PRODUCT REPO] Successfully fetched ${response.products.length} products from ${url}`,
          );
          return response;
        } else {
          logger.warn(`[PRODUCT REPO] Empty products list received from ${url}`);
          return response;
        }
      } else {
        logger.error(`[PRODUCT REPO] Invalid products payload structure from ${url}`, response);
        throw new Error('Invalid products payload structure received from server');
      }
    } catch (error) {
      logger.error(`[PRODUCT REPO] fetchProducts failed for ${url}`, error);
      throw error;
    }
  },

  /**
   * Fetch all products from DummyJSON (legacy/batch)
   */
  getProducts: async (signal?: AbortSignal): Promise<ProductsResponse> => {
    const url = ENDPOINTS.PRODUCTS;
    try {
      const response = await apiClient.get<ProductsResponse>(url, { signal });
      if (response && response.products && Array.isArray(response.products)) {
        if (response.products.length > 0) {
          logger.info(`[PRODUCT REPO] Successfully fetched ${response.products.length} batch products`);
          return response;
        } else {
          logger.warn('[PRODUCT REPO] Empty products array in batch fetch');
          return response;
        }
      } else {
        logger.error('[PRODUCT REPO] Invalid batch products response structure', response);
        throw new Error('Invalid product list response format');
      }
    } catch (error) {
      logger.error('[PRODUCT REPO] getProducts failed', error);
      throw error;
    }
  },

  /**
   * Search products by text query
   */
  searchProducts: async (
    query: string,
    limit: number = 10,
    skip: number = 0,
    signal?: AbortSignal,
  ): Promise<ProductsResponse> => {
    const trimmedQuery = query.trim();
    const url = `${ENDPOINTS.SEARCH_PRODUCTS}?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}&skip=${skip}`;

    try {
      const response = await apiClient.get<ProductsResponse>(url, { signal });
      if (response && response.products && Array.isArray(response.products)) {
        if (response.products.length > 0) {
          logger.info(`[PRODUCT REPO] Found ${response.products.length} search results for "${trimmedQuery}"`);
          return response;
        } else {
          logger.info(`[PRODUCT REPO] 0 search results found for "${trimmedQuery}"`);
          return response;
        }
      } else {
        logger.error(`[PRODUCT REPO] Invalid search response for "${trimmedQuery}"`, response);
        throw new Error('Search request returned invalid data format');
      }
    } catch (error) {
      logger.error(`[PRODUCT REPO] searchProducts failed for "${trimmedQuery}"`, error);
      throw error;
    }
  },

  /**
   * Fetch single product by ID
   */
  getProductById: async (id: number, signal?: AbortSignal): Promise<Product> => {
    const url = ENDPOINTS.PRODUCT_BY_ID(id);
    try {
      const product = await apiClient.get<Product>(url, { signal });
      if (product && product.id && typeof product.price === 'number') {
        logger.info(`[PRODUCT REPO] Successfully loaded product #${product.id} (${product.title})`);
        return product;
      } else {
        logger.error(`[PRODUCT REPO] Product #${id} payload is missing required fields`, product);
        throw new Error(`Product with ID ${id} was not found or is malformed`);
      }
    } catch (error) {
      logger.error(`[PRODUCT REPO] getProductById failed for ID ${id}`, error);
      throw error;
    }
  },

  /**
   * Fetch all categories
   */
  getCategories: async (signal?: AbortSignal): Promise<string[]> => {
    const url = ENDPOINTS.CATEGORIES;
    try {
      const categories = await apiClient.get<string[]>(url, { signal });
      if (categories && Array.isArray(categories) && categories.length > 0) {
        logger.info(`[PRODUCT REPO] Successfully loaded ${categories.length} categories`);
        return categories;
      } else {
        logger.error('[PRODUCT REPO] Categories response is empty or not an array', categories);
        throw new Error('Unable to retrieve product categories');
      }
    } catch (error) {
      logger.error('[PRODUCT REPO] getCategories failed', error);
      throw error;
    }
  },

  /**
   * Fetch products by category name
   */
  getProductsByCategory: async (
    category: string,
    signal?: AbortSignal,
  ): Promise<ProductsResponse> => {
    const url = ENDPOINTS.PRODUCTS_BY_CATEGORY(category);
    try {
      const response = await apiClient.get<ProductsResponse>(url, { signal });
      if (response && response.products && Array.isArray(response.products)) {
        if (response.products.length > 0) {
          logger.info(`[PRODUCT REPO] Loaded ${response.products.length} products for category "${category}"`);
          return response;
        } else {
          logger.warn(`[PRODUCT REPO] 0 products found for category "${category}"`);
          return response;
        }
      } else {
        logger.error(`[PRODUCT REPO] Invalid response for category "${category}"`, response);
        throw new Error(`Invalid response structure for category "${category}"`);
      }
    } catch (error) {
      logger.error(`[PRODUCT REPO] getProductsByCategory failed for "${category}"`, error);
      throw error;
    }
  },
};

export default productRepository;

