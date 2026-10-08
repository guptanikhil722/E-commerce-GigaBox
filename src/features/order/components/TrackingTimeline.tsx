import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../theme';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';
import type { TrackingStatusType } from './OrderStatus';

export interface TrackingStep {
  status: TrackingStatusType;
  title: string;
  description: string;
  time: string;
  icon: string;
}

const STEPS: TrackingStep[] = [
  {
    status: 'PLACED',
    title: 'Order Placed',
    description: 'We have received your order details and confirmed payment.',
    time: '2:15 PM',
    icon: '✓',
  },
  {
    status: 'PACKED',
    title: 'Order Packed',
    description: 'Items have been sanitized, securely boxed and labeled.',
    time: '3:00 PM',
    icon: '📦',
  },
  {
    status: 'OUT_FOR_DELIVERY',
    title: 'Out for Delivery',
    description: 'Courier partner is en route with your package.',
    time: '3:45 PM',
    icon: '🚴',
  },
  {
    status: 'DELIVERED',
    title: 'Delivered',
    description: 'Package delivered at your doorstep.',
    time: 'Pending',
    icon: '🏠',
  },
];

const STATUS_ORDER: TrackingStatusType[] = [
  'PLACED',
  'PACKED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export interface TrackingTimelineProps {
  currentStatus: TrackingStatusType;
}

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({
  currentStatus,
}) => {
  const { theme } = useTheme();

  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card, // #fcfafb
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
        },
        theme.shadows.sm,
      ]}
    >
      <Text
        style={[
          styles.heading,
          {
            color: theme.colors.text,
            fontSize: theme.fontSize.title,
            marginBottom: theme.spacing.md,
          },
        ]}
      >
        Delivery Timeline
      </Text>

      <View style={styles.timelineList}>
        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isPending = index > currentIndex;
          const isLast = index === STEPS.length - 1;

          // Step dot color
          const dotBgColor = isActive
            ? theme.colors.primary // #0466c8
            : isCompleted
            ? theme.colors.primary // #0466c8
            : theme.colors.background;

          const dotBorderColor = isPending
            ? theme.colors.border
            : theme.colors.primary;

          const dotTextColor = isPending
            ? theme.colors.textMuted
            : '#ffffff';

          return (
            <View key={step.status} style={styles.stepContainer}>
              {/* Left Column: Dot & Connector Line */}
              <View style={styles.connectorColumn}>
                <View
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor: dotBgColor,
                      borderColor: dotBorderColor,
                    },
                    isActive ? theme.shadows.blueGlow : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.dotIconText,
                      { color: dotTextColor },
                    ]}
                  >
                    {isCompleted ? '✓' : isActive ? '●' : index + 1}
                  </Text>
                </View>

                {!isLast && (
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor:
                          index < currentIndex
                            ? theme.colors.primary
                            : theme.colors.border,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Right Column: Step Content */}
              <View style={[styles.contentColumn, !isLast && styles.contentSpacing]}>
                <View style={styles.titleRow}>
                  <Text
                    style={[
                      styles.stepTitle,
                      {
                        color: isPending
                          ? theme.colors.textMuted
                          : theme.colors.text,
                        fontSize: theme.fontSize.body,
                        fontWeight: isActive
                          ? theme.fontWeight.bold
                          : theme.fontWeight.semiBold,
                      },
                    ]}
                  >
                    {step.title}
                  </Text>
                  <Text
                    style={[
                      styles.stepTime,
                      {
                        color: isActive
                          ? theme.colors.primary
                          : theme.colors.textMuted,
                        fontSize: theme.fontSize.caption,
                      },
                    ]}
                  >
                    {step.time}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.stepDesc,
                    {
                      color: isPending
                        ? theme.colors.textMuted
                        : theme.colors.textSecondary,
                      fontSize: theme.fontSize.bodySmall,
                      lineHeight: theme.lineHeight.bodySmall,
                    },
                  ]}
                >
                  {step.description}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginBottom: moderateScale(14),
  },
  heading: {
    fontWeight: '700',
  },
  timelineList: {
    paddingLeft: moderateScale(4),
  },
  stepContainer: {
    flexDirection: 'row',
  },
  connectorColumn: {
    alignItems: 'center',
    marginRight: moderateScale(14),
  },
  stepDot: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  dotIconText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: moderateScale(2),
  },
  contentColumn: {
    flex: 1,
    paddingTop: moderateScale(2),
  },
  contentSpacing: {
    paddingBottom: verticalScale(22),
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(3),
  },
  stepTitle: {
    flex: 1,
  },
  stepTime: {
    fontWeight: '600',
  },
  stepDesc: {
    fontWeight: '400',
  },
});

export default TrackingTimeline;
