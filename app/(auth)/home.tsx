import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, StatusBar, SafeAreaView, Alert, Image } from 'react-native'; 
import { Ionicons, MaterialIcons, FontAwesome5, Entypo, Feather } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useTheme } from '../../utils/context/themedContext'; 
import homeStyles from './styles/homeStyles'; 
import Constants from 'expo-constants';


export default function Home() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();
  const { theme } = useTheme(); 

  const styles = homeStyles(theme);


  const handleLogout = async () => {
    Alert.alert(
      "Confirmar Saída",
      "Tem certeza que deseja sair da sua conta?",
      [{ text: "Cancelar", style: "cancel" }, {
        text: "Sair",
        onPress: async () => {
          await signOut();
          router.replace('/(public)/welcome');
        }
      }], { cancelable: false } 
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10 }]}>
          <TouchableOpacity onPress={() => router.push("(auth)/config")}>
            <Ionicons name="settings-outline" size={28} color={theme.text} />
          </TouchableOpacity>
 
          <Image 
            source={require('../../assets/logo2.png')} 
            style={{ width: 150, height: 40, resizeMode: 'contain' }} 
          />
          
          <TouchableOpacity onPress={handleLogout} >
            <Ionicons name="log-out-outline" size={28} color={theme.text} /> 
          </TouchableOpacity>
        </View>

        <View style={styles.userCard}>
          <View style={styles.userLeft}>
            <Ionicons name="person-circle-outline" size={36} color={theme.text} /> 
            <Text style={styles.welcome}>
              Bem vindo, <Text style={styles.username}>{user?.firstName ?? ''}</Text>
            </Text>
          </View>
          <Text style={styles.store}>Loja <Text style={styles.storeName}>{(user?.unsafeMetadata?.companyName as string) ?? ''}</Text></Text>
        </View>

        <ScrollView contentContainerStyle={styles.body}>
          <TouchableOpacity style={styles.box} onPress={() => router.push("(auth)/cadProd")}>
            <MaterialIcons name="post-add" size={30} color={theme.text} /> 
            <Text style={styles.boxText}>Cadastrar produtos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.box} onPress={() => router.push("(auth)/cadCate")}>
            <Entypo name="flow-tree" size={30} color={theme.text} /> 
            <Text style={styles.boxText}>Cadastrar categorias</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.box} onPress={() => router.push("(auth)/exportData")}>
            <Feather name="bar-chart-2" size={30} color={theme.text} /> 
            <Text style={styles.boxText}>Exportar dados</Text>
          </TouchableOpacity>
            <TouchableOpacity style={styles.box} onPress={() => router.push("(auth)/historicoTransacoes")}> 
            <MaterialIcons name="description" size={30} color={theme.text} />
            <Text style={styles.boxText}>Relatório App</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.boxVizu} onPress={() => router.push("(auth)/VizuEstoq")}>
            <FontAwesome5 name="search" size={24} color={theme.text} />
            <Text style={styles.boxText}>Visualizar estoque</Text>
          </TouchableOpacity>
        </ScrollView>

        <View style={styles.bottomNav}>
          <TouchableOpacity onPress={() => router.push('/(auth)/profile')}>
            <Ionicons name="person-outline" size={26} color={theme.text} /> 
            <Text style={{ color: theme.text }}>Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/about')}>
            <Entypo name="info-with-circle" size={26} color={theme.text} /> 
            <Text style={{ color: theme.text }}>Sobre</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}