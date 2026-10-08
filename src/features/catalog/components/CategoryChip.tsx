import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../../theme';
import { moderateScale } from '../../../utils/responsive';

export interface CategoryChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  selected,
  onPress,
}) => {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={`Filter by ${label}`}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected
            ? theme.colors.primary // #0466c8
            : theme.colors.card, // #fcfafb
          borderColor: selected
            ? theme.colors.primary
            : theme.colors.border,
          borderRadius: theme.borderRadius.full,
          opacity: pressed ? 0.85 : 1,
        },
        selected ? theme.shadows.blueGlow : theme.shadows.sm,
      ]}
    >
      <Text
        style={[
          styles.label,
          {
            color: selected
              ? theme.colors.buttonPrimaryText // #fcfafb
              : theme.colors.textSecondary,
            fontSize: theme.fontSize.bodySmall,
            fontWeight: selected
              ? theme.fontWeight.semiBold
              : theme.fontWeight.medium,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScale(8),
    marginRight: moderateScale(8),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    letterSpacing: 0.2,
  },
});

export default CategoryChip;
