import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { isIOS, moderateScale } from '../../utils/responsive';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  bottomAction?: React.ReactNode;
  header?: React.ReactNode;
  edges?: Array<'top' | 'bottom' | 'left' | 'right'>;
  keyboardAvoiding?: boolean;
  showsVerticalScrollIndicator?: boolean;
  backgroundColor?: string;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  bottomAction,
  header,
  edges = ['top', 'bottom', 'left', 'right'],
  keyboardAvoiding = true,
  showsVerticalScrollIndicator = false,
  backgroundColor,
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const includeTop = edges.includes('top');
  const includeBottom = edges.includes('bottom');
  const includeLeft = edges.includes('left');
  const includeRight = edges.includes('right');

  const containerBg = backgroundColor || theme.colors.background;

  // Compute safe padding
  const paddingTop = includeTop ? insets.top : 0;
  // If there's a bottomAction, bottom inset is handled by the bottomAction container
  const paddingBottom = includeBottom && !bottomAction ? Math.max(insets.bottom, moderateScale(16)) : 0;
  const paddingLeft = includeLeft ? insets.left : 0;
  const paddingRight = includeRight ? insets.right : 0;

  // Extra padding inside scroll view when bottomAction is present so content isn't obscured
  const scrollBottomPadding = bottomAction
    ? moderateScale(100) + Math.max(insets.bottom, moderateScale(12))
    : moderateScale(24);

  const content = scrollable ? (
    <ScrollView
      style={styles.flexOne}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: scrollBottomPadding },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flexOne, contentContainerStyle]}>{children}</View>
  );

  const wrappedContent = keyboardAvoiding ? (
    <KeyboardAvoidingView
      style={styles.flexOne}
      behavior={isIOS ? 'padding' : undefined}
      keyboardVerticalOffset={isIOS ? 0 : 0}
    >
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: containerBg,
          paddingTop,
          paddingBottom,
          paddingLeft,
          paddingRight,
        },
        style,
      ]}
    >
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
      />

      {header && <View style={styles.headerWrapper}>{header}</View>}

      {wrappedContent}

      {/* Fixed bottom action with dynamic safe area insets */}
      {bottomAction && (
        <View
          style={[
            styles.bottomActionContainer,
            {
              backgroundColor: theme.colors.card, // #fcfafb
              borderTopColor: theme.colors.border,
              paddingBottom: Math.max(insets.bottom, moderateScale(16)),
              paddingTop: moderateScale(12),
              paddingHorizontal: moderateScale(16),
            },
            theme.shadows.md,
          ]}
        >
          {bottomAction}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flexOne: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerWrapper: {
    zIndex: 10,
  },
  bottomActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    zIndex: 20,
  },
});

export default ScreenContainer;
