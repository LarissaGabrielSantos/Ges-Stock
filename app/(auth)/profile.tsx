// Exemplo de Estrutura para profile.tsx Customizado (Não Completo)

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, SafeAreaView, Platform, ScrollView , StatusBar} from 'react-native';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Para o ícone de voltar
import Constants from 'expo-constants'; // Certifique-se de ter 'expo install expo-constants'


export default function CustomProfile() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setCompanyName((user.unsafeMetadata?.companyName as string) || '');
    }
  }, [isLoaded, user]);

  const handleSaveProfile = async () => {
    if (!isLoaded || !user || loadingSave) return;
    setLoadingSave(true);
    try {
      await user.update({
        firstName: firstName,
        lastName: lastName,
        unsafeMetadata: {
          companyName: companyName,
        },
      });
      Alert.alert("Sucesso", "Perfil atualizado!");
    } catch (e: any) {
      Alert.alert("Erro", e.errors?.[0]?.message || "Não foi possível atualizar o perfil.");
    } finally {
      setLoadingSave(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert( // Adicionar Alert para confirmação
      "Confirmar Saída",
      "Tem certeza que deseja sair da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          onPress: async () => {
            await signOut();
            router.replace('/(public)/welcome');
          }
        }
      ],
      { cancelable: false }
    );
  };

  if (!isLoaded || !user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38a69d" />
          <Text style={styles.loadingText}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Customizado */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Meu Perfil</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          <Text style={styles.infoText}>Email: {user.emailAddresses[0]?.emailAddress}</Text>

          <Text style={styles.label}>Nome</Text>
          <TextInput
            placeholder="Nome"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />
          <Text style={styles.label}>Sobrenome</Text>
          <TextInput
            placeholder="Sobrenome"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />
          <Text style={styles.label}>Nome da Empresa</Text>
          <TextInput
            placeholder="Nome da Empresa"
            value={companyName}
            onChangeText={setCompanyName}
            style={styles.input}
          />

          <TouchableOpacity onPress={handleSaveProfile} disabled={loadingSave} style={styles.button}>
            {loadingSave ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Salvar Alterações</Text>}
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Opções de Segurança</Text>
          {/* Aqui você adicionaria links ou botões para: */}
          {/* - Mudar Senha: user.updatePassword() */}
          {/* - Gerenciar Emails: user.createEmailAddress(), emailAddress.destroy() */}
          {/* - Gerenciar 2FA */}
          <TouchableOpacity style={styles.securityOptionButton}>
            <Text style={styles.securityOptionText}>Mudar Senha</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.securityOptionButton}>
            <Text style={styles.securityOptionText}>Gerenciar Endereços de Email</Text>
            <Ionicons name="chevron-forward" size={20} color="#555" />
          </TouchableOpacity>
          {/* ... outras opções */}

          <TouchableOpacity onPress={handleSignOut} style={styles.redButton}>
            <Text style={styles.redButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    padding: 5,
  },
  logoutButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#38a69d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  securityOptionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
  },
  securityOptionText: {
    fontSize: 16,
    color: '#333',
  },
  redButton: {
    backgroundColor: '#e53935', // Um vermelho mais suave
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  redButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});