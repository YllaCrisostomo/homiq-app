/**
 * Shared Constants and Theme Values
 * 
 * Centralized location for theme colors, spacing, and other
 * configuration values used throughout the Homiq app.
 */

export const THEME = {
  colors: {
    primary: '#0A192F',    // Dark Navy
    secondary: '#00695C',  // Teal
    accent: '#FF6321',     // Orange
    background: '#F8F9FB', // Light Gray
    surface: '#FFFFFF',    // White
    text: {
      primary: '#0A192F',
      secondary: '#64748B',
      muted: '#94A3B8',
    },
    status: {
      success: '#10B981',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#3B82F6',
    }
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '32px',
  }
};

export const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'long',
  year: 'numeric',
};

export const CURRENCY_FORMAT_OPTIONS = (currency: string): Intl.NumberFormatOptions => ({
  style: 'currency',
  currency,
  minimumFractionDigits: 0,
});
