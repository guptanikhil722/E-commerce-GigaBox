import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme';
import { moderateScale } from '../../../utils/responsive';
import type { TrackingStatus } from '../../../services/tracking/trackingTypes';

export type TrackingStatusType = TrackingStatus;

export interface OrderStatusProps {
  orderId: string;
  status: TrackingStatusType;
  estimatedDelivery?: string;
}

export const OrderStatus: React.FC<OrderStatusProps> = ({
  orderId,
  status,
  estimatedDelivery = 'Today by 4:30 PM (25 mins)',
}) => {
  const { theme } = useTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'DELIVERED':
        return {
          label: 'Delivered',
          bgColor: theme.colors.successLight,
          textColor: theme.colors.success,
        };
      case 'OUT_FOR_DELIVERY':
        return {
          label: 'Out for Delivery',
          bgColor: theme.colors.primaryLight,
          textColor: theme.colors.primary,
        };
      case 'PACKED':
        return {
          label: 'Packed & Dispatched',
          bgColor: theme.colors.warningLight,
          textColor: theme.colors.warning,
        };
      case 'PLACED':
      default:
        return {
          label: 'Order Placed',
          bgColor: theme.colors.primaryLight,
          textColor: theme.colors.primary,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card, // #fcfafb
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
        },
        theme.shadows.sm,
      ]}
    >
      <View style={styles.topRow}>
        <View>
          <Text
            style={[
              styles.orderIdLabel,
              {
                color: theme.colors.textMuted,
                fontSize: theme.fontSize.caption,
              },
            ]}
          >
            ORDER ID
          </Text>
          <Text
            style={[
              styles.orderIdText,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.title,
              },
            ]}
          >
            {orderId}
          </Text>
        </View>

        <View
          style={[
            styles.badge,
            { backgroundColor: statusConfig.bgColor },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              {
                color: statusConfig.textColor,
                fontSize: theme.fontSize.caption,
              },
            ]}
          >
            {statusConfig.label}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.etaContainer,
          {
            backgroundColor: theme.colors.background, // #f8f9fa
            borderRadius: theme.borderRadius.md,
          },
        ]}
      >
        <Text style={styles.etaIcon}>⏱️</Text>
        <View>
          <Text
            style={[
              styles.etaLabel,
              {
                color: theme.colors.textMuted,
                fontSize: theme.fontSize.caption,
              },
            ]}
          >
            Estimated Delivery
          </Text>
          <Text
            style={[
              styles.etaValue,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.body,
              },
            ]}
          >
            {estimatedDelivery}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    marginBottom: moderateScale(14),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(12),
  },
  orderIdLabel: {
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  orderIdText: {
    fontWeight: '800',
    marginTop: moderateScale(2),
  },
  badge: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(8),
  },
  badgeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(10),
  },
  etaIcon: {
    fontSize: moderateScale(20),
    marginRight: moderateScale(10),
  },
  etaLabel: {
    fontWeight: '500',
  },
  etaValue: {
    fontWeight: '700',
    marginTop: moderateScale(1),
  },
});

export default OrderStatus;
