// ARQUIVO profile.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, SafeAreaView, Platform, ScrollView, StatusBar, Modal } from 'react-native';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../../utils/context/themedContext';
import { logTransaction } from '../../utils/transactionLogger'; // Importar o logger de transações


export default function CustomProfile() {
  const { isLoaded, user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loadingSave, setLoadingSave] = useState(false);

  // Estados para Mudar Senha Modal
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loadingChangePassword, setLoadingChangePassword] = useState(false);

  const { theme } = useTheme();

  useEffect(() => {
    if (isLoaded && user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setCompanyName((user.unsafeMetadata?.companyName as string) || '');
    }
  }, [isLoaded, user]);

  const handleSaveProfile = async () => {
    if (!isLoaded || !user || loadingSave) return;

    Alert.alert(
      "Confirmar Alterações",
      "Tem certeza que deseja salvar as alterações no seu perfil?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Salvar",
          onPress: async () => {
            setLoadingSave(true);
            try {
              // Capturar valores antigos para o log
              const oldFirstName = user.firstName;
              const oldLastName = user.lastName;
              const oldCompanyName = (user.unsafeMetadata?.companyName as string);

              await user.update({
                firstName: firstName,
                lastName: lastName,
                unsafeMetadata: {
                  companyName: companyName,
                },
              });
              Alert.alert("Sucesso", "Perfil atualizado!");

              // --- REGISTRAR TRANSAÇÃO: Edição de Perfil ---
              if (user.id) { // Garante que userId está disponível
                await logTransaction(user.id, 'edit_profile', { // CORREÇÃO DO TIPO: 'edit_profile'
                  oldFirstName: oldFirstName, newFirstName: firstName,
                  oldLastName: oldLastName, newLastName: lastName,
                  oldCompanyName: oldCompanyName, newCompanyName: companyName,
                });
              }
              // --- FIM REGISTRO ---

            } catch (e: any) {
              Alert.alert("Erro", e.errors?.[0]?.message || "Não foi possível atualizar o perfil.");
            } finally {
              setLoadingSave(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleSignOut = async () => {
    Alert.alert(
      "Confirmar Saída",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          onPress: async () => {
            if (user?.id) { // Garante userId antes de logar
                await logTransaction(user.id, 'logout');
            }
            await signOut();
            router.replace('/(public)/welcome');
          }
        }
      ],
      { cancelable: false }
    );
  };

  // === LÓGICA PARA MUDAR SENHA ===
  const handleChangePassword = async () => {
    if (!isLoaded || !user || loadingChangePassword) return;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Erro", "Por favor, preencha todos os campos de senha.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      Alert.alert("Erro", "A nova senha e a confirmação não coincidem.");
      return;
    }

    Alert.alert(
      "Confirmar Alteração de Senha",
      "Tem certeza que deseja mudar sua senha?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Mudar Senha",
          onPress: async () => {
            setLoadingChangePassword(true);
            try {
              await user.updatePassword({
                currentPassword: currentPassword,
                newPassword: newPassword,
              });
              Alert.alert("Sucesso", "Senha alterada com sucesso!");
              setChangePasswordModalVisible(false);
              setCurrentPassword('');
              setNewPassword('');
              // setConfirmNewPassword(''); // Já limpa no retorno do modal

              // --- REGISTRAR TRANSAÇÃO: Mudança de Senha ---
              if (user.id) {
                  await logTransaction(user.id, 'change_password');
              }
              // --- FIM REGISTRO ---

            } catch (e: any) {
              Alert.alert("Erro", e.errors?.[0]?.message || "Não foi possível mudar a senha.");
            } finally {
              setLoadingChangePassword(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };


  if (!isLoaded || !user) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.text} />
          <Text style={[styles.loadingText, { color: theme.text }]}>Carregando perfil...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Header Customizado */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10, backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Meu Perfil</Text>
          <TouchableOpacity onPress={handleSignOut} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={28} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Informações Básicas</Text>
          <Text style={[styles.infoText, { color: theme.text }]}>Email Principal: {user.emailAddresses.find(ea => ea.id === user.primaryEmailAddressId)?.emailAddress || 'N/A'}</Text>

          <Text style={[styles.label, { color: theme.text }]}>Nome</Text>
          <TextInput
            placeholder="Nome"
            // REMOVER ATRIBUTOS DUPLICADOS AQUI
            value={firstName}
            onChangeText={setFirstName}
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
            placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
            // value={firstName} <--- REMOVER ESTA LINHA
            // onChangeText={setFirstName} <--- REMOVER ESTA LINHA
          />
          <Text style={[styles.label, { color: theme.text }]}>Sobrenome</Text>
          <TextInput
            placeholder="Sobrenome"
            // REMOVER ATRIBUTOS DUPLICADOS AQUI
            value={lastName}
            onChangeText={setLastName}
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
            placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
            // value={lastName} <--- REMOVER ESTA LINHA
            // onChangeText={setLastName} <--- REMOVER ESTA LINHA
          />
          <Text style={[styles.label, { color: theme.text }]}>Nome da Empresa</Text>
          <TextInput
            placeholder="Nome da Empresa"
            value={companyName}
            onChangeText={setCompanyName}
            style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
            placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
          />

          <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonPrimaryBg }]} onPress={handleSaveProfile} disabled={loadingSave}>
            {loadingSave ? <ActivityIndicator color={theme.buttonPrimaryText} /> : <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>Salvar Alterações</Text>}
          </TouchableOpacity>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Opções de Segurança</Text>
          
          {/* Botão para Mudar Senha */}
          <TouchableOpacity style={[styles.securityOptionButton, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]} onPress={() => setChangePasswordModalVisible(true)}>
            <Text style={[styles.securityOptionText, { color: theme.text }]}>Mudar Senha</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSignOut} style={[styles.redButton, { backgroundColor: theme.red }]}>
            <Text style={styles.redButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* === MODAL PARA MUDAR SENHA === */}
      <Modal visible={changePasswordModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Mudar Senha</Text>
            <ScrollView contentContainerStyle={styles.modalScrollView}>
              <TextInput
                placeholder="Senha Atual"
                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                secureTextEntry
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TextInput
                placeholder="Nova Senha"
                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                placeholder="Confirmar Nova Senha"
                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                secureTextEntry
                value={confirmNewPassword}
                onChangeText={setConfirmNewPassword}
              />
              <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonPrimaryBg }]} onPress={handleChangePassword} disabled={loadingChangePassword}>
                {loadingChangePassword ? <ActivityIndicator color={theme.buttonPrimaryText} /> : <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>Mudar Senha</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonCancel, { backgroundColor: theme.buttonSecondaryBg }]} onPress={() => setChangePasswordModalVisible(false)}>
                <Text style={[styles.buttonTextCancel, { color: theme.buttonSecondaryText }]}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* === MODAL PARA GERENCIAR EMAILS (REMOVIDO COMPLETAMENTE) === */}
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
    flex: 1,
    textAlign: 'center',
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
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  sectionSubtitle: { // Este estilo foi removido do styles pois não é mais usado
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 8,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  securityOptionText: {
    fontSize: 16,
    color: '#333',
  },
  redButton: {
    backgroundColor: '#e53935',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalScrollView: {
    paddingBottom: 10,
  },
  buttonCancel: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonTextCancel: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emailItem: { // Este estilo será removido do styles pois não é mais usado
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
    marginBottom: 5,
    backgroundColor: '#fff',
  },
  emailText: { // Este estilo será removido do styles pois não é mais usado
    fontSize: 16,
    flex: 1,
    color: '#333',
  },
  primaryEmailTag: { // Este estilo será removido do styles pois não é mais usado
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginLeft: 5,
    color: '#007bff',
  },
});