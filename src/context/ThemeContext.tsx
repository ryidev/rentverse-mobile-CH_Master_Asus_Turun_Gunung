import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  colors: typeof lightColors;
}

const lightColors = {
  primary: '#0F6980',
  secondary: '#00A699',
  accent: '#0A9396',
  
  background: '#FFFFFF',
  surface: '#F7F7F7',
  card: '#FFFFFF',
  
  text: '#222222',
  textSecondary: '#717171',
  textLight: '#B0B0B0',
  
  border: '#DDDDDD',
  divider: '#EBEBEB',
  
  success: '#00A699',
  error: '#C13515',
  warning: '#FFB400',
  
  white: '#FFFFFF',
  black: '#000000',
  
  star: '#FFB400',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Switch colors
  switchTrack: '#767577',
  switchTrackActive: '#FF385C',
  switchThumb: '#FFFFFF',
};

const darkColors = {
  primary: '#FF385C',
  secondary: '#00A699',
  accent: '#FC642D',
  
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2C2C2C',
  
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textLight: '#808080',
  
  border: '#3C3C3C',
  divider: '#2C2C2C',
  
  success: '#00A699',
  error: '#FF6B6B',
  warning: '#FFB400',
  
  white: '#FFFFFF',
  black: '#000000',
  
  star: '#FFB400',
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Switch colors
  switchTrack: '#767577',
  switchTrackActive: '#FF385C',
  switchThumb: '#FFFFFF',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@app_theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  
  // Determine actual theme based on mode
  const getActualTheme = (mode: ThemeMode): 'light' | 'dark' => {
    if (mode === 'auto') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return mode;
  };
  
  const [theme, setTheme] = useState<'light' | 'dark'>(getActualTheme(themeMode));

  // Load saved theme mode on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto')) {
          setThemeModeState(savedMode as ThemeMode);
          setTheme(getActualTheme(savedMode as ThemeMode));
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    loadTheme();
  }, []);

  // Update theme when system color scheme changes (if mode is auto)
  useEffect(() => {
    if (themeMode === 'auto') {
      setTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
    }
  }, [systemColorScheme, themeMode]);

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
      setTheme(getActualTheme(mode));
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
