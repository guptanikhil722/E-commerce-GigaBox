import {
  getNextTrackingStatus,
  getTrackingStateAtTime,
  isValidTransition,
} from '../src/services/tracking/trackingStateMachine';
import {
  DELIVERY_ROUTE,
  TRACKING_TIMELINE,
} from '../src/services/tracking/trackingTypes';

describe('Tracking State Machine', () => {
  describe('getNextTrackingStatus', () => {
    it('progresses strictly in order: PLACED -> PACKED -> OUT_FOR_DELIVERY -> DELIVERED -> null', () => {
      expect(getNextTrackingStatus('PLACED')).toBe('PACKED');
      expect(getNextTrackingStatus('PACKED')).toBe('OUT_FOR_DELIVERY');
      expect(getNextTrackingStatus('OUT_FOR_DELIVERY')).toBe('DELIVERED');
      expect(getNextTrackingStatus('DELIVERED')).toBeNull();
    });
  });

  describe('isValidTransition', () => {
    it('permits valid forward transitions', () => {
      expect(isValidTransition('PLACED', 'PLACED')).toBe(true);
      expect(isValidTransition('PLACED', 'PACKED')).toBe(true);
      expect(isValidTransition('PLACED', 'OUT_FOR_DELIVERY')).toBe(true);
      expect(isValidTransition('PLACED', 'DELIVERED')).toBe(true);
      expect(isValidTransition('PACKED', 'OUT_FOR_DELIVERY')).toBe(true);
      expect(isValidTransition('OUT_FOR_DELIVERY', 'DELIVERED')).toBe(true);
    });

    it('rejects illegal backward transitions', () => {
      expect(isValidTransition('PACKED', 'PLACED')).toBe(false);
      expect(isValidTransition('OUT_FOR_DELIVERY', 'PACKED')).toBe(false);
      expect(isValidTransition('OUT_FOR_DELIVERY', 'PLACED')).toBe(false);
      expect(isValidTransition('DELIVERED', 'OUT_FOR_DELIVERY')).toBe(false);
      expect(isValidTransition('DELIVERED', 'PACKED')).toBe(false);
      expect(isValidTransition('DELIVERED', 'PLACED')).toBe(false);
    });
  });

  describe('getTrackingStateAtTime', () => {
    const startedAt = 1000000;

    it('returns PLACED at 0ms elapsed', () => {
      const result = getTrackingStateAtTime(startedAt, startedAt);
      expect(result.status).toBe('PLACED');
      expect(result.routeIndex).toBe(0);
    });

    it('returns PLACED right before PACKED threshold', () => {
      const result = getTrackingStateAtTime(
        startedAt,
        startedAt + TRACKING_TIMELINE.PACKED_AFTER_MS - 100,
      );
      expect(result.status).toBe('PLACED');
      expect(result.routeIndex).toBe(0);
    });

    it('returns PACKED once threshold is reached', () => {
      const result = getTrackingStateAtTime(
        startedAt,
        startedAt + TRACKING_TIMELINE.PACKED_AFTER_MS + 500,
      );
      expect(result.status).toBe('PACKED');
      expect(result.routeIndex).toBe(0);
    });

    it('returns OUT_FOR_DELIVERY and progresses route sequentially during delivery window', () => {
      const midDelivery =
        startedAt +
        TRACKING_TIMELINE.OUT_FOR_DELIVERY_AFTER_MS +
        (TRACKING_TIMELINE.DELIVERED_AFTER_MS -
          TRACKING_TIMELINE.OUT_FOR_DELIVERY_AFTER_MS) /
          2;

      const result = getTrackingStateAtTime(startedAt, midDelivery);
      expect(result.status).toBe('OUT_FOR_DELIVERY');
      expect(result.routeIndex).toBeGreaterThan(0);
      expect(result.routeIndex).toBeLessThan(DELIVERY_ROUTE.length - 1);
    });

    it('returns DELIVERED and final route index after delivery threshold', () => {
      const postDelivery =
        startedAt + TRACKING_TIMELINE.DELIVERED_AFTER_MS + 5000;
      const result = getTrackingStateAtTime(startedAt, postDelivery);
      expect(result.status).toBe('DELIVERED');
      expect(result.routeIndex).toBe(DELIVERY_ROUTE.length - 1);
    });

    it('survives backgrounding simulation: calculates correct elapsed state without resetting to PLACED', () => {
      // Simulate app was backgrounded at 2s and brought back at 20s
      const appBackgroundedAt = startedAt + 2000;
      const earlyState = getTrackingStateAtTime(startedAt, appBackgroundedAt);
      expect(earlyState.status).toBe('PLACED');

      // 20 seconds later
      const appResumedAt = startedAt + 22000;
      const resumedState = getTrackingStateAtTime(startedAt, appResumedAt);
      expect(resumedState.status).toBe('OUT_FOR_DELIVERY');
      expect(resumedState.routeIndex).toBeGreaterThan(0);
    });
  });
});
