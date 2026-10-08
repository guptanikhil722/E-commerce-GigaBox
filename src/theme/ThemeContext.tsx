import React, { createContext, useContext, useState, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors } from './colors';
import { spacing, borderRadius, layout } from './spacing';
import { typography, fontSize, lineHeight, fontWeight } from './typography';
import { shadows } from './shadows';
import {
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  normalizeFont,
  wp,
  hp,
  isIOS,
  isAndroid,
  isTablet,
  isSmallDevice,
} from '../utils/responsive';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: 'light' | 'dark';
  isDark: boolean;
  colors: ThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  layout: typeof layout;
  typography: typeof typography;
  fontSize: typeof fontSize;
  lineHeight: typeof lineHeight;
  fontWeight: typeof fontWeight;
  shadows: typeof shadows;
  responsive: {
    scale: typeof scale;
    verticalScale: typeof verticalScale;
    moderateScale: typeof moderateScale;
    moderateVerticalScale: typeof moderateVerticalScale;
    normalizeFont: typeof normalizeFont;
    wp: typeof wp;
    hp: typeof hp;
    isIOS: boolean;
    isAndroid: boolean;
    isTablet: () => boolean;
    isSmallDevice: () => boolean;
  };
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode; initialMode?: ThemeMode }> = ({
  children,
  initialMode = 'light',
}) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialMode);

  const activeMode: 'light' | 'dark' = useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme: Theme = useMemo(() => {
    const isDark = activeMode === 'dark';
    return {
      mode: activeMode,
      isDark,
      colors: isDark ? darkColors : lightColors,
      spacing,
      borderRadius,
      layout,
      typography,
      fontSize,
      lineHeight,
      fontWeight,
      shadows,
      responsive: {
        scale,
        verticalScale,
        moderateScale,
        moderateVerticalScale,
        normalizeFont,
        wp,
        hp,
        isIOS,
        isAndroid,
        isTablet,
        isSmallDevice,
      },
    };
  }, [activeMode]);

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
