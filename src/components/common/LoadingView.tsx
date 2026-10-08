import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { moderateScale } from '../../utils/responsive';

export interface LoadingViewProps {
  message?: string;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  message = 'Loading products...',
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.spinnerCard,
          {
            backgroundColor: theme.colors.card, // #fcfafb
            borderColor: theme.colors.border,
          },
          theme.shadows.md,
        ]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text
          style={[
            styles.message,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSize.body,
            },
          ]}
        >
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: moderateScale(24),
  },
  spinnerCard: {
    padding: moderateScale(28),
    borderRadius: moderateScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    minWidth: moderateScale(200),
  },
  message: {
    marginTop: moderateScale(16),
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default LoadingView;
