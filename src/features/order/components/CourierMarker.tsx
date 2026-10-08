import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Marker, AnimatedRegion } from 'react-native-maps';
import { TrackingLocation } from '../../../services/tracking/trackingTypes';
import { moderateScale } from '../../../utils/responsive';
import { useTheme } from '../../../theme';

export interface CourierMarkerProps {
  coordinate: TrackingLocation;
  title?: string;
  isDelivered?: boolean;
}

/**
 * Animated Courier Marker
 * Interpolates geographical position smoothly between coordinate ticks (2000ms duration)
 * so the courier glides smoothly across the map without jarring teleportation jumps.
 */
export const CourierMarker: React.FC<CourierMarkerProps> = ({
  coordinate,
  title = 'GigaBox Courier',
  isDelivered = false,
}) => {
  const { theme } = useTheme();

  // Animated Region for smooth marker movement without JS-thread React re-renders
  const animatedRegion = useRef(
    new AnimatedRegion({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
  ).current;

  // Track view changes briefly on mount/status change to rasterize view, then disable to conserve GPU
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  // Subtle pulsing radar effect
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smoothly animate marker to new coordinate over 2000ms
    (animatedRegion.timing as any)({
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
      latitudeDelta: 0,
      longitudeDelta: 0,
      duration: 2000,
      useNativeDriver: false,
    }).start();
  }, [coordinate.latitude, coordinate.longitude, animatedRegion]);

  useEffect(() => {
    setTracksViewChanges(true);
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [isDelivered]);

  useEffect(() => {
    if (isDelivered) return;

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, [pulseAnim, isDelivered]);

  const AnimatedMarker = Marker.Animated as any;

  return (
    <AnimatedMarker
      coordinate={animatedRegion as any}
      title={title}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
    >
      <View style={styles.container}>
        {!isDelivered && (
          <Animated.View
            style={[
              styles.pulseRing,
              {
                borderColor: theme.colors.primary,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        )}

        <View
          style={[
            styles.markerBubble,
            {
              backgroundColor: isDelivered
                ? theme.colors.success
                : theme.colors.primary,
            },
            theme.shadows.md,
          ]}
        >
          <Text style={styles.markerEmoji}>
            {isDelivered ? '✓' : '🛵'}
          </Text>
        </View>

        <View
          style={[
            styles.labelTag,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <Text
            style={[
              styles.labelText,
              {
                color: isDelivered ? theme.colors.success : theme.colors.text,
              },
            ]}
          >
            {isDelivered ? 'Arrived' : 'Courier'}
          </Text>
        </View>
      </View>
    </AnimatedMarker>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: moderateScale(70),
    height: moderateScale(70),
  },
  pulseRing: {
    position: 'absolute',
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    borderWidth: 2,
    opacity: 0.45,
  },
  markerBubble: {
    width: moderateScale(38),
    height: moderateScale(38),
    borderRadius: moderateScale(19),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#ffffff',
  },
  markerEmoji: {
    fontSize: moderateScale(18),
    color: '#ffffff',
  },
  labelTag: {
    marginTop: 2,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  labelText: {
    fontSize: moderateScale(10),
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default CourierMarker;
