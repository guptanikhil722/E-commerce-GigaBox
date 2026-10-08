import { ViewStyle } from 'react-native';
import { moderateScale, moderateVerticalScale, isIOS } from '../utils/responsive';

/**
 * Cross-Platform Responsive Shadows
 * Provides subtle elevation on Android and tuned drop shadows on iOS
 */
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  } as ViewStyle,

  sm: isIOS
    ? ({
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: moderateVerticalScale(1),
        },
        shadowOpacity: 0.06,
        shadowRadius: moderateScale(3),
      } as ViewStyle)
    : ({
        elevation: 2,
      } as ViewStyle),

  md: isIOS
    ? ({
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: moderateVerticalScale(3),
        },
        shadowOpacity: 0.08,
        shadowRadius: moderateScale(6),
      } as ViewStyle)
    : ({
        elevation: 4,
      } as ViewStyle),

  lg: isIOS
    ? ({
        shadowColor: '#000000',
        shadowOffset: {
          width: 0,
          height: moderateVerticalScale(6),
        },
        shadowOpacity: 0.12,
        shadowRadius: moderateScale(12),
      } as ViewStyle)
    : ({
        elevation: 8,
      } as ViewStyle),

  // Blue Glow for CTA / primary buttons
  blueGlow: isIOS
    ? ({
        shadowColor: '#0466c8',
        shadowOffset: {
          width: 0,
          height: moderateVerticalScale(4),
        },
        shadowOpacity: 0.28,
        shadowRadius: moderateScale(8),
      } as ViewStyle)
    : ({
        elevation: 6,
      } as ViewStyle),
};
