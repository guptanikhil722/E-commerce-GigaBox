import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { moderateScale, normalizeFont, scale } from '../../utils/responsive';

export interface QuantityStepperProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onIncrement,
  onDecrement,
  min = 1,
  max = 99,
  size = 'md',
}) => {
  const { theme } = useTheme();

  const isMin = value <= min;
  const isMax = value >= max;

  const isSmall = size === 'sm';
  const buttonDimension = isSmall ? scale(32) : scale(40);
  const fontSizeVal = isSmall ? normalizeFont(13) : normalizeFont(15);

  return (
    <View
      style={[
        styles.container,
        {
          borderColor: theme.colors.border,
          backgroundColor: theme.colors.card, // #fcfafb
          borderRadius: theme.borderRadius.md,
        },
      ]}
      accessibilityRole="adjustable"
      accessibilityLabel={`Quantity: ${value}`}
      accessibilityValue={{ min, max, now: value }}
    >
      {/* Decrement Button */}
      <Pressable
        onPress={onDecrement}
        disabled={isMin}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        style={({ pressed }) => [
          styles.button,
          {
            width: buttonDimension,
            height: buttonDimension,
            opacity: isMin ? 0.35 : pressed ? 0.7 : 1,
          },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text
          style={[
            styles.symbol,
            {
              color: isMin ? theme.colors.textMuted : theme.colors.primary,
              fontSize: normalizeFont(18),
            },
          ]}
        >
          −
        </Text>
      </Pressable>

      {/* Value Display */}
      <View style={styles.valueContainer}>
        <Text
          style={[
            styles.valueText,
            {
              color: theme.colors.text,
              fontSize: fontSizeVal,
              fontWeight: theme.fontWeight.semiBold,
            },
          ]}
        >
          {value}
        </Text>
      </View>

      {/* Increment Button */}
      <Pressable
        onPress={onIncrement}
        disabled={isMax}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        style={({ pressed }) => [
          styles.button,
          {
            width: buttonDimension,
            height: buttonDimension,
            opacity: isMax ? 0.35 : pressed ? 0.7 : 1,
          },
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text
          style={[
            styles.symbol,
            {
              color: isMax ? theme.colors.textMuted : theme.colors.primary,
              fontSize: normalizeFont(18),
            },
          ]}
        >
          +
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbol: {
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
  },
  valueContainer: {
    minWidth: scale(32),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: moderateScale(4),
  },
  valueText: {
    textAlign: 'center',
  },
});

export default QuantityStepper;
