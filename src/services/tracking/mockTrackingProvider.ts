import { TrackingProvider } from './trackingProvider';
import {
  DELIVERY_ROUTE,
  PersistedTrackingState,
  TRACKING_TICK_INTERVAL,
  TrackingEvent,
  TrackingStatus,
} from './trackingTypes';
import {
  getTrackingStateAtTime,
  isValidTransition,
} from './trackingStateMachine';
import { storage } from '../storage/storage';
import { logger } from '../logger';

interface ActiveSession {
  orderId: string;
  startedAt: number;
  timerId: ReturnType<typeof setInterval> | null;
  lastStatus: TrackingStatus;
  lastRouteIndex: number;
}

const STORAGE_KEY_PREFIX = 'gigabox_tracking_';

export class MockTrackingProvider implements TrackingProvider {
  private sessions = new Map<string, ActiveSession>();
  private listeners = new Map<string, Set<(event: TrackingEvent) => void>>();

  private getStorageKey(orderId: string): string {
    return `${STORAGE_KEY_PREFIX}${orderId}`;
  }

  /**
   * Start or resume simulation for a given orderId.
   */
  async start(orderId: string, initialStartedAt?: number): Promise<void> {
    if (!orderId) {
      logger.warn('MockTrackingProvider: Cannot start tracking with empty orderId');
      return;
    }

    // Check if session is already running in-memory
    const existingSession = this.sessions.get(orderId);
    if (existingSession && existingSession.timerId !== null) {
      logger.info('MockTrackingProvider: Tracking simulation already active, reusing existing session', {
        orderId,
      });
      return;
    }

    // Try loading persisted state from storage
    const storageKey = this.getStorageKey(orderId);
    const persisted = await storage.getItem<PersistedTrackingState>(storageKey);

    const now = Date.now();
    const startedAt = persisted?.startedAt || initialStartedAt || now;

    // Time-based calculation
    const currentCalc = getTrackingStateAtTime(startedAt, now);

    const session: ActiveSession = {
      orderId,
      startedAt,
      timerId: null,
      lastStatus: currentCalc.status,
      lastRouteIndex: currentCalc.routeIndex,
    };

    this.sessions.set(orderId, session);

    logger.info('MockTrackingProvider: Tracking session started/restored', {
      orderId,
      status: currentCalc.status,
      routeIndex: currentCalc.routeIndex,
      isRestored: Boolean(persisted),
    });

    // Emit initial telemetry snapshot
    this.emitEvent(session, currentCalc.status, currentCalc.routeIndex, now);

    // Save initial state to persistent storage
    await this.persistState(session, currentCalc.status, currentCalc.routeIndex, now);

    // If order is already delivered, do not spin up interval
    if (currentCalc.status === 'DELIVERED') {
      logger.info('MockTrackingProvider: Order is already DELIVERED, no ticker needed', {
        orderId,
      });
      return;
    }

    // Launch single background ticker for this order
    this.launchTicker(session);
  }

  /**
   * Launch interval ticker for live telemetry simulation.
   */
  private launchTicker(session: ActiveSession): void {
    if (session.timerId) {
      clearInterval(session.timerId);
      session.timerId = null;
    }

    session.timerId = setInterval(() => {
      this.handleTick(session);
    }, TRACKING_TICK_INTERVAL);
  }

  /**
   * Handle each timer interval tick.
   */
  private async handleTick(session: ActiveSession): Promise<void> {
    const now = Date.now();
    const calculated = getTrackingStateAtTime(session.startedAt, now);

    // Ensure status moves only in allowed forward progression
    let effectiveStatus = calculated.status;
    if (!isValidTransition(session.lastStatus, effectiveStatus)) {
      effectiveStatus = session.lastStatus;
    }

    if (effectiveStatus !== session.lastStatus) {
      logger.info('MockTrackingProvider: Tracking status transitioned', {
        orderId: session.orderId,
        from: session.lastStatus,
        to: effectiveStatus,
      });
    }

    session.lastStatus = effectiveStatus;
    session.lastRouteIndex = calculated.routeIndex;

    this.emitEvent(
      session,
      effectiveStatus,
      calculated.routeIndex,
      now,
    );

    await this.persistState(
      session,
      effectiveStatus,
      calculated.routeIndex,
      now,
    );

    // Stop provider ticker if delivered
    if (effectiveStatus === 'DELIVERED') {
      logger.info('MockTrackingProvider: Order marked as DELIVERED, stopping ticker', {
        orderId: session.orderId,
      });
      if (session.timerId) {
        clearInterval(session.timerId);
        session.timerId = null;
      }
    }
  }

