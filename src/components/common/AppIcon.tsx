import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme';
import { moderateScale } from '../../utils/responsive';

export type IconName =
  | 'search'
  | 'cart'
  | 'back'
  | 'plus'
  | 'minus'
  | 'delete'
  | 'location'
  | 'retry'
  | 'offline'
  | 'online'
  | 'success'
  | 'error'
  | 'star'
  | 'clock'
  | 'phone'
  | 'check';

export interface AppIconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
  accessibilityLabel?: string;
}

const GLYPH_MAP: Record<IconName, string> = {
  search: '🔍',
  cart: '🛒',
  back: '←',
  plus: '+',
  minus: '−',
  delete: '🗑️',
  location: '📍',
  retry: '↻',
  offline: '⚡',
  online: '✓',
  success: '✓',
  error: '⚠',
  star: '★',
  clock: '⏱️',
  phone: '📞',
  check: '✓',
};

/**
 * Reusable, High-Performance AppIcon Component
 * Resolution-independent, zero heavy PNG overhead, accessible and theme-aware.
 */
export const AppIcon: React.FC<AppIconProps> = ({
  name,
  size,
  color,
  style,
  accessibilityLabel,
}) => {
  const { theme } = useTheme();
  const iconSize = size ?? moderateScale(16);
  const iconColor = color ?? theme.colors.text;
  const glyph = GLYPH_MAP[name] || '•';

  return (
    <Text
      style={[
        styles.icon,
        {
          fontSize: iconSize,
          color: iconColor,
        },
        style,
      ]}
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel || `${name} icon`}
    >
      {glyph}
    </Text>
  );
};

const styles = StyleSheet.create({
  icon: {
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default React.memo(AppIcon);
