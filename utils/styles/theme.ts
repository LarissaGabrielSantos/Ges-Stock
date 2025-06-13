import { Colors } from './color';

export const lightTheme = {
  background: Colors.white,
  text: Colors.black,
  cardBackground: Colors.grayLight,
  cardBorder: Colors.grayMedium,
  inputBackground: Colors.white,
  inputText: Colors.black,
  buttonPrimaryBg: Colors.primary,
  buttonPrimaryText: Colors.white,
  buttonSecondaryBg: Colors.grayLight,
  buttonSecondaryText: Colors.grayDark,
  red: Colors.red,       
  green: Colors.green,
  grayDark: Colors.grayDark,
  accent: Colors.accent,
};

export const darkTheme = {
  background: '#121212', 
  text: Colors.white,
  cardBackground: '#1e1e1e', 
  cardBorder: '#333',
  inputBackground: '#2a2a2a', 
  inputText: Colors.white,
  buttonPrimaryBg: '#4CAF50', 
  buttonPrimaryText: Colors.white,
  buttonSecondaryBg: '#333',
  buttonSecondaryText: Colors.white,
  red: Colors.red,       
  green: Colors.green,
  grayDark: Colors.grayDark,
  accent: Colors.accent,
};

export type Theme = typeof lightTheme;