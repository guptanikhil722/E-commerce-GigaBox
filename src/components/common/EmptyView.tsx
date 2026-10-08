import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';
import { moderateScale, scale } from '../../utils/responsive';
import AppButton from './AppButton';

export interface EmptyViewProps {
  title?: string;
  message?: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyView: React.FC<EmptyViewProps> = ({
  title = 'No items found',
  message = 'We could not find anything matching your request.',
  icon = '🔍',
  actionText,
  onAction,
}) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: theme.colors.primaryLight,
            borderColor: theme.colors.border,
          },
        ]}
      >
        <Text style={styles.icon}>{icon}</Text>
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

      {actionText && onAction && (
        <View style={styles.actionWrapper}>
          <AppButton
            title={actionText}
            onPress={onAction}
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
    fontSize: moderateScale(32),
  },
  title: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: moderateScale(8),
  },
  message: {
    textAlign: 'center',
    // maxWidth: scale(280),
    marginBottom: moderateScale(20),
  },
  actionWrapper: {
    minWidth: scale(180),
  },
});

export default EmptyView;
