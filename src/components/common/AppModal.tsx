import React from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { isIOS, moderateScale, scale, wp } from '../../utils/responsive';
import AppButton from './AppButton';

export interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: 'primary' | 'danger';
  confirmLoading?: boolean;
  style?: ViewStyle;
  closeOnBackdropPress?: boolean;
}

export const AppModal: React.FC<AppModalProps> = ({
  visible,
  onClose,
  title,
  message,
  children,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  confirmLoading = false,
  style,
  closeOnBackdropPress = true,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={isIOS ? 'padding' : undefined}
      >
        <View style={styles.backdropContainer}>
          {/* Backdrop Touch Dismissal */}
          <Pressable
            style={styles.backdrop}
            onPress={closeOnBackdropPress ? onClose : undefined}
            accessibilityRole="button"
            accessibilityLabel="Close modal"
          />

          {/* Modal Content Box */}
          <View
            accessibilityRole="alert"
            accessibilityViewIsModal={true}
            style={[
              styles.dialogBox,
              {
                backgroundColor: theme.colors.modal, // #fcfafb
                borderColor: theme.colors.border,
                borderRadius: theme.borderRadius.xl,
                padding: theme.spacing.lg,
                width: wp(88),
                maxWidth: scale(420),
                marginTop: insets.top,
                marginBottom: Math.max(insets.bottom, moderateScale(16)),
              },
              theme.shadows.lg,
              style,
            ]}
          >
            {title && (
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
            )}

            {message && (
              <Text
                style={[
                  styles.message,
                  title ? styles.messageWithTitle : null,
                  {
                    color: theme.colors.textSecondary,
                    fontSize: theme.fontSize.body,
                    lineHeight: theme.lineHeight.body,
                  },
                ]}
              >
                {message}
              </Text>
            )}

            {children && <View style={styles.body}>{children}</View>}

            {/* Modal Actions */}
            {(confirmText || cancelText) && (
              <View style={[styles.actionsRow, { marginTop: theme.spacing.lg }]}>
                {cancelText && (
                  <View style={styles.actionButtonWrapper}>
                    <AppButton
                      title={cancelText}
                      variant="secondary"
                      onPress={onClose}
                      size="md"
                    />
                  </View>
                )}

                {confirmText && onConfirm && (
                  <View style={styles.actionButtonWrapper}>
                    <AppButton
                      title={confirmText}
                      variant={confirmVariant}
                      onPress={onConfirm}
                      loading={confirmLoading}
                      size="md"
                    />
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  backdropContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  dialogBox: {
    borderWidth: 1,
    zIndex: 10,
  },
  title: {
    fontWeight: '700',
  },
  message: {
    fontWeight: '400',
  },
  messageWithTitle: {
    marginTop: moderateScale(8),
  },
  body: {
    marginVertical: moderateScale(8),
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: moderateScale(10),
  },
  actionButtonWrapper: {
    flex: 1,
  },
});

export default AppModal;
