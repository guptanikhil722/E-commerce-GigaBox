/**
 * Color Palette Configuration
 * Requested colors:
 * - Blue: #0466c8 (Primary action, Buttons, CTA)
 * - White variants:
 *   - #f8f9fa (App Canvas / Screen background - clean, soft, reduces eye strain)
 *   - #fcfafb (Elevated surface / Modals / Cards / High-contrast CTA backgrounds)
 */

export const palette = {
  // Brand Blues
  blue: {
    50: '#eef5fc',
    100: '#d7e8f9',
    200: '#b0d1f3',
    300: '#75b0eb',
    400: '#388de0',
    500: '#0466c8', // Primary CTA / Button
    600: '#0353a4', // Pressed / Hover
    700: '#023e7d', // Active / Dark
    800: '#002855',
    900: '#001845',
  },

  // Soft Whites & Off-whites
  white: {
    pure: '#ffffff',
    soft: '#fcfafb', // Modal, Card Surface, High-contrast CTA
    background: '#f8f9fa', // Main Screen Background
  },

  // Grays & Neutrals
  gray: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef', // Light border
    300: '#dee2e6', // Divider
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d', // Muted text
    700: '#495057', // Secondary text
    800: '#343a40',
    900: '#212529', // Main dark text
    950: '#0b0f19', // Deep dark
  },

  // Semantic Status
  status: {
    success: '#2ec4b6',
    successLight: '#e6f8f5',
    warning: '#ff9f1c',
    warningLight: '#fff5e6',
    error: '#e63946',
    errorLight: '#fdebec',
    info: '#0466c8',
    infoLight: '#eef5fc',
  },

  // Overlays
  overlay: {
    black50: 'rgba(0, 0, 0, 0.5)',
    black70: 'rgba(0, 0, 0, 0.7)',
    white80: 'rgba(252, 250, 251, 0.8)',
    blue20: 'rgba(4, 102, 200, 0.2)',
  },
} as const;

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryText: string;

  // Backgrounds
  background: string;
  card: string;
  modal: string;
  surface: string;

  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // CTA & Buttons
  buttonPrimaryBg: string;
  buttonPrimaryText: string;
  buttonSecondaryBg: string;
  buttonSecondaryText: string;
  buttonSecondaryBorder: string;

  // Borders & Dividers
  border: string;
  divider: string;

  // Status
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // Overlay
  backdrop: string;
}

export const lightColors: ThemeColors = {
  primary: palette.blue[500], // #0466c8
  primaryHover: palette.blue[600], // #0353a4
  primaryLight: palette.blue[50], // #eef5fc
  primaryText: palette.white.pure,

  background: palette.white.background, // #f8f9fa
  card: palette.white.soft, // #fcfafb
  modal: palette.white.soft, // #fcfafb
  surface: palette.white.pure,

  text: palette.gray[900], // #212529
  textSecondary: palette.gray[700], // #495057
  textMuted: palette.gray[600], // #6c757d
  textInverse: palette.white.pure,

  // CTA Button colors
  buttonPrimaryBg: palette.blue[500], // #0466c8
  buttonPrimaryText: palette.white.soft, // #fcfafb
  buttonSecondaryBg: palette.white.soft, // #fcfafb
  buttonSecondaryText: palette.blue[500], // #0466c8
  buttonSecondaryBorder: palette.blue[500],

  border: palette.gray[200], // #e9ecef
  divider: palette.gray[300], // #dee2e6

  success: palette.status.success,
  successLight: palette.status.successLight,
  warning: palette.status.warning,
  warningLight: palette.status.warningLight,
  error: palette.status.error,
  errorLight: palette.status.errorLight,
  info: palette.status.info,
  infoLight: palette.status.infoLight,

  backdrop: palette.overlay.black50,
};

export const darkColors: ThemeColors = {
  primary: palette.blue[500], // #0466c8
  primaryHover: palette.blue[400], // #388de0
  primaryLight: 'rgba(4, 102, 200, 0.15)',
  primaryText: palette.white.pure,

  background: '#0b0f19',
  card: '#161c2e',
  modal: '#161c2e',
  surface: '#1f273d',

  text: palette.white.soft, // #fcfafb
  textSecondary: '#a0aec0',
  textMuted: '#718096',
  textInverse: '#0b0f19',

  // CTA Button colors
  buttonPrimaryBg: palette.blue[500], // #0466c8
  buttonPrimaryText: palette.white.soft, // #fcfafb
  buttonSecondaryBg: '#1f273d',
  buttonSecondaryText: palette.blue[300],
  buttonSecondaryBorder: palette.blue[500],

  border: '#2d3748',
  divider: '#2d3748',

  success: palette.status.success,
  successLight: 'rgba(46, 196, 182, 0.15)',
  warning: palette.status.warning,
  warningLight: 'rgba(255, 159, 28, 0.15)',
  error: palette.status.error,
  errorLight: 'rgba(230, 57, 70, 0.15)',
  info: palette.status.info,
  infoLight: 'rgba(4, 102, 200, 0.15)',

  backdrop: palette.overlay.black70,
};
