import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme';
import { useNetwork } from '../../../services/network/NetworkContext';
import {
  moderateScale,
  scale,
  verticalScale,
} from '../../../utils/responsive';

declare const process: any;

export interface NetworkErrorScreenProps {
  onRetry?: () => Promise<boolean> | void;
}

/**
 * Dedicated Full-Screen Network Error Screen
 * Displayed when the device loses internet connectivity.
 * Features 60 FPS UI-thread radar pulse animation, troubleshooting diagnostics,
 * and an interactive retry button.
 */
export const NetworkErrorScreen: React.FC<NetworkErrorScreenProps> = ({ onRetry }) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { isOnline, checkConnectivity } = useNetwork();

  const [isRetrying, setIsRetrying] = useState(false);
  const [retryFeedback, setRetryFeedback] = useState<string | null>(null);

  // Native animated values for radar pulse & button
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const pulseOpacity1 = useRef(new Animated.Value(0.4)).current;
  const pulseOpacity2 = useRef(new Animated.Value(0.25)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const contentFade = useRef(new Animated.Value(0)).current;

  // Feedback timeout ref
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const useNative = process.env.NODE_ENV !== 'test';

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      contentFade.setValue(1);
      return;
    }

    // Fade in screen content on mount
    Animated.timing(contentFade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: useNative,
    }).start();

    // Continuous 60fps concentric radar ripple loop
    const ripple1 = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseAnim1, {
          toValue: 1.35,
          duration: 1800,
          useNativeDriver: useNative,
        }),
        Animated.timing(pulseOpacity1, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: useNative,
        }),
      ]),
    );

    const ripple2 = Animated.loop(
      Animated.sequence([
        Animated.delay(450),
        Animated.parallel([
          Animated.timing(pulseAnim2, {
            toValue: 1.45,
            duration: 1800,
            useNativeDriver: useNative,
          }),
          Animated.timing(pulseOpacity2, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: useNative,
          }),
        ]),
      ]),
    );

    ripple1.start();
    ripple2.start();

    return () => {
      ripple1.stop();
      ripple2.stop();
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [contentFade, pulseAnim1, pulseAnim2, pulseOpacity1, pulseOpacity2, useNative]);

  const handleRetryPress = useCallback(async () => {
    if (isRetrying) return;

    // Tactile button bounce
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.94,
        duration: 90,
        useNativeDriver: useNative,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: useNative,
      }),
    ]).start();

    setIsRetrying(true);
    setRetryFeedback(null);

    try {
      let online = false;
      if (onRetry) {
        const result = await onRetry();
        online = typeof result === 'boolean' ? result : isOnline;
      } else {
        online = await checkConnectivity();
      }

      if (!online) {
        setRetryFeedback('Still offline. Please check your connection.');
        if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
        feedbackTimeoutRef.current = setTimeout(() => {
          setRetryFeedback(null);
        }, 3500);
      }
    } catch {
      setRetryFeedback('Unable to reach network. Please try again.');
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, buttonScale, onRetry, isOnline, checkConnectivity]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: Math.max(insets.top + verticalScale(14), verticalScale(36)),
          paddingBottom: Math.max(insets.bottom, verticalScale(20)),
        },
      ]}
      accessibilityRole="alert"
      accessibilityLabel="No Internet Connection Screen"
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <Animated.View style={{ opacity: contentFade, width: '100%', alignItems: 'center' }}>
          {/* Top Status Pill */}
          <View
            style={[
              styles.statusPill,
              {
                backgroundColor: theme.colors.errorLight,
                borderColor: theme.colors.error,
              },
            ]}
          >
            <View style={[styles.statusDot, { backgroundColor: theme.colors.error }]} />
            <Text
              style={[
                styles.statusPillText,
                { color: theme.colors.error },
              ]}
            >
              NO INTERNET CONNECTION
            </Text>
          </View>

          {/* Radar Pulse Icon Graphic */}
          <View style={styles.graphicContainer}>
            {/* Concentric Animated Waves */}
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: theme.colors.error,
                  transform: [{ scale: pulseAnim2 }],
                  opacity: pulseOpacity2,
                },
              ]}
            />
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  borderColor: theme.colors.error,
                  transform: [{ scale: pulseAnim1 }],
                  opacity: pulseOpacity1,
                },
              ]}
            />

            {/* Central Icon Disc */}
            <View
              style={[
                styles.iconDisc,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
                theme.shadows.md,
              ]}
            >
              <Text style={styles.iconGlyph}>📡</Text>
              <View
                style={[
                  styles.badgeSlash,
                  { backgroundColor: theme.colors.error },
                ]}
              >
                <Text style={styles.badgeSlashText}>✕</Text>
              </View>
            </View>
          </View>

          {/* Heading & Subtitle */}
          <Text
            style={[
              styles.heading,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.h2,
                lineHeight: theme.lineHeight.h2,
              },
            ]}
          >
            You're Offline
          </Text>

          <Text
            style={[
              styles.subheading,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.fontSize.body,
                lineHeight: theme.lineHeight.body,
              },
            ]}
          >
            GigaBox requires an active internet connection to browse products, update your cart, and complete orders.
          </Text>

          {/* Troubleshooting Diagnostics Card */}
          <View
            style={[
              styles.tipsCard,
              {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.border,
              },
              theme.shadows.sm,
            ]}
          >
            <Text
              style={[
                styles.tipsTitle,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSize.caption,
                },
              ]}
            >
              QUICK TROUBLESHOOTING
            </Text>

            <View style={styles.tipRow}>
              <View
                style={[
                  styles.tipIconCircle,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <Text style={styles.tipEmoji}>📶</Text>
              </View>
              <View style={styles.tipTextCol}>
                <Text style={[styles.tipHeading, { color: theme.colors.text }]}>
                  Wi-Fi & Cellular Data
                </Text>
                <Text
                  style={[
                    styles.tipDesc,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Verify your Wi-Fi or mobile data toggle is turned ON.
                </Text>
              </View>
            </View>

            <View style={styles.tipDivider} />

            <View style={styles.tipRow}>
              <View
                style={[
                  styles.tipIconCircle,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <Text style={styles.tipEmoji}>✈️</Text>
              </View>
              <View style={styles.tipTextCol}>
                <Text style={[styles.tipHeading, { color: theme.colors.text }]}>
                  Airplane Mode
                </Text>
                <Text
                  style={[
                    styles.tipDesc,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Toggle Airplane Mode ON for 5 seconds and turn it OFF.
                </Text>
              </View>
            </View>

            <View style={styles.tipDivider} />

            <View style={styles.tipRow}>
              <View
                style={[
                  styles.tipIconCircle,
                  { backgroundColor: theme.colors.background },
                ]}
              >
                <Text style={styles.tipEmoji}>🔄</Text>
              </View>
              <View style={styles.tipTextCol}>
                <Text style={[styles.tipHeading, { color: theme.colors.text }]}>
                  Router & Signal
                </Text>
                <Text
                  style={[
                    styles.tipDesc,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  Move closer to your router or check other apps.
                </Text>
              </View>
            </View>
          </View>

          {/* Retry Feedback Toast */}
          {retryFeedback ? (
            <View
              style={[
                styles.feedbackBanner,
                {
                  backgroundColor: theme.colors.errorLight,
                  borderColor: theme.colors.error,
                },
              ]}
            >
              <Text style={styles.feedbackIcon}>⚠️</Text>
              <Text
                style={[
                  styles.feedbackText,
                  { color: theme.colors.error },
                ]}
              >
                {retryFeedback}
              </Text>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      {/* Bottom Sticky Action Area */}
      <View style={styles.actionContainer}>
        <Animated.View style={{ transform: [{ scale: buttonScale }], width: '100%' }}>
          <Pressable
            onPress={handleRetryPress}
            disabled={isRetrying}
            accessibilityRole="button"
            accessibilityLabel="Retry internet connection"
            style={({ pressed }) => [
              styles.retryButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: pressed || isRetrying ? 0.85 : 1,
              },
              theme.shadows.md,
            ]}
          >
            {isRetrying ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#ffffff" style={styles.spinner} />
                <Text style={styles.retryButtonText}>Checking Connection...</Text>
              </View>
            ) : (
              <View style={styles.loadingRow}>
                <Text style={styles.retryIconGlyph}>↻</Text>
                <Text style={styles.retryButtonText}>Try Again</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
};

export default NetworkErrorScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingBottom: verticalScale(20),
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    marginTop: verticalScale(12),
    marginBottom: verticalScale(24),
  },
  statusDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: scale(3.5),
    marginRight: scale(6),
  },
  statusPillText: {
    fontSize: moderateScale(11),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  graphicContainer: {
    width: scale(140),
    height: scale(140),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(24),
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: scale(130),
    height: scale(130),
    borderRadius: scale(65),
    borderWidth: 2,
  },
  iconDisc: {
    width: scale(88),
    height: scale(88),
    borderRadius: scale(44),
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconGlyph: {
    fontSize: moderateScale(38),
  },
  badgeSlash: {
    position: 'absolute',
    bottom: scale(2),
    right: scale(2),
    width: scale(24),
    height: scale(24),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  badgeSlashText: {
    color: '#ffffff',
    fontSize: moderateScale(11),
    fontWeight: '900',
  },
  heading: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: verticalScale(8),
    letterSpacing: -0.4,
  },
  subheading: {
    textAlign: 'center',
    paddingHorizontal: scale(12),
    lineHeight: verticalScale(20),
    marginBottom: verticalScale(24),
  },
  tipsCard: {
    width: '100%',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    padding: scale(16),
    marginBottom: verticalScale(16),
  },
  tipsTitle: {
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: verticalScale(12),
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tipIconCircle: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  tipEmoji: {
    fontSize: moderateScale(18),
  },
  tipTextCol: {
    flex: 1,
  },
  tipHeading: {
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginBottom: verticalScale(2),
  },
  tipDesc: {
    fontSize: moderateScale(12),
    lineHeight: verticalScale(16),
  },
  tipDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#dee2e6',
    marginVertical: verticalScale(10),
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(14),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(10),
    borderWidth: 1,
    marginBottom: verticalScale(12),
    width: '100%',
  },
  feedbackIcon: {
    fontSize: moderateScale(14),
    marginRight: scale(8),
  },
  feedbackText: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    flex: 1,
  },
  actionContainer: {
    width: '100%',
    paddingHorizontal: scale(24),
    paddingTop: verticalScale(8),
  },
  retryButton: {
    height: verticalScale(50),
    borderRadius: moderateScale(12),
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    marginRight: scale(8),
  },
  retryIconGlyph: {
    color: '#ffffff',
    fontSize: moderateScale(18),
    fontWeight: '800',
    marginRight: scale(8),
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: moderateScale(15),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
