import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance, useColorScheme } from 'react-native'; 
import { lightTheme, darkTheme, Theme } from '../styles/theme'; 

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setAppTheme: (mode: 'light' | 'dark' | 'system') => void; 
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme(); 

  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setColorScheme(colorScheme);
      }
    });
    return () => subscription.remove();
  }, []);

  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const isDarkMode = colorScheme === 'dark';

  const toggleTheme = () => {
    setColorScheme(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const setAppTheme = (mode: 'light' | 'dark' | 'system') => {
    if (mode === 'system') {
      setColorScheme(systemColorScheme || 'light');
    } else {
      setColorScheme(mode);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDarkMode, toggleTheme, setAppTheme }}>
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