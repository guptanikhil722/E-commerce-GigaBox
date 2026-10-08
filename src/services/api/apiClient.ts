import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { BASE_URL } from './endpoints';
import { normalizeApiError } from './errorHandler';
import { logger } from '../logger';

interface RequestMetadata {
  startTime: number;
}

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: RequestMetadata;
  }
}

/**
 * Centralized Axios Instance
 * Base configuration and interceptors for DummyJSON API
 */
const axiosInstance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Global Request Interceptor
 * - Logs outgoing HTTP requests
 * - Stamps start time for latency tracking
 * - Prepares headers without dummy tokens
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    config.metadata = { startTime: Date.now() };

    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url || '';

    logger.debug(`[API REQUEST] ${method} ${url}`);

    return config;
  },
  (error: unknown) => {
    logger.error('[API REQUEST ERROR]', error);
    return Promise.reject(normalizeApiError(error));
  },
);

/**
 * Global Response Interceptor
 * - Calculates request roundtrip duration
 * - Logs status code and performance
 * - Normalizes all errors to structured ApiError
 */
axiosInstance.interceptors.response.use(
  (response) => {
    const config = response.config as InternalAxiosRequestConfig;
    const duration = config.metadata ? Date.now() - config.metadata.startTime : 0;
    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url || '';

    logger.info(`[API RESPONSE] ${response.status} ${method} ${url} (${duration}ms)`);

    return response;
  },
  (error: unknown) => {
    // Interceptor normalizes any raw axios, network, timeout, or cancellation error into ApiError
    const normalizedError = normalizeApiError(error);
    return Promise.reject(normalizedError);
  },
);

/**
 * Helper to log and re-throw normalized ApiError for each HTTP method
 */
const logAndRethrowError = (method: string, url: string, error: unknown): never => {
  const apiError = normalizeApiError(error);

  if (apiError.type === 'CANCELLED') {
    logger.debug(`[API CANCEL] ${method} ${url} request was cancelled`);
  } else {
    const statusText = apiError.status ? ` [HTTP ${apiError.status}]` : ` [${apiError.type}]`;
    logger.error(
      `[API ERROR] ${method} ${url}${statusText}: ${apiError.message}`,
      apiError,
    );
  }

  throw apiError;
};

/**
 * Typed API Client methods with explicit try-catch error logging
 */
export const apiClient = {
  get: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.get<T>(url, config);
      if (response && response.data !== undefined && response.data !== null) {
        if (Array.isArray(response.data)) {
          if (response.data.length > 0) {
            return response.data;
          }
          logger.warn(`[API GET] Empty array returned from ${url}`);
          return response.data;
        }
        return response.data;
      } else {
        logger.error(`[API GET] Empty response payload received from ${url}`);
        throw new Error(`Empty response received from ${url}`);
      }
    } catch (error) {
      return logAndRethrowError('GET', url, error);
    }
  },

  post: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      if (response && response.data !== undefined && response.data !== null) {
        return response.data;
      } else {
        logger.error(`[API POST] Empty response payload received from ${url}`);
        throw new Error(`Empty response received from ${url}`);
      }
    } catch (error) {
      return logAndRethrowError('POST', url, error);
    }
  },

  put: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      if (response && response.data !== undefined && response.data !== null) {
        return response.data;
      } else {
        logger.error(`[API PUT] Empty response payload received from ${url}`);
        throw new Error(`Empty response received from ${url}`);
      }
    } catch (error) {
      return logAndRethrowError('PUT', url, error);
    }
  },

  patch: async <T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.patch<T>(url, data, config);
      if (response && response.data !== undefined && response.data !== null) {
        return response.data;
      } else {
        logger.error(`[API PATCH] Empty response payload received from ${url}`);
        throw new Error(`Empty response received from ${url}`);
      }
    } catch (error) {
      return logAndRethrowError('PATCH', url, error);
    }
  },

  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      if (response && response.data !== undefined && response.data !== null) {
        return response.data;
      } else {
        logger.error(`[API DELETE] Empty response payload received from ${url}`);
        throw new Error(`Empty response received from ${url}`);
      }
    } catch (error) {
      return logAndRethrowError('DELETE', url, error);
    }
  },

  instance: axiosInstance,
};

export default apiClient;
