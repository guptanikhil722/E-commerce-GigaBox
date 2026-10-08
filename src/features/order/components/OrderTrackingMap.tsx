import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {
  TrackingLocation,
  TrackingStatus,
} from '../../../services/tracking/trackingTypes';
import { CourierMarker } from './CourierMarker';
import { moderateScale } from '../../../utils/responsive';
import { useTheme } from '../../../theme';

export interface OrderTrackingMapProps {
  courierLocation: TrackingLocation;
  route: TrackingLocation[];
  destination: TrackingLocation;
  origin?: TrackingLocation;
  status: TrackingStatus;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pure presentation map component for live order tracking.
 *
 * Responsibilities:
 * - Renders route polyline, origin hub marker, destination home marker, and animated courier marker.
 * - Fits the delivery route within viewport on initial load.
 * - Allows free user pan/zoom without aggressive camera fights.
 * - Provides a "Recenter" button to re-focus on the active courier location.
 */
export const OrderTrackingMap: React.FC<OrderTrackingMapProps> = ({
  courierLocation,
  route,
  destination,
  origin,
  status,
  style,
}) => {
  const { theme } = useTheme();
  const mapRef = useRef<MapView | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const isInitialFit = useRef(true);

  // Initial camera fit to show full delivery corridor
  useEffect(() => {
    if (route.length > 0 && mapRef.current && isInitialFit.current) {
      isInitialFit.current = false;
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(route, {
          edgePadding: {
            top: moderateScale(45),
            right: moderateScale(45),
            bottom: moderateScale(45),
            left: moderateScale(45),
          },
          animated: true,
        });
      }, 500);
    }
  }, [route]);

  // Recenter map smoothly onto courier
  const handleRecenter = () => {
    setUserInteracted(false);
    mapRef.current?.animateToRegion(
      {
        latitude: courierLocation.latitude,
        longitude: courierLocation.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      },
      800,
    );
  };

  const initialRegion = {
    latitude: courierLocation.latitude,
    longitude: courierLocation.longitude,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsCompass={false}
        showsScale={false}
        showsTraffic={false}
        showsIndoors={false}
        showsBuildings={true}
        onTouchStart={() => setUserInteracted(true)}
      >
        {/* Delivery Route Polyline */}
        {route.length > 1 && (
          <Polyline
            coordinates={route}
            strokeColor={theme.colors.primary}
            strokeWidth={4}
            lineDashPattern={[0]}
          />
        )}

        {/* Origin Hub Marker */}
        {origin && (
          <Marker
            coordinate={origin}
            title="GigaBox Hub"
            description="Order dispatched from here"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View
              style={[
                styles.hubMarker,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                theme.shadows.sm,
              ]}
            >
              <Text style={styles.markerIcon}>🏪</Text>
            </View>
          </Marker>
        )}

        {/* Destination Marker */}
        <Marker
          coordinate={destination}
          title="Delivery Address"
          description="Your destination"
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <View
            style={[
              styles.destinationMarker,
              {
                backgroundColor:
                  status === 'DELIVERED'
                    ? theme.colors.success
                    : theme.colors.primary,
              },
              theme.shadows.md,
            ]}
          >
            <Text style={styles.destinationIcon}>🏠</Text>
          </View>
        </Marker>

        {/* Live Animated Courier Marker */}
        <CourierMarker
          coordinate={courierLocation}
          isDelivered={status === 'DELIVERED'}
        />
      </MapView>

      {/* Recenter Button when user has panned */}
      {userInteracted && (
        <Pressable
          style={[
            styles.recenterButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
            theme.shadows.md,
          ]}
          onPress={handleRecenter}
          accessibilityRole="button"
          accessibilityLabel="Recenter on Courier"
        >
          <Text style={styles.recenterIcon}>🎯</Text>
          <Text
            style={[
              styles.recenterText,
              { color: theme.colors.text, fontSize: theme.fontSize.caption },
            ]}
          >
            Recenter
          </Text>
        </Pressable>
      )}

      {/* Map Badge Indicator */}
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
          theme.shadows.sm,
        ]}
      >
        <View
          style={[
            styles.statusDot,
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
            styles.statusBadgeText,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.caption,
            },
          ]}
        >
          {status === 'DELIVERED'
            ? 'Delivered to Doorstep'
            : status === 'OUT_FOR_DELIVERY'
            ? 'Courier in Transit'
            : 'Fulfillment Center'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: moderateScale(260),
    borderRadius: moderateScale(16),
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFill,
  },
  hubMarker: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(17),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  markerIcon: {
    fontSize: moderateScale(16),
  },
  destinationMarker: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  destinationIcon: {
    fontSize: moderateScale(18),
  },
  recenterButton: {
    position: 'absolute',
    bottom: moderateScale(12),
    right: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(20),
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  recenterIcon: {
    fontSize: moderateScale(14),
  },
  recenterText: {
    fontWeight: '600',
  },
  statusBadge: {
    position: 'absolute',
    top: moderateScale(12),
    left: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(20),
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  statusDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
  statusBadgeText: {
    fontWeight: '600',
  },
});

export default OrderTrackingMap;
