import { Colors } from './color';

export const lightTheme = {
  background: Colors.white,
  text: Colors.black,
  cardBackground: Colors.white,
  cardBorder: Colors.grayMedium,
  inputBackground: Colors.white,
  inputText: Colors.black,
  buttonPrimaryBg: Colors.primary,
  buttonPrimaryText: Colors.white,
  buttonSecondaryBg: Colors.grayLight,
  buttonSecondaryText: Colors.grayDark,
  // Adicione mais cores conforme a necessidade do seu design
};

export const darkTheme = {
  background: '#121212', // Fundo bem escuro
  text: Colors.white,
  cardBackground: '#1e1e1e', // Cartões e elementos mais escuros
  cardBorder: '#333',
  inputBackground: '#2a2a2a', // Inputs mais escuros
  inputText: Colors.white,
  buttonPrimaryBg: '#4CAF50', // Um verde mais vibrante para dark mode
  buttonPrimaryText: Colors.white,
  buttonSecondaryBg: '#333',
  buttonSecondaryText: Colors.white,
  // Adicione mais cores específicas para o tema escuro
};

// Define o tipo para um objeto de tema
export type Theme = typeof lightTheme;