/**
 * Live Order Tracking Type Definitions & Constants
 */

export type TrackingStatus =
  | 'PLACED'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED';

export interface TrackingLocation {
  latitude: number;
  longitude: number;
}

export interface TrackingEvent {
  orderId: string;
  status: TrackingStatus;
  location: TrackingLocation;
  timestamp: number;
  routeIndex: number;
}

export interface PersistedTrackingState {
  orderId: string;
  startedAt: number;
  status: TrackingStatus;
  routeIndex: number;
  lastUpdatedAt: number;
}

/**
 * Configurable simulation ticker cadence (2.5 seconds).
 */
export const TRACKING_TICK_INTERVAL = 2500;

/**
 * Deterministic time-based milestone thresholds (in milliseconds).
 * Status and position are derived directly from elapsed time since startedAt,
 * ensuring accuracy across app backgrounding and process restarts.
 */
export const TRACKING_TIMELINE = {
  PACKED_AFTER_MS: 6000, // 0s - 6s: PLACED
  OUT_FOR_DELIVERY_AFTER_MS: 14000, // 6s - 14s: PACKED
  DELIVERED_AFTER_MS: 34000, // 14s - 34s: OUT_FOR_DELIVERY (progresses along route)
  // 34s+: DELIVERED
};

/**
 * Predefined sequential delivery route (Market & Mission Corridor, SF).
 * Starts at the GigaBox Fulfillment Center and terminates at customer doorstep.
 */
export const DELIVERY_ROUTE: TrackingLocation[] = [
  { latitude: 37.7749, longitude: -122.4194 }, // GigaBox Hub (Market & 8th)
  { latitude: 37.7735, longitude: -122.4182 }, // Mission & 9th
  { latitude: 37.7721, longitude: -122.4169 }, // Mission & 10th
  { latitude: 37.7708, longitude: -122.4158 }, // South Van Ness
  { latitude: 37.7694, longitude: -122.4147 }, // 13th & Mission
  { latitude: 37.7678, longitude: -122.4136 }, // 15th & Mission
  { latitude: 37.7661, longitude: -122.4124 }, // 17th & Mission
  { latitude: 37.7645, longitude: -122.4113 }, // 19th & Mission
  { latitude: 37.7628, longitude: -122.4102 }, // 21st & Valencia Ave
  { latitude: 37.7612, longitude: -122.4091 }, // 23rd & Valencia Ave
  { latitude: 37.7599, longitude: -122.4082 }, // 24th St Corridor
  { latitude: 37.7585, longitude: -122.4074 }, // Customer Destination Doorstep
];

export const ORIGIN_LOCATION: TrackingLocation = DELIVERY_ROUTE[0];
export const DESTINATION_LOCATION: TrackingLocation =
  DELIVERY_ROUTE[DELIVERY_ROUTE.length - 1];
