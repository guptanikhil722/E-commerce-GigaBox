import { TextStyle } from 'react-native';
import { normalizeFont, moderateVerticalScale, isIOS } from '../utils/responsive';

/**
 * Base Font Sizes (in points)
 */
export const baseFontSize = {
  h1: 32,
  h2: 24,
  h3: 20,
  h4: 18,
  title: 16,
  bodyLarge: 16,
  body: 14,
  bodySmall: 12,
  caption: 11,
  button: 15,
} as const;

/**
 * Responsive Normalized Font Sizes
 * Automatically adapts based on PixelRatio, screen width, and user accessibility scale
 */
export const fontSize = {
  h1: normalizeFont(baseFontSize.h1),
  h2: normalizeFont(baseFontSize.h2),
  h3: normalizeFont(baseFontSize.h3),
  h4: normalizeFont(baseFontSize.h4),
  title: normalizeFont(baseFontSize.title),
  bodyLarge: normalizeFont(baseFontSize.bodyLarge),
  body: normalizeFont(baseFontSize.body),
  bodySmall: normalizeFont(baseFontSize.bodySmall),
  caption: normalizeFont(baseFontSize.caption),
  button: normalizeFont(baseFontSize.button),
};

/**
 * Responsive Line Heights
 */
export const lineHeight = {
  h1: moderateVerticalScale(40),
  h2: moderateVerticalScale(32),
  h3: moderateVerticalScale(28),
  h4: moderateVerticalScale(24),
  title: moderateVerticalScale(22),
  bodyLarge: moderateVerticalScale(24),
  body: moderateVerticalScale(20),
  bodySmall: moderateVerticalScale(16),
  caption: moderateVerticalScale(14),
  button: moderateVerticalScale(20),
};

/**
 * Font Weights
 */
export const fontWeight = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
};

/**
 * Platform Font Families
 */
export const fontFamily = {
  regular: isIOS ? 'System' : 'sans-serif',
  medium: isIOS ? 'System' : 'sans-serif-medium',
  bold: isIOS ? 'System' : 'sans-serif',
};

/**
 * Pre-defined Responsive Typography Styles
 */
export const typography: Record<string, TextStyle> = {
  h1: {
    fontSize: fontSize.h1,
    lineHeight: lineHeight.h1,
    fontWeight: fontWeight.bold,
  },
  h2: {
    fontSize: fontSize.h2,
    lineHeight: lineHeight.h2,
    fontWeight: fontWeight.bold,
  },
  h3: {
    fontSize: fontSize.h3,
    lineHeight: lineHeight.h3,
    fontWeight: fontWeight.semiBold,
  },
  h4: {
    fontSize: fontSize.h4,
    lineHeight: lineHeight.h4,
    fontWeight: fontWeight.semiBold,
  },
  bodyLarge: {
    fontSize: fontSize.bodyLarge,
    lineHeight: lineHeight.bodyLarge,
    fontWeight: fontWeight.regular,
  },
  body: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: fontWeight.regular,
  },
  bodyMedium: {
    fontSize: fontSize.body,
    lineHeight: lineHeight.body,
    fontWeight: fontWeight.medium,
  },
  bodySmall: {
    fontSize: fontSize.bodySmall,
    lineHeight: lineHeight.bodySmall,
    fontWeight: fontWeight.regular,
  },
  caption: {
    fontSize: fontSize.caption,
    lineHeight: lineHeight.caption,
    fontWeight: fontWeight.regular,
  },
  button: {
    fontSize: fontSize.button,
    lineHeight: lineHeight.button,
    fontWeight: fontWeight.semiBold,
    letterSpacing: 0.3,
  },
};
