export type ApiErrorType =
  | 'OFFLINE'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'CANCELLED'
  | 'CLIENT'
  | 'SERVER'
  | 'UNKNOWN';

export interface ApiError {
  status?: number;
  code?: string;
  message: string;
  type: ApiErrorType;
  details?: unknown;
  originalError?: unknown;
}

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'type' in error &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
};
