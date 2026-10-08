import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  setTrackingError,
  setTrackingStarted,
  updateTrackingEvent,
} from '../store/orderSlice';
import {
  selectIsTracking,
  selectTrackingError,
  selectTrackingLocation,
  selectTrackingOrderId,
  selectTrackingRouteIndex,
  selectTrackingStartedAt,
  selectTrackingStatus,
} from '../store/orderSelectors';
import { mockTrackingProvider } from '../../../services/tracking/mockTrackingProvider';
import {
  DELIVERY_ROUTE,
  DESTINATION_LOCATION,
  ORIGIN_LOCATION,
  TrackingEvent,
  TrackingLocation,
  TrackingStatus,
} from '../../../services/tracking/trackingTypes';
import { useAppState } from '../../../hooks/useAppState';
import { logger } from '../../../services/logger';

export interface UseOrderTrackingReturn {
  orderId: string;
  status: TrackingStatus;
  location: TrackingLocation;
  route: TrackingLocation[];
  routeIndex: number;
  isTracking: boolean;
  startedAt: number | null;
  destination: TrackingLocation;
  origin: TrackingLocation;
  error: string | null;
}

/**
 * Custom hook connecting UI to the Tracking Provider and Redux State.
 *
 * Responsibilities:
 * - Subscribes to telemetry events from MockTrackingProvider
 * - Syncs updates into Redux orderSlice
 * - Automatically recovers state when returning from background
 * - Unsubscribes cleanly on unmount
 */
export function useOrderTracking(orderId: string): UseOrderTrackingReturn {
  const dispatch = useAppDispatch();

  // Selectors from Redux store
  const currentOrderId = useAppSelector(selectTrackingOrderId);
  const status = useAppSelector(selectTrackingStatus);
  const location = useAppSelector(selectTrackingLocation);
  const routeIndex = useAppSelector(selectTrackingRouteIndex);
  const isTracking = useAppSelector(selectIsTracking);
  const startedAt = useAppSelector(selectTrackingStartedAt);
  const error = useAppSelector(selectTrackingError);

  const orderIdRef = useRef(orderId);
  orderIdRef.current = orderId;

  // AppState monitoring for Background -> Foreground recovery
  useAppState({
    onForeground: () => {
      const activeId = orderIdRef.current;
      if (activeId) {
        logger.info('useOrderTracking: Foreground detected, resyncing telemetry', {
          orderId: activeId,
        });
        mockTrackingProvider.syncAfterForeground(activeId);
      }
    },
  });

  useEffect(() => {
    if (!orderId) {
      dispatch(setTrackingError('Invalid order ID provided.'));
      return;
    }

    logger.info('useOrderTracking: Initializing tracking for order', { orderId });

    let isSubscribed = true;

    // Set initial Redux snapshot
    dispatch(setTrackingStarted({ orderId, startedAt: Date.now() }));

    // 1. Subscribe to events from provider
    const unsubscribe = mockTrackingProvider.subscribe(
      orderId,
      (event: TrackingEvent) => {
        if (!isSubscribed) return;
        dispatch(updateTrackingEvent(event));
      },
    );

    // 2. Start provider session (restores from storage or starts fresh)
    mockTrackingProvider
      .start(orderId)
      .catch((err) => {
        if (!isSubscribed) return;
        logger.error('useOrderTracking: Failed to start tracking provider', {
          orderId,
          error: err instanceof Error ? err.message : String(err),
        });
        dispatch(setTrackingError('Failed to initialize tracking service.'));
      });

    return () => {
      isSubscribed = false;
      unsubscribe();
      logger.info('useOrderTracking: Unsubscribed listener for order', { orderId });
    };
  }, [orderId, dispatch]);

  return {
    orderId: currentOrderId || orderId,
    status,
    location: location || DELIVERY_ROUTE[0],
    route: DELIVERY_ROUTE,
    routeIndex,
    isTracking,
    startedAt,
    destination: DESTINATION_LOCATION,
    origin: ORIGIN_LOCATION,
    error,
  };
}

export default useOrderTracking;
