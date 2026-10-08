import {
  DELIVERY_ROUTE,
  TRACKING_TIMELINE,
  TrackingStatus,
} from './trackingTypes';

/**
 * Pure Deterministic State Machine for Live Order Tracking
 *
 * Rules:
 * 1. Progression: PLACED -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED
 * 2. No backward jumps, no illegal skipping
 * 3. Status and route position are pure functions of elapsed time (currentTime - startedAt)
 */

export interface TrackingStateCalculation {
  status: TrackingStatus;
  routeIndex: number;
}

const STATUS_ORDER: readonly TrackingStatus[] = [
  'PLACED',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

/**
 * Get the next sequential tracking status in the progression lifecycle.
 * Returns null once order has reached DELIVERED.
 */
export function getNextTrackingStatus(
  currentStatus: TrackingStatus,
): TrackingStatus | null {
  switch (currentStatus) {
    case 'PLACED':
      return 'PACKED';
    case 'PACKED':
      return 'OUT_FOR_DELIVERY';
    case 'OUT_FOR_DELIVERY':
      return 'DELIVERED';
    case 'DELIVERED':
      return null;
    default:
      return null;
  }
}

/**
 * Validate whether a status transition is permitted.
 */
export function isValidTransition(
  from: TrackingStatus,
  to: TrackingStatus,
): boolean {
  const fromIndex = STATUS_ORDER.indexOf(from);
  const toIndex = STATUS_ORDER.indexOf(to);
  if (fromIndex === -1 || toIndex === -1) return false;
  // Can only transition forward or stay at same status
  return toIndex >= fromIndex;
}

/**
 * Calculate order status and route position strictly from timestamps.
 *
 * This guarantees deterministic recovery even when the app is backgrounded,
 * suspended, or relaunched after an arbitrary duration.
 */
export function getTrackingStateAtTime(
  startedAt: number,
  currentTime: number,
): TrackingStateCalculation {
  const elapsed = Math.max(0, currentTime - startedAt);
  const totalWaypoints = DELIVERY_ROUTE.length;

  // 1. PLACED Phase
  if (elapsed < TRACKING_TIMELINE.PACKED_AFTER_MS) {
    return {
      status: 'PLACED',
      routeIndex: 0,
    };
  }

  // 2. PACKED Phase
  if (elapsed < TRACKING_TIMELINE.OUT_FOR_DELIVERY_AFTER_MS) {
    return {
      status: 'PACKED',
      routeIndex: 0,
    };
  }

  // 3. OUT_FOR_DELIVERY Phase (Courier moves sequentially along route)
  if (elapsed < TRACKING_TIMELINE.DELIVERED_AFTER_MS) {
    const deliveryElapsed =
      elapsed - TRACKING_TIMELINE.OUT_FOR_DELIVERY_AFTER_MS;
    const deliveryDuration =
      TRACKING_TIMELINE.DELIVERED_AFTER_MS -
      TRACKING_TIMELINE.OUT_FOR_DELIVERY_AFTER_MS;

    const progressRatio = Math.min(
      0.999,
      Math.max(0, deliveryElapsed / deliveryDuration),
    );

    // Calculate intermediate waypoint index (0 to totalWaypoints - 2)
    const maxActiveIndex = Math.max(0, totalWaypoints - 2);
    const computedIndex = Math.floor(progressRatio * (totalWaypoints - 1));
    const routeIndex = Math.min(maxActiveIndex, computedIndex);

    return {
      status: 'OUT_FOR_DELIVERY',
      routeIndex,
    };
  }

  // 4. DELIVERED Phase (Arrived at customer doorstep)
  return {
    status: 'DELIVERED',
    routeIndex: totalWaypoints - 1,
  };
}
