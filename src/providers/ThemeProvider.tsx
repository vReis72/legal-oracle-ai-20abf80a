import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'dark' | 'light';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
};

export const ThemeProvider = ({
  children,
  defaultTheme = 'light'
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<'dark' | 'light'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  const getSystemTheme = (): 'dark' | 'light' => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  };

  const updateActualTheme = (newTheme: Theme) => {
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setActualTheme(resolved);
    
    // Aplica a classe no documento
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('app-theme', newTheme);
    }
    updateActualTheme(newTheme);
  };

  // Initialize theme from localStorage after component mounts
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('app-theme');
      if (stored && ['light', 'dark', 'system'].includes(stored)) {
        setThemeState(stored as Theme);
      }
    }
    setIsInitialized(true);
  }, []);

  // Apply theme when initialized or theme changes
  useEffect(() => {
    if (!isInitialized) return;
    
    updateActualTheme(theme);

    // Listen to system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (theme === 'system') {
          updateActualTheme('system');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, isInitialized]);

  // Apply theme class on actualTheme change
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(actualTheme);
    }
  }, [actualTheme]);

  const value = {
    theme,
    setTheme,
    actualTheme
  };

  return (
    <ThemeContext.Provider value={value}>
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