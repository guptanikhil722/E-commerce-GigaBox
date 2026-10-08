import React from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../../../theme';
import { moderateScale, normalizeFont, verticalScale } from '../../../utils/responsive';

export interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear?: () => void;
  placeholder?: string;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search products, electronics, gear...',
  style,
}) => {
  const { theme } = useTheme();

  const handleClear = () => {
    onChangeText('');
    onClear?.();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card, // #fcfafb
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
        },
        theme.shadows.sm,
        style,
      ]}
    >
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            color: theme.colors.text,
            fontSize: theme.fontSize.body,
          },
        ]}
        returnKeyType="search"
        onSubmitEditing={Keyboard.dismiss}
        accessibilityLabel="Search products"
        accessibilityRole="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      {value.length > 0 && (
        <Pressable
          onPress={handleClear}
          accessibilityRole="button"
          accessibilityLabel="Clear search text"
          style={styles.clearButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.clearIcon, { color: theme.colors.textMuted }]}>
            ✕
          </Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: verticalScale(48),
    paddingHorizontal: moderateScale(14),
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: normalizeFont(16),
    marginRight: moderateScale(10),
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    fontWeight: '400',
  },
  clearButton: {
    padding: moderateScale(4),
  },
  clearIcon: {
    fontSize: normalizeFont(14),
    fontWeight: '700',
  },
});

export default SearchBar;
