import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { logger } from '../logger';

export type NetworkStatusListener = (isOnline: boolean) => void;

/**
 * Centralized Network Service
 * Bridges NetInfo native events to TanStack React Query onlineManager and UI listeners.
 * Prevents multiple screens from establishing duplicate NetInfo native subscriptions.
 */
class NetworkService {
  private isOnline: boolean = true;
  private isConnected: boolean | null = true;
  private isInternetReachable: boolean | null = true;
  private listeners: Set<NetworkStatusListener> = new Set();
  private initialized: boolean = false;

  public init(): void {
    if (this.initialized) return;
    this.initialized = true;

    try {
      // 1. Hook into TanStack React Query onlineManager
      onlineManager.setEventListener((setOnline) => {
        try {
          const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
            const reachable = state.isInternetReachable !== false;
            const connected = Boolean(state.isConnected && reachable);
            this.updateState(state);
            setOnline(connected);
          });
          return unsubscribe;
        } catch (subErr) {
          logger.warn('[NETWORK] NetInfo subscription failed, fallback online', subErr);
          return () => {};
        }
      });

      // 2. Fetch initial connection state
      NetInfo.fetch()
        .then((state: NetInfoState) => {
          this.updateState(state);
          const reachable = state.isInternetReachable !== false;
          onlineManager.setOnline(Boolean(state.isConnected && reachable));
        })
        .catch((err) => {
          logger.warn('[NETWORK] Error fetching initial network state', err);
        });

      logger.info('[NETWORK] Centralized NetworkService initialized');
    } catch (err) {
      logger.warn('[NETWORK] NetInfo native module unavailable, defaulting online', err);
    }
  }

  private updateState(state: NetInfoState): void {
    this.isConnected = state.isConnected;
    this.isInternetReachable = state.isInternetReachable;
    const reachable = state.isInternetReachable !== false;
    const newIsOnline = Boolean(state.isConnected && reachable);

    if (this.isOnline !== newIsOnline) {
      this.isOnline = newIsOnline;
      logger.info(
        `[NETWORK] Connectivity state changed: ${newIsOnline ? 'ONLINE' : 'OFFLINE'}`,
        {
          type: state.type,
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
        },
      );
      this.notifyListeners(newIsOnline);
    }
  }

  public getIsOnline(): boolean {
    return this.isOnline;
  }

  public getIsConnected(): boolean | null {
    return this.isConnected;
  }

  public getIsInternetReachable(): boolean | null {
    return this.isInternetReachable;
  }

  public async checkConnectivity(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      this.updateState(state);
      const reachable = state.isInternetReachable !== false;
      const isOnline = Boolean(state.isConnected && reachable);
      onlineManager.setOnline(isOnline);
      return isOnline;
    } catch (err) {
      logger.warn('[NETWORK] checkConnectivity failed, retaining existing state', err);
      return this.isOnline;
    }
  }

  public subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.add(listener);
    // Notify immediately with current state
    listener(this.isOnline);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach((listener) => {
      try {
        listener(isOnline);
      } catch (err) {
        logger.error('[NETWORK] Error in network listener callback', err);
      }
    });
  }
}

export const networkService = new NetworkService();
export default networkService;
