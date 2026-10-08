import { Dimensions, PixelRatio, Platform, ScaledSize } from 'react-native';
import { useEffect, useState } from 'react';

/**
 * Standard Design Canvas Guidelines (Based on standard mobile viewport - iPhone 11/X / modern Android)
 * Base dimensions: 375 x 812
 */
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Initial window dimensions
let { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Keep dimensions synchronized when orientation or window size changes (e.g. foldables / tablets)
Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
  SCREEN_WIDTH = window.width;
  SCREEN_HEIGHT = window.height;
});

/**
 * Platform flags
 */
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

/**
 * Device categorization
 */
export const isTablet = () => {
  const pixelDensity = PixelRatio.get();
  const adjustedWidth = SCREEN_WIDTH * pixelDensity;
  const adjustedHeight = SCREEN_HEIGHT * pixelDensity;
  if (pixelDensity < 2 && (adjustedWidth >= 1000 || adjustedHeight >= 1000)) {
    return true;
  }
  return (
    pixelDensity === 2 && (adjustedWidth >= 1920 || adjustedHeight >= 1920)
  );
};

export const isSmallDevice = () => SCREEN_WIDTH < 360;

/**
 * Horizontal Scale:
 * Scales dimensions based on screen width.
 * Best for: component widths, horizontal margins/paddings, horizontal coordinates.
 */
export const scale = (size: number): number => {
  const ratio = SCREEN_WIDTH / BASE_WIDTH;
  const newSize = size * ratio;
  return PixelRatio.roundToNearestPixel(newSize);
};

/**
 * Vertical Scale:
 * Scales dimensions based on screen height.
 * Best for: component heights, vertical margins/paddings, vertical coordinates.
 */
export const verticalScale = (size: number): number => {
  const ratio = SCREEN_HEIGHT / BASE_HEIGHT;
  const newSize = size * ratio;
  return PixelRatio.roundToNearestPixel(newSize);
};

/**
 * Moderate Scale:
 * A blend of raw size and scaled size controlled by a moderation factor (default: 0.5).
 * Prevents UI elements from growing too large on tablets or shrinking too much on smaller screens.
 * Best for: padding, margin, icons, border radius, card widths.
 */
export const moderateScale = (size: number, factor = 0.5): number => {
  const scaled = scale(size);
  const newSize = size + (scaled - size) * factor;
  return PixelRatio.roundToNearestPixel(newSize);
};

/**
 * Moderate Vertical Scale:
 * Same as moderateScale but for vertical metrics.
 * Best for: vertical padding, item heights, list item gaps.
 */
export const moderateVerticalScale = (size: number, factor = 0.5): number => {
  const scaled = verticalScale(size);
  const newSize = size + (scaled - size) * factor;
  return PixelRatio.roundToNearestPixel(newSize);
};

/**
 * Normalize Font:
 * Scales typography proportionally across different screen sizes and pixel densities.
 * Clamps extreme accessibility font-scale overrides to preserve UI integrity while respecting readability.
 *
 * @param size Base font size from design
 * @param factor Moderation factor (default 0.5 for subtle adaptation)
 */
export const normalizeFont = (size: number, factor = 0.5): number => {
  const scaleRatio = SCREEN_WIDTH / BASE_WIDTH;
  const scaledSize = size * scaleRatio;
  const moderatedSize = size + (scaledSize - size) * factor;

  // Account for user's OS font scaling setting (safely clamped)
  const fontScale = PixelRatio.getFontScale();
  const clampedFontScale = Math.min(Math.max(fontScale, 0.85), 1.3);

  // Slight platform adjustment if needed (Android font rendering tends to appear slightly larger)
  const platformAdjustment = isAndroid ? 0.98 : 1.0;

  const finalSize = moderatedSize * clampedFontScale * platformAdjustment;
  return Math.round(PixelRatio.roundToNearestPixel(finalSize));
};

/**
 * Width Percentage to DP:
 * Converts percentage string or number to dp based on viewport width.
 * e.g., wp('50%') or wp(50) returns 50% of the device width.
 */
export const wp = (widthPercent: number | string): number => {
  const elemWidth =
    typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

/**
 * Height Percentage to DP:
 * Converts percentage string or number to dp based on viewport height.
 * e.g., hp('100%') or hp(100) returns 100% of the device height.
 */
export const hp = (heightPercent: number | string): number => {
  const elemHeight =
    typeof heightPercent === 'number'
      ? heightPercent
      : parseFloat(heightPercent);
  return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

/**
 * Dynamic Hook: useResponsive
 * Provides dynamic screen dimensions, orientation, and responsive scale helpers that automatically
 * update whenever the window rotates or resizes (e.g. iPad multitasking, foldables).
 */
export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener(
      'change',
      ({ window }: { window: ScaledSize }) => {
        setDimensions(window);
      },
    );
    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const isPortrait = height >= width;
  const isLandscape = width > height;

  const dynamicScale = (size: number) =>
    PixelRatio.roundToNearestPixel(size * (width / BASE_WIDTH));

  const dynamicVerticalScale = (size: number) =>
    PixelRatio.roundToNearestPixel(size * (height / BASE_HEIGHT));

  const dynamicModerateScale = (size: number, factor = 0.5) => {
    const s = dynamicScale(size);
    return PixelRatio.roundToNearestPixel(size + (s - size) * factor);
  };

  const dynamicNormalizeFont = (size: number, factor = 0.5) => {
    const scaleRatio = width / BASE_WIDTH;
    const scaledSize = size * scaleRatio;
    const moderated = size + (scaledSize - size) * factor;
    const clampedFontScale = Math.min(
      Math.max(PixelRatio.getFontScale(), 0.85),
      1.3,
    );
    const platformAdj = isAndroid ? 0.98 : 1.0;
    return Math.round(
      PixelRatio.roundToNearestPixel(moderated * clampedFontScale * platformAdj),
    );
  };

  const dynamicWp = (percent: number | string) => {
    const val = typeof percent === 'number' ? percent : parseFloat(percent);
    return PixelRatio.roundToNearestPixel((width * val) / 100);
  };

  const dynamicHp = (percent: number | string) => {
    const val = typeof percent === 'number' ? percent : parseFloat(percent);
    return PixelRatio.roundToNearestPixel((height * val) / 100);
  };

  return {
    width,
    height,
    isPortrait,
    isLandscape,
    isTablet: isTablet(),
    isSmallDevice: width < 360,
    isIOS,
    isAndroid,
    scale: dynamicScale,
    verticalScale: dynamicVerticalScale,
    moderateScale: dynamicModerateScale,
    normalizeFont: dynamicNormalizeFont,
    wp: dynamicWp,
    hp: dynamicHp,
    pixelRatio: PixelRatio.get(),
    fontScale: PixelRatio.getFontScale(),
  };
};

/**
 * Universal Unit Scaler:
 * Convenience helper to scale all box model properties (margins, paddings, borders).
 */
export const responsiveUnit = {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  normalizeFont,
  wp,
  hp,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
};

export default responsiveUnit;
