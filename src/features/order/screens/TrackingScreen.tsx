import React, { Suspense, lazy, useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppButton } from '../../../components/common/AppButton';
import { ErrorView } from '../../../components/common/ErrorView';
import { useTheme } from '../../../theme';
import { moderateScale, scale } from '../../../utils/responsive';
import OrderStatus from '../components/OrderStatus';
import TrackingTimeline from '../components/TrackingTimeline';
import { useOrderTracking } from '../hooks/useOrderTracking';
import { getEstimatedDeliveryText } from '../utils/trackingFormatters';
import type { ScreenProps } from '../../../app/navigation/navigationTypes';

// Code splitting / Lazy Loading: Heavy native Google Map component loaded asynchronously
const LazyOrderTrackingMap = lazy(
  () => import('../components/OrderTrackingMap'),
);

const MapSkeleton: React.FC = () => {
  const { theme } = useTheme();
  return (
    <View
      style={[
        styles.mapSkeleton,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <ActivityIndicator size="small" color={theme.colors.primary} />
      <Text
        style={[
          styles.mapSkeletonText,
          {
            color: theme.colors.textMuted,
            fontSize: theme.fontSize.caption,
          },
        ]}
      >
        Initializing live tracking map...
      </Text>
    </View>
  );
};

export const TrackingScreen: React.FC<ScreenProps<'Tracking'>> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const rawOrderId = route.params?.orderId;
  const orderId = rawOrderId || 'GB-89412';

  // Consume live tracking state from Provider + Hook + Redux
  const {
    status,
    location,
    route: deliveryRoute,
    destination,
    origin,
    error,
  } = useOrderTracking(orderId);

  // Stable navigation callbacks
  const handleReturnToCatalog = useCallback(() => {
    navigation.navigate('Catalog');
  }, [navigation]);

  // Header
  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Pressable
        onPress={handleReturnToCatalog}
        accessibilityRole="button"
        accessibilityLabel="Return to Catalog"
        style={({ pressed }) => [
          styles.headerButton,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.75 : 1,
          },
          theme.shadows.sm,
        ]}
      >
        <Text style={[styles.headerButtonIcon, { color: theme.colors.text }]}>
          ✕
        </Text>
      </Pressable>

      <View style={styles.headerTitleColumn}>
        <Text
          style={[
            styles.headerTitle,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.title,
            },
          ]}
        >
          Live Order Tracking
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            {
              color: theme.colors.textMuted,
              fontSize: theme.fontSize.caption,
            },
          ]}
        >
          Order #{orderId}
        </Text>
      </View>

      <View
        style={[
          styles.statusPill,
          {
            backgroundColor:
              status === 'DELIVERED'
                ? theme.colors.successLight
                : theme.colors.primaryLight,
          },
        ]}
      >
        <View
          style={[
            styles.statusPillDot,
            {
              backgroundColor:
                status === 'DELIVERED'
                  ? theme.colors.success
                  : theme.colors.primary,
            },
          ]}
        />
        <Text
          style={[
            styles.statusPillText,
            {
              color:
                status === 'DELIVERED'
                  ? theme.colors.success
                  : theme.colors.primary,
              fontSize: theme.fontSize.caption,
            },
          ]}
        >
          {status === 'DELIVERED'
            ? 'Delivered'
            : status === 'OUT_FOR_DELIVERY'
            ? 'In Transit'
            : status === 'PACKED'
            ? 'Packed'
            : 'Placed'}
        </Text>
      </View>
    </View>
  );

  // Bottom action
  const renderBottomAction = () => (
    <AppButton
      title={status === 'DELIVERED' ? 'Order Complete • Browse Catalog' : 'Continue Shopping'}
      onPress={handleReturnToCatalog}
      variant={status === 'DELIVERED' ? 'primary' : 'outline'}
      size="lg"
      accessibilityLabel="Return to catalog"
    />
  );

  // Error boundary state
  if (error) {
    return (
      <ScreenContainer header={renderHeader()} scrollable={false}>
        <ErrorView
          title="Tracking Unavailable"
          message={error}
          retryText="Return to Catalog"
          onRetry={handleReturnToCatalog}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      header={renderHeader()}
      bottomAction={renderBottomAction()}
      scrollable={true}
    >
      <View
        style={[
          styles.content,
          { paddingHorizontal: theme.spacing.md },
        ]}
      >
        {/* Real-time Map with Route, Destination, and Animated Courier (Lazy Loaded) */}
        <View style={styles.mapCardWrapper}>
          <Suspense fallback={<MapSkeleton />}>
            <LazyOrderTrackingMap
              courierLocation={location}
              route={deliveryRoute}
              destination={destination}
              origin={origin}
              status={status}
            />
          </Suspense>
        </View>

        {/* Live Status Summary Card */}
        <OrderStatus
          orderId={orderId}
          status={status}
          estimatedDelivery={getEstimatedDeliveryText(status)}
        />

        {/* Courier Partner Information Card */}
        <View
          style={[
            styles.courierCard,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.md,
            },
            theme.shadows.sm,
          ]}
        >
          <View style={styles.courierHeader}>
            <View style={styles.courierAvatarBox}>
              <Text style={styles.courierAvatar}>🛵</Text>
            </View>

            <View style={styles.courierInfo}>
              <Text
                style={[
                  styles.courierName,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSize.title,
                  },
                ]}
              >
                Alex Morgan
              </Text>
              <Text
                style={[
                  styles.courierService,
                  {
                    color: theme.colors.textMuted,
                    fontSize: theme.fontSize.caption,
                  },
                ]}
              >
                GigaBox Priority Fleet • 4.9 ★ (340 deliveries)
              </Text>
            </View>

            <View style={styles.contactButtons}>
              <View
                style={[
                  styles.callButton,
                  {
                    backgroundColor: theme.colors.primary,
                  },
                  theme.shadows.sm,
                ]}
              >
                <Text style={styles.callIcon}>📞</Text>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.vehiclePill,
              {
                backgroundColor:
                  status === 'DELIVERED'
                    ? theme.colors.successLight
                    : theme.colors.primaryLight,
              },
            ]}
          >
            <Text
              style={[
                styles.vehicleText,
                {
                  color:
                    status === 'DELIVERED'
                      ? theme.colors.success
                      : theme.colors.primary,
                  fontSize: theme.fontSize.caption,
                },
              ]}
            >
              {status === 'DELIVERED'
                ? '✓ Package successfully received'
                : 'Vehicle: Eco-Electric Delivery Bike • Lic: KA-01-GB-402'}
            </Text>
          </View>
        </View>

        {/* Deterministic Progression Timeline */}
        <TrackingTimeline currentStatus={status} />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
  },
  headerButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerButtonIcon: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  headerTitleColumn: {
    flex: 1,
    marginLeft: moderateScale(12),
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSubtitle: {
    fontWeight: '500',
    marginTop: 1,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(5),
    borderRadius: moderateScale(12),
    gap: 5,
  },
  statusPillDot: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
  },
  statusPillText: {
    fontWeight: '700',
  },
  content: {
    paddingVertical: moderateScale(12),
  },
  mapCardWrapper: {
    marginBottom: moderateScale(14),
  },
  courierCard: {
    borderWidth: 1,
    marginBottom: moderateScale(14),
  },
  courierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(10),
  },
  courierAvatarBox: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    backgroundColor: '#eef5fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: moderateScale(12),
  },
  courierAvatar: {
    fontSize: moderateScale(22),
  },
  courierInfo: {
    flex: 1,
  },
  courierName: {
    fontWeight: '700',
  },
  courierService: {
    fontWeight: '500',
    marginTop: moderateScale(2),
  },
  contactButtons: {
    marginLeft: moderateScale(8),
  },
  callButton: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: moderateScale(18),
  },
  vehiclePill: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(6),
  },
  vehicleText: {
    fontWeight: '600',
  },
  mapSkeleton: {
    height: moderateScale(260),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    gap: moderateScale(8),
  },
  mapSkeletonText: {
    fontWeight: '500',
  },
});

export default TrackingScreen;
