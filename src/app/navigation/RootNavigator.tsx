import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useTheme } from '../../theme';
import AppNavigator from './AppNavigator';

export const RootNavigator: React.FC = () => {
  const { theme } = useTheme();

  // Align React Navigation theme with our custom color system
  const navTheme = {
    ...(theme.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.colors.primary, // #0466c8
      background: theme.colors.background, // #f8f9fa or dark
      card: theme.colors.card, // #fcfafb
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
};

export default RootNavigator;
