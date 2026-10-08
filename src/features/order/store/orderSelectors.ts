import { RootState } from '../../../store/rootReducer';
import {
  DELIVERY_ROUTE,
  TrackingLocation,
  TrackingStatus,
} from '../../../services/tracking/trackingTypes';

export const selectOrderTracking = (state: RootState) => state.order;

export const selectTrackingOrderId = (state: RootState): string | null =>
  state.order.orderId;

export const selectTrackingStatus = (state: RootState): TrackingStatus =>
  state.order.status;

export const selectTrackingLocation = (
  state: RootState,
): TrackingLocation => state.order.location || DELIVERY_ROUTE[0];

export const selectTrackingRouteIndex = (state: RootState): number =>
  state.order.routeIndex;

export const selectIsTracking = (state: RootState): boolean =>
  state.order.isTracking;

export const selectTrackingError = (state: RootState): string | null =>
  state.order.error;

export const selectTrackingStartedAt = (state: RootState): number | null =>
  state.order.startedAt;
