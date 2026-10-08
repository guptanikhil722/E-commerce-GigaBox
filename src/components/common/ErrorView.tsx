import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { moderateScale, scale } from '../../utils/responsive';
import AppButton from './AppButton';

export interface ErrorViewProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  title = 'Something went wrong',
  message = 'Unable to load information right now. Please check your connection and try again.',
  onRetry,
  retryText = 'Try Again',
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.colors.errorLight,
            borderColor: theme.colors.error,
          },
        ]}
      >
        <Text style={styles.icon}>⚠️</Text>
      </View>

      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontSize: theme.fontSize.h3,
            lineHeight: theme.lineHeight.h3,
          },
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.message,
          {
            color: theme.colors.textSecondary,
            fontSize: theme.fontSize.body,
            lineHeight: theme.lineHeight.body,
          },
        ]}
      >
        {message}
      </Text>

      {onRetry && (
        <View style={styles.actionWrapper}>
          <AppButton
            title={retryText}
            onPress={onRetry}
            variant="primary"
            size="md"
          />
        </View>
      )}
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
  iconCircle: {
    width: scale(72),
    height: scale(72),
    borderRadius: scale(36),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(16),
    borderWidth: 1,
  },
  icon: {
    fontSize: moderateScale(30),
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: moderateScale(8),
  },
  message: {
    textAlign: 'center',
    maxWidth: scale(300),
    marginBottom: moderateScale(24),
  },
  actionWrapper: {
    minWidth: scale(180),
  },
});

export default ErrorView;
