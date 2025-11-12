import React, { createContext, useContext, useState, useEffect } from 'react';
import { themeUtils, themeClasses } from '../config/theme';

const ThemeContext = createContext();

const STORAGE_KEY = 'theme';

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage, fallback to system preference, then light
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'dark') return true;
      if (stored === 'light') return false;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark;
    } catch {
      return false;
    }
  });

  // Persist to localStorage and apply Tailwind's dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(STORAGE_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(STORAGE_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((d) => !d);

  // Theme utilities available in context
  const theme = {
    isDarkMode,
    toggleDarkMode,
    colors: themeUtils,
    classes: themeClasses,
    // Helper functions
    primary: themeUtils.primary(isDarkMode),
    background: themeUtils.background(isDarkMode),
    surface: themeUtils.surface(isDarkMode),
    text: {
      primary: themeUtils.text.primary(isDarkMode),
      secondary: themeUtils.text.secondary(isDarkMode),
      muted: themeUtils.text.muted(isDarkMode),
    },
    border: themeUtils.border(isDarkMode),
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
