import { QueryCache, QueryClient } from '@tanstack/react-query';
import { isApiError } from '../api/apiError';
import { logger } from '../logger';

/**
 * Global Query Cache with infrastructure-level logging
 */
const queryCache = new QueryCache({
  onError: (error, query) => {
    const queryKey = JSON.stringify(query.queryKey);
    if (isApiError(error)) {
      if (error.type !== 'CANCELLED') {
        logger.error(`[QUERY ERROR] Query ${queryKey} failed: ${error.message}`, error);
      }
    } else {
      logger.error(`[QUERY ERROR] Query ${queryKey} failed`, error);
    }
  },
});

/**
 * Mobile-tuned Single QueryClient
 * - Disables aggressive refetches on window focus to conserve mobile battery/bandwidth
 * - Sets a 5-minute staleTime and 15-minute garbage collection time
 * - Implements selective retry logic: ignores 4xx client errors & cancellations, retries network/5xx up to 2 times
 */
export const queryClient = new QueryClient({
  queryCache,
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes fresh data
      gcTime: 1000 * 60 * 15, // 15 minutes before garbage collection
      refetchOnWindowFocus: false, // Avoid excessive network hits on app focus
      refetchOnReconnect: true, // Auto-sync when internet comes back
      networkMode: 'online', // Pauses queries while offline; auto-resumes upon reconnection
      retry: (failureCount, error) => {
        if (isApiError(error)) {
          // Never retry while device is offline (auto-refetches on reconnect)
          if (error.type === 'OFFLINE') return false;

          // Never retry cancelled requests
          if (error.type === 'CANCELLED') return false;

          // Never retry standard client errors (400, 401, 403, 404, 422)
          if (error.type === 'CLIENT' && error.status !== 429) {
            return false;
          }
        }
        // Retry network or transient server errors up to 2 times
        return failureCount < 2;
      },
    },
  },
});

export default queryClient;
