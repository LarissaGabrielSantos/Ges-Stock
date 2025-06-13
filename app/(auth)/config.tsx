import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Platform, StatusBar, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../../utils/context/themedContext'; 
import { styles } from './styles/config';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDarkMode, toggleTheme, setAppTheme } = useTheme(); 

  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(isDarkMode);

  useEffect(() => {
    setIsDarkModeEnabled(isDarkMode);
  }, [isDarkMode]);

  const handleToggleDarkMode = () => {
    toggleTheme();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10, backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Configurações</Text>
          <View style={styles.spacer} /> 
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Geral</Text>
          
          <View style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Text style={[styles.settingItemText, { color: theme.text }]}>Modo Escuro</Text>
            <Switch
              trackColor={{ false: theme.buttonSecondaryBg, true: theme.buttonPrimaryBg }}
              thumbColor={Platform.OS === 'android' ? theme.buttonPrimaryText : theme.buttonPrimaryBg} 
              ios_backgroundColor={theme.buttonSecondaryBg}
              onValueChange={handleToggleDarkMode}
              value={isDarkModeEnabled}
            />
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Conta</Text>
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]} onPress={() => router.push('/(auth)/profile')}>
            <Text style={[styles.settingItemText, { color: theme.text }]}>Editar Perfil</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Sobre o App</Text>
          <TouchableOpacity style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]} onPress={() => router.push('/(auth)/about')}>
            <Text style={[styles.settingItemText, { color: theme.text }]}>Sobre o Aplicativo</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>
          <View style={[styles.settingItem, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
            <Text style={[styles.settingItemText, { color: theme.text }]}>Versão</Text>
            <Text style={[styles.settingItemValue, { color: theme.text }]}>1.0.3</Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
