import { TrackingStatus } from '../../../services/tracking/trackingTypes';

/**
 * Pure Tracking Formatting & Status Utilities
 * Extracts status mapping and ETA calculations outside React rendering components.
 */

export const getStatusTitle = (status: TrackingStatus): string => {
  switch (status) {
    case 'PLACED':
      return 'Order Placed';
    case 'PACKED':
      return 'Packed & Ready';
    case 'OUT_FOR_DELIVERY':
      return 'Out for Delivery';
    case 'DELIVERED':
      return 'Order Delivered';
    default:
      return 'Processing Order';
  }
};

export const getStatusDescription = (status: TrackingStatus): string => {
  switch (status) {
    case 'PLACED':
      return 'Store received your order and is preparing items.';
    case 'PACKED':
      return 'Package packed and handed to the delivery courier.';
    case 'OUT_FOR_DELIVERY':
      return 'Courier is en route to your shipping location.';
    case 'DELIVERED':
      return 'Package safely delivered at your doorstep.';
    default:
      return 'Tracking live updates.';
  }
};

export const getStatusStepIndex = (status: TrackingStatus): number => {
  switch (status) {
    case 'PLACED':
      return 0;
    case 'PACKED':
      return 1;
    case 'OUT_FOR_DELIVERY':
      return 2;
    case 'DELIVERED':
      return 3;
    default:
      return 0;
  }
};

export const formatEtaMinutes = (minutes: number): string => {
  if (minutes <= 0) return 'Arrived';
  if (minutes === 1) return '1 min away';
  return `${minutes} mins away`;
};

export const getEstimatedDeliveryText = (status: TrackingStatus): string => {
  switch (status) {
    case 'DELIVERED':
      return 'Delivered today at doorstep ✓';
    case 'OUT_FOR_DELIVERY':
      return 'Courier arriving in ~8-12 minutes';
    case 'PACKED':
      return 'Dispatched soon (estimated ~20 mins)';
    case 'PLACED':
    default:
      return 'Estimated delivery in ~25-30 mins';
  }
};

