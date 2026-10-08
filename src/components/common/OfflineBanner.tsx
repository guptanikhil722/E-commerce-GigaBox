import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetwork } from '../../services/network/NetworkContext';
import { useTheme } from '../../theme';
import { moderateScale } from '../../utils/responsive';

/**
 * Global Offline Banner
 * Displays a non-intrusive, native-animated banner indicating offline status.
 * Automatically signals when connection is restored before sliding out.
 */
export const OfflineBanner: React.FC = () => {
  const { isOffline } = useNetwork();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);

  // Native animated values for 60fps UI-thread transition
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  // Previous offline ref to detect reconnection
  const wasOfflineRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOffline) {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
        dismissTimerRef.current = null;
      }
      wasOfflineRef.current = true;
      setJustReconnected(false);
      setVisible(true);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (wasOfflineRef.current) {
      // Transition from offline -> reconnected
      wasOfflineRef.current = false;
      setJustReconnected(true);

      // Keep "Back Online" pill visible for 2 seconds, then slide away
      dismissTimerRef.current = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -60,
            duration: 280,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setVisible(false);
          setJustReconnected(false);
        });
      }, 2000);
    }

    return () => {
      if (dismissTimerRef.current) {
        clearTimeout(dismissTimerRef.current);
      }
    };
  }, [isOffline, translateY, opacity]);

  if (!visible) return null;

  const backgroundColor = justReconnected
    ? theme.colors.success
    : theme.colors.warning;
  const textColor = '#ffffff';

  return (
    <Animated.View
      style={[
        styles.bannerContainer,
        {
          top: Math.max(insets.top, 8),
          transform: [{ translateY }],
          opacity,
        },
      ]}
      pointerEvents="none"
    >
      <View
        style={[
          styles.bannerContent,
          {
            backgroundColor,
          },
          theme.shadows.md,
        ]}
      >
        <Text style={styles.bannerIcon}>
          {justReconnected ? '✓' : '⚡'}
        </Text>
        <View style={styles.textColumn}>
          <Text style={[styles.bannerTitle, { color: textColor }]}>
            {justReconnected ? 'Back online' : "You're offline"}
          </Text>
          <Text style={[styles.bannerSubtitle, { color: textColor }]}>
            {justReconnected
              ? 'Catalog synced with live server'
              : 'Browsing cached products'}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  bannerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 9999,
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(14),
    borderRadius: moderateScale(24),
    gap: moderateScale(8),
    maxWidth: '92%',
  },
  bannerIcon: {
    fontSize: moderateScale(14),
    color: '#ffffff',
    fontWeight: '700',
  },
  textColumn: {
    flexDirection: 'column',
  },
  bannerTitle: {
    fontSize: moderateScale(12),
    fontWeight: '700',
    lineHeight: moderateScale(15),
  },
  bannerSubtitle: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    opacity: 0.92,
  },
});

export default OfflineBanner;
