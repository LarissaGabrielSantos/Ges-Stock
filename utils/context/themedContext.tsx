import React, { createContext, useState, useEffect, useContext } from 'react';
import { Appearance, useColorScheme } from 'react-native'; // useColorScheme faz parte do React Native a partir da v0.64
import { lightTheme, darkTheme, Theme } from '../styles/theme'; // Ajuste o caminho conforme onde você salvou

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
  setAppTheme: (mode: 'light' | 'dark' | 'system') => void; // Permite definir o tema explicitamente
}

// Cria o contexto com um valor padrão undefined
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Hook para detectar o tema do sistema
  const systemColorScheme = useColorScheme(); // Retorna 'light', 'dark' ou null

  // Estado para armazenar o tema atual do aplicativo
  // Tenta usar o tema do sistema como padrão, caso contrário, usa 'light'
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');

  // Efeito para ouvir mudanças no tema do sistema (enquanto o app está aberto)
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (colorScheme) {
        setColorScheme(colorScheme);
      }
    });
    // Limpa o listener ao desmontar o componente
    return () => subscription.remove();
  }, []);

  // Seleciona o tema baseado no colorScheme atual
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const isDarkMode = colorScheme === 'dark';

  // Função para alternar entre claro e escuro (manual)
  const toggleTheme = () => {
    setColorScheme(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Função para definir o tema explicitamente (light, dark, ou de volta para system)
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

// Hook customizado para usar o tema em qualquer componente
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};