  /**
   * Emit telemetry event to all registered order listeners.
   */
  private emitEvent(
    session: ActiveSession,
    status: TrackingStatus,
    routeIndex: number,
    timestamp: number,
  ): void {
    const safeIndex = Math.min(
      Math.max(0, routeIndex),
      DELIVERY_ROUTE.length - 1,
    );
    const location = DELIVERY_ROUTE[safeIndex];

    const event: TrackingEvent = {
      orderId: session.orderId,
      status,
      location,
      timestamp,
      routeIndex: safeIndex,
    };

    const orderListeners = this.listeners.get(session.orderId);
    if (orderListeners) {
      orderListeners.forEach((listener) => {
        try {
          listener(event);
        } catch (err) {
          logger.error('MockTrackingProvider: Listener threw unhandled error', {
            orderId: session.orderId,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    }
  }

  /**
   * Persist current state snapshot to AsyncStorage abstraction.
   */
  private async persistState(
    session: ActiveSession,
    status: TrackingStatus,
    routeIndex: number,
    lastUpdatedAt: number,
  ): Promise<void> {
    const payload: PersistedTrackingState = {
      orderId: session.orderId,
      startedAt: session.startedAt,
      status,
      routeIndex,
      lastUpdatedAt,
    };
    await storage.setItem(this.getStorageKey(session.orderId), payload);
  }

  /**
   * Stop tracking session and clear intervals.
   */
  stop(orderId: string): void {
    const session = this.sessions.get(orderId);
    if (session) {
      if (session.timerId) {
        clearInterval(session.timerId);
        session.timerId = null;
      }
      this.sessions.delete(orderId);
      logger.info('MockTrackingProvider: Tracking stopped for order', { orderId });
    }
  }

  /**
   * Subscribe to tracking updates for an order.
   */
  subscribe(
    orderId: string,
    listener: (event: TrackingEvent) => void,
  ): () => void {
    if (!this.listeners.has(orderId)) {
      this.listeners.set(orderId, new Set());
    }

    const set = this.listeners.get(orderId)!;
    set.add(listener);

    // If session already exists, immediately emit current state snapshot to listener
    const session = this.sessions.get(orderId);
    if (session) {
      const safeIndex = Math.min(
        Math.max(0, session.lastRouteIndex),
        DELIVERY_ROUTE.length - 1,
      );
      listener({
        orderId,
        status: session.lastStatus,
        location: DELIVERY_ROUTE[safeIndex],
        timestamp: Date.now(),
        routeIndex: safeIndex,
      });
    }

    return () => {
      set.delete(listener);
      if (set.size === 0) {
        this.listeners.delete(orderId);
      }
    };
  }

  /**
   * Read stored state for an order.
   */
  async getCurrentState(orderId: string): Promise<PersistedTrackingState | null> {
    return storage.getItem<PersistedTrackingState>(this.getStorageKey(orderId));
  }

  /**
   * Foreground recovery: recalculate elapsed time, catch up state, restart ticker if active.
   */
  async syncAfterForeground(orderId: string): Promise<void> {
    const storageKey = this.getStorageKey(orderId);
    const persisted = await storage.getItem<PersistedTrackingState>(storageKey);
    const session = this.sessions.get(orderId);

    const startedAt = session?.startedAt || persisted?.startedAt;
    if (!startedAt) {
      return;
    }

    const now = Date.now();
    const calculated = getTrackingStateAtTime(startedAt, now);

    logger.info('MockTrackingProvider: Syncing after foregrounding', {
      orderId,
      status: calculated.status,
      routeIndex: calculated.routeIndex,
    });

    if (session) {
      session.lastStatus = calculated.status;
      session.lastRouteIndex = calculated.routeIndex;
      this.emitEvent(session, calculated.status, calculated.routeIndex, now);
      await this.persistState(session, calculated.status, calculated.routeIndex, now);

      if (calculated.status === 'DELIVERED') {
        if (session.timerId) {
          clearInterval(session.timerId);
          session.timerId = null;
        }
      } else if (!session.timerId) {
        this.launchTicker(session);
      }
    } else {
      await this.start(orderId, startedAt);
    }
  }
}

// Global singleton instance
export const mockTrackingProvider = new MockTrackingProvider();
export default mockTrackingProvider;
