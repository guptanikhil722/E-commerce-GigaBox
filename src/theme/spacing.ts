import {
  moderateScale,
  moderateVerticalScale,
  scale,
  verticalScale,
} from '../utils/responsive';

/**
 * Standard base numeric values (in dp)
 */
export const baseSpacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  xxxl: 48,
  huge: 64,
} as const;

/**
 * Pre-computed responsive spacing tokens (margins, paddings, gaps)
 * Uses moderateScale (factor = 0.5) to keep elements balanced on tablets and small screens.
 */
export const spacing = {
  none: 0,
  xxs: moderateScale(baseSpacing.xxs),
  xs: moderateScale(baseSpacing.xs),
  sm: moderateScale(baseSpacing.sm),
  md: moderateScale(baseSpacing.md),
  lg: moderateScale(baseSpacing.lg),
  xl: moderateScale(baseSpacing.xl),
  xxl: moderateScale(baseSpacing.xxl),
  xxxl: moderateScale(baseSpacing.xxxl),
  huge: moderateScale(baseSpacing.huge),
};

/**
 * Responsive Border Radii
 */
export const borderRadius = {
  none: 0,
  xs: moderateScale(4),
  sm: moderateScale(8),
  md: moderateScale(12),
  lg: moderateScale(16),
  xl: moderateScale(24),
  xxl: moderateScale(32),
  full: 9999,
};

/**
 * Common Responsive Layout Dimensions
 */
export const layout = {
  // Screen and Content Insets
  screenPadding: moderateScale(16),
  screenPaddingHorizontal: scale(16),
  screenPaddingVertical: verticalScale(16),

  // Modals & Sheets
  modalPadding: moderateScale(20),
  modalBorderRadius: moderateScale(20),
  modalMaxWidth: scale(480),

  // Cards
  cardPadding: moderateScale(16),
  cardBorderRadius: moderateScale(14),

  // Buttons & Inputs
  buttonHeightSm: moderateVerticalScale(36),
  buttonHeightMd: moderateVerticalScale(48), // standard touch target
  buttonHeightLg: moderateVerticalScale(56),
  buttonBorderRadius: moderateScale(12),
  buttonPaddingHorizontal: moderateScale(20),

  inputHeight: moderateVerticalScale(48),
  inputBorderRadius: moderateScale(10),
  inputPaddingHorizontal: moderateScale(14),

  // Header / App Bar
  headerHeight: moderateVerticalScale(56),
  bottomTabHeight: moderateVerticalScale(60),

  // Icon sizes
  iconXs: moderateScale(16),
  iconSm: moderateScale(20),
  iconMd: moderateScale(24),
  iconLg: moderateScale(32),
  iconXl: moderateScale(40),
};

/**
 * Helper utility to build responsive box padding or margin objects
 * Supports CSS-like shorthands: 1 arg (all), 2 args (v, h), 4 args (t, r, b, l)
 */
export const createResponsivePadding = (
  top: number,
  right?: number,
  bottom?: number,
  left?: number,
) => {
  if (right === undefined) {
    // 1 arg: all sides
    const val = moderateScale(top);
    return {
      paddingTop: val,
      paddingRight: val,
      paddingBottom: val,
      paddingLeft: val,
    };
  }
  if (bottom === undefined) {
    // 2 args: [vertical, horizontal]
    const v = moderateVerticalScale(top);
    const h = moderateScale(right);
    return {
      paddingTop: v,
      paddingBottom: v,
      paddingLeft: h,
      paddingRight: h,
    };
  }
  // 4 args: [top, right, bottom, left]
  return {
    paddingTop: moderateVerticalScale(top),
    paddingRight: moderateScale(right),
    paddingBottom: moderateVerticalScale(bottom),
    paddingLeft: moderateScale(left ?? right),
  };
};

export const createResponsiveMargin = (
  top: number,
  right?: number,
  bottom?: number,
  left?: number,
) => {
  if (right === undefined) {
    const val = moderateScale(top);
    return {
      marginTop: val,
      marginRight: val,
      marginBottom: val,
      marginLeft: val,
    };
  }
  if (bottom === undefined) {
    const v = moderateVerticalScale(top);
    const h = moderateScale(right);
    return {
      marginTop: v,
      marginBottom: v,
      marginLeft: h,
      marginRight: h,
    };
  }
  return {
    marginTop: moderateVerticalScale(top),
    marginRight: moderateScale(right),
    marginBottom: moderateVerticalScale(bottom),
    marginLeft: moderateScale(left ?? right),
  };
};
