export * from './colors';
export * from './spacing';
export * from './typography';
export * from './shadows';
export * from './ThemeContext';

import { lightColors } from './colors';
import { spacing, borderRadius, layout } from './spacing';
import { typography, fontSize, lineHeight, fontWeight } from './typography';
import { shadows } from './shadows';
import {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  normalizeFont,
  wp,
  hp,
  isIOS,
  isAndroid,
  isTablet,
  isSmallDevice,
} from '../utils/responsive';
import type { Theme } from './ThemeContext';

/**
 * Default static theme instance for direct non-hook usage (e.g. StyleSheet.create outside of components)
 */
export const defaultTheme: Theme = {
  mode: 'light',
  isDark: false,
  colors: lightColors,
  spacing,
  borderRadius,
  layout,
  typography,
  fontSize,
  lineHeight,
  fontWeight,
  shadows,
  responsive: {
    scale,
    verticalScale,
    moderateScale,
    moderateVerticalScale,
    normalizeFont,
    wp,
    hp,
    isIOS,
    isAndroid,
    isTablet,
    isSmallDevice,
  },
};

export default defaultTheme;
