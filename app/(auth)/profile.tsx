// ARQUIVO profile.tsx

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, SafeAreaView, Platform, ScrollView, StatusBar, Modal } from 'react-native';
import { useUser, useClerk } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../../utils/context/themedContext';
import { logTransaction } from '../../utils/transactionLogger'; // Importar o logger de transações
import { styles } from './styles/profile';


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
    </SafeAreaView>
  );
}