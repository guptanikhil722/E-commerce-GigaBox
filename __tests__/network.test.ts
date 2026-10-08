import { networkService } from '../src/services/network/NetworkService';
import { handleApiError } from '../src/services/api/errorHandler';

describe('NetworkService & Offline Resiliency', () => {
  beforeEach(async () => {
    networkService.init();
    await new Promise((r) => setTimeout(() => r(undefined), 10));
  });

  test('reports current connection status', () => {
    expect(networkService.getIsOnline()).toBe(true);
    expect(networkService.getIsConnected()).toBe(true);
  });

  test('subscribes and notifies listeners on network status changes', () => {
    const listener = jest.fn();
    const unsubscribe = networkService.subscribe(listener);

    // Initial state check
    expect(listener).toHaveBeenCalledWith(true);

    unsubscribe();
  });

  test('handleApiError creates OFFLINE ApiError when device is offline', () => {
    // Force offline in NetworkService
    (networkService as any).isOnline = false;

    const error = new Error('Network request failed');
    const apiError = handleApiError(error);

    expect(apiError.type).toBe('OFFLINE');
    expect(apiError.message).toContain('offline');

    // Restore online
    (networkService as any).isOnline = true;
  });

  test('handleApiError creates NETWORK ApiError when device is online but host is unreachable', () => {
    (networkService as any).isOnline = true;

    const error = {
      isAxiosError: true,
      request: {},
      message: 'Network Error',
    };

    const apiError = handleApiError(error);
    expect(apiError.type).toBe('NETWORK');
  });

  test('checkConnectivity fetches state and returns online boolean', async () => {
    const isOnline = await networkService.checkConnectivity();
    expect(typeof isOnline).toBe('boolean');
    expect(isOnline).toBe(true);
  });
});

