import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { moderateScale, normalizeFont, verticalScale } from '../../utils/responsive';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = true,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  accessibilityHint,
}) => {
  const { theme } = useTheme();

  const isInteractive = !disabled && !loading;

  // Sizing configurations
  const heightMap: Record<ButtonSize, number> = {
    sm: verticalScale(38),
    md: verticalScale(48), // Standard accessible touch target
    lg: verticalScale(54),
  };

  const fontSizeMap: Record<ButtonSize, number> = {
    sm: normalizeFont(13),
    md: normalizeFont(15),
    lg: normalizeFont(17),
  };

  // Variant color mapping
  const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'secondary':
        return {
          container: {
            backgroundColor: theme.colors.buttonSecondaryBg, // #fcfafb
            borderWidth: 1.5,
            borderColor: theme.colors.buttonSecondaryBorder, // #0466c8
          },
          text: {
            color: theme.colors.buttonSecondaryText, // #0466c8
          },
        };
      case 'outline':
        return {
          container: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.colors.primary,
          },
          text: {
            color: theme.colors.primary,
          },
        };
      case 'danger':
        return {
          container: {
            backgroundColor: theme.colors.error,
          },
          text: {
            color: '#ffffff',
          },
        };
      case 'ghost':
        return {
          container: {
            backgroundColor: 'transparent',
          },
          text: {
            color: theme.colors.primary,
          },
        };
      case 'primary':
      default:
        return {
          container: {
            backgroundColor: theme.colors.buttonPrimaryBg, // #0466c8
          },
          text: {
            color: theme.colors.buttonPrimaryText, // #fcfafb
          },
        };
    }
  };

  const { container: variantContainerStyle, text: variantTextStyle } = getVariantStyles();

  return (
    <Pressable
      onPress={isInteractive ? onPress : undefined}
      disabled={!isInteractive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          height: heightMap[size],
          borderRadius: theme.borderRadius.md,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.5 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && isInteractive ? 0.98 : 1 }],
        },
        variantContainerStyle,
        variant === 'primary' && !disabled ? theme.shadows.blueGlow : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantTextStyle.color as string}
        />
      ) : (
        <View style={styles.contentRow}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.textBase,
              {
                fontSize: fontSizeMap[size],
                fontWeight: theme.fontWeight.semiBold,
              },
              variantTextStyle,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: moderateScale(16),
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: moderateScale(8),
  },
  iconRight: {
    marginLeft: moderateScale(8),
  },
  textBase: {
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});

export default AppButton;
