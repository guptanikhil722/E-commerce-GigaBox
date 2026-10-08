import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  DELIVERY_ROUTE,
  TrackingEvent,
  TrackingLocation,
  TrackingStatus,
} from '../../../services/tracking/trackingTypes';

export interface OrderTrackingState {
  orderId: string | null;
  status: TrackingStatus;
  location: TrackingLocation | null;
  startedAt: number | null;
  routeIndex: number;
  isTracking: boolean;
  error: string | null;
}

const initialState: OrderTrackingState = {
  orderId: null,
  status: 'PLACED',
  location: DELIVERY_ROUTE[0],
  startedAt: null,
  routeIndex: 0,
  isTracking: false,
  error: null,
};

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setTrackingStarted: (
      state,
      action: PayloadAction<{
        orderId: string;
        startedAt: number;
        status?: TrackingStatus;
        location?: TrackingLocation;
        routeIndex?: number;
      }>,
    ) => {
      state.orderId = action.payload.orderId;
      state.startedAt = action.payload.startedAt;
      state.status = action.payload.status || 'PLACED';
      state.location = action.payload.location || DELIVERY_ROUTE[0];
      state.routeIndex = action.payload.routeIndex || 0;
      state.isTracking = state.status !== 'DELIVERED';
      state.error = null;
    },
    updateTrackingEvent: (state, action: PayloadAction<TrackingEvent>) => {
      const event = action.payload;
      if (state.orderId === event.orderId || !state.orderId) {
        state.orderId = event.orderId;
        state.status = event.status;
        state.location = event.location;
        state.routeIndex = event.routeIndex;
        state.isTracking = event.status !== 'DELIVERED';
        state.error = null;
      }
    },
    setTrackingDelivered: (state) => {
      state.status = 'DELIVERED';
      state.routeIndex = DELIVERY_ROUTE.length - 1;
      state.location = DELIVERY_ROUTE[DELIVERY_ROUTE.length - 1];
      state.isTracking = false;
    },
    setTrackingStopped: (state) => {
      state.isTracking = false;
    },
    setTrackingError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isTracking = false;
    },
    resetTracking: () => initialState,
  },
});

export const {
  setTrackingStarted,
  updateTrackingEvent,
  setTrackingDelivered,
  setTrackingStopped,
  setTrackingError,
  resetTracking,
} = orderSlice.actions;

export default orderSlice.reducer;
