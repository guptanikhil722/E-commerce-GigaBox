import axios, { AxiosError } from 'axios';
import { ApiError, ApiErrorType, isApiError } from './apiError';
import { networkService } from '../network/NetworkService';

/**
 * Normalizes raw HTTP errors, timeouts, network failures, or cancellations
 * into a structured, consistent ApiError object.
 */
export const normalizeApiError = (error: unknown): ApiError => {
  if (isApiError(error)) {
    return error;
  }

  // 1. Request Cancellation (AbortController or Axios CancelToken)
  if (
    axios.isCancel(error) ||
    (error instanceof Error &&
      (error.name === 'CanceledError' || error.name === 'AbortError'))
  ) {
    return {
      message: 'Request was cancelled',
      type: 'CANCELLED',
      originalError: error,
    };
  }

  // 2. Offline Status check
  if (!networkService.getIsOnline()) {
    return {
      message: 'You are offline. Showing cached catalog.',
      type: 'OFFLINE',
      originalError: error,
    };
  }

  // 2. Axios Error Handling
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;

    // Timeout
    if (
      axiosError.code === 'ECONNABORTED' ||
      axiosError.message.toLowerCase().includes('timeout')
    ) {
      return {
        code: axiosError.code,
        message: 'Request timed out. Please check your connection and try again.',
        type: 'TIMEOUT',
        originalError: error,
      };
    }

    // Network Failure (Distinguish Offline vs Remote Network failure)
    if (
      !axiosError.response &&
      (axiosError.request ||
        axiosError.message.toLowerCase().includes('network error'))
    ) {
      const isDeviceOffline = !networkService.getIsOnline();
      return {
        code: axiosError.code,
        message: isDeviceOffline
          ? 'You are offline. Showing cached catalog.'
          : 'Unable to connect. Please check your internet connection.',
        type: isDeviceOffline ? 'OFFLINE' : 'NETWORK',
        originalError: error,
      };
    }

    // HTTP Status-specific handling
    if (axiosError.response) {
      const status = axiosError.response.status;
      const backendMessage =
        axiosError.response.data?.message || axiosError.response.data?.error;

      let type: ApiErrorType = 'UNKNOWN';
      let defaultMessage = 'An unexpected error occurred. Please try again.';

      if (status >= 400 && status < 500) {
        type = 'CLIENT';
        switch (status) {
          case 400:
            defaultMessage = 'Bad request. Please verify your input.';
            break;
          case 401:
            defaultMessage = 'Your session has expired. Please sign in again.';
            break;
          case 403:
            defaultMessage = "You don't have permission to perform this action.";
            break;
          case 404:
            defaultMessage = 'The requested resource was not found.';
            break;
          case 408:
            type = 'TIMEOUT';
            defaultMessage = 'Request timed out. Please try again.';
            break;
          case 409:
            defaultMessage = 'A data conflict occurred. Please refresh and try again.';
            break;
          case 422:
            defaultMessage = 'Validation error. Please check submitted data.';
            break;
          case 429:
            defaultMessage = 'Too many requests. Please wait a moment and try again.';
            break;
          default:
            defaultMessage = 'Client error. Please check your request.';
        }
      } else if (status >= 500 && status <= 599) {
        type = 'SERVER';
        switch (status) {
          case 502:
            defaultMessage = 'Bad Gateway. The server is temporarily unreachable.';
            break;
          case 503:
            defaultMessage = 'Service unavailable. Server is undergoing maintenance.';
            break;
          case 504:
            type = 'TIMEOUT';
            defaultMessage = 'Gateway timeout. Server took too long to respond.';
            break;
          default:
            defaultMessage = 'Server error encountered. Please try again later.';
        }
      }

      return {
        status,
        code: axiosError.code,
        message: backendMessage || defaultMessage,
        type,
        details: axiosError.response.data,
        originalError: error,
      };
    }
  }

  // 3. Generic JavaScript Error
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred.',
      type: 'UNKNOWN',
      originalError: error,
    };
  }

  // 4. Fallback for unknown error formats
  return {
    message: 'An unknown error occurred.',
    type: 'UNKNOWN',
    originalError: error,
  };
};

/**
 * Maps an ApiError to a human-friendly UI message.
 */
export const handleApiError = (error: unknown): ApiError => {
  return normalizeApiError(error);
};

export default handleApiError;
