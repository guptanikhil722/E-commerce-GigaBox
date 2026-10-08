import {
  PersistedTrackingState,
  TrackingEvent,
} from './trackingTypes';

/**
 * Tracking Provider Contract
 *
 * Pluggable abstraction layer for real-time delivery telemetry.
 * Can be implemented by MockTrackingProvider, WebSocketTrackingProvider,
 * or Server-Sent Events (SSE) without modifying UI or state slices.
 */
export interface TrackingProvider {
  /**
   * Start or resume simulation/connection for a specific order.
   */
  start(orderId: string, initialStartedAt?: number): Promise<void>;

  /**
   * Terminate active tracking ticker or connection for an order.
   */
  stop(orderId: string): void;

  /**
   * Subscribe to real-time telemetry updates.
   * Returns an unsubscribe teardown function.
   */
  subscribe(
    orderId: string,
    listener: (event: TrackingEvent) => void,
  ): () => void;

  /**
   * Retrieve the current persisted or in-memory tracking snapshot.
   */
  getCurrentState(orderId: string): Promise<PersistedTrackingState | null>;

  /**
   * Sync and catch up tracking after returning from background.
   */
  syncAfterForeground(orderId: string): Promise<void>;
}
