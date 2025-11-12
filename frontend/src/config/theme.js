// Brand Theme Configuration
// Based on vibrant green logo colors

export const brandColors = {
  // Primary brand color - vibrant green from logo
  primary: '#3CAF54', // Primary brand color
  primaryDark: '#2d8f42', // Darker shade for hover states
  primaryLight: '#86efac', // Lighter shade
  
  // Supporting colors
  white: '#ffffff',
  black: '#000000',
  
  // Neutral grays
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  
  // Status colors
  success: '#3CAF54',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};

// Theme utility functions
export const themeUtils = {
  // Get primary color based on mode
  primary: (isDark = false) => isDark ? brandColors.primaryDark : brandColors.primary,
  
  // Get background color based on mode
  background: (isDark = false) => isDark ? brandColors.gray[900] : brandColors.white,
  
  // Get surface color (cards, containers)
  surface: (isDark = false) => isDark ? brandColors.gray[800] : brandColors.white,
  
  // Get text color based on mode
  text: {
    primary: (isDark = false) => isDark ? brandColors.white : brandColors.gray[900],
    secondary: (isDark = false) => isDark ? brandColors.gray[400] : brandColors.gray[600],
    muted: (isDark = false) => isDark ? brandColors.gray[500] : brandColors.gray[500],
  },
  
  // Get border color based on mode
  border: (isDark = false) => isDark ? brandColors.gray[700] : brandColors.gray[200],
  
  // Get hover colors
  hover: {
    primary: brandColors.primaryDark,
    surface: (isDark = false) => isDark ? brandColors.gray[700] : brandColors.gray[50],
  },
};

// Tailwind CSS class mappings
export const themeClasses = {
  // Primary brand colors
  primary: {
    bg: 'bg-brand-400',
    text: 'text-brand-400',
    border: 'border-brand-400',
    hover: 'hover:bg-brand-500',
    dark: {
      bg: 'dark:bg-brand-500',
      text: 'dark:text-brand-400',
      border: 'dark:border-brand-500',
      hover: 'dark:hover:bg-brand-600',
    },
  },
  
  // Buttons
  button: {
    primary: 'bg-brand-400 hover:bg-brand-500 text-white',
    primaryDark: 'dark:bg-brand-500 dark:hover:bg-brand-600',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
    secondaryDark: 'dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white',
  },
  
  // Cards/Surfaces
  card: 'bg-white dark:bg-gray-800',
  cardBorder: 'border-gray-200 dark:border-gray-700',
  
  // Text
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-400',
    muted: 'text-gray-500 dark:text-gray-500',
  },
  
  // Inputs
  input: 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white',
  inputFocus: 'focus:ring-brand-400 focus:border-brand-400 dark:focus:ring-brand-500 dark:focus:border-brand-500',
};

export default {
  brandColors,
  themeUtils,
  themeClasses,
};

