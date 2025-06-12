// ARQUIVO forgot.tsx

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Platform, StatusBar, Alert } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo'; // Usar useSignIn para reset de senha
import { Link, useRouter } from 'expo-router'; // Importar useRouter para navegação
import * as Animatable from 'react-native-animatable';
import Constants from 'expo-constants'; // Importar Constants
import { useTheme } from '../../utils/context/themedContext'; // Importar useTheme

export default function Forgot() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const { theme } = useTheme();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState(''); // Nova senha
  const [confirmPassword, setConfirmPassword] = useState(''); // Confirmação da nova senha
  const [code, setCode] = useState(''); // Código de verificação
  const [pendingVerification, setPendingVerification] = useState(false); // Estado para controlar as etapas
  const [pendingNewPassword, setPendingNewPassword] = useState(false); // Estado para controlar se está definindo nova senha


  async function handleRequestReset() {
    if (!isLoaded) return;
    if (!emailAddress.trim()) {
      Alert.alert('Erro', 'Por favor, digite seu e-mail cadastrado.');
      return;
    }

    try {
      await signIn.create({
        identifier: emailAddress,
        strategy: 'reset_password_email_code',
      });
      setPendingVerification(true);
      Alert.alert('Sucesso', 'Código enviado para o seu e-mail. Por favor, verifique sua caixa de entrada.');
    } catch (err: any) {
      Alert.alert('Erro', err.errors?.[0]?.message || 'Erro ao enviar código de reset.');
    }
  }

  async function handleVerifyCodeAndSetNewPassword() {
    if (!isLoaded) return;
    if (!code.trim()) {
      Alert.alert('Erro', 'Por favor, digite o código de verificação.');
      return;
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code,
      });

      if (result.status === 'needs_new_password') {
        setPendingNewPassword(true);
        Alert.alert('Verificação Concluída', 'Agora você pode definir sua nova senha.');
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        Alert.alert('Sucesso', 'Senha resetada e login efetuado!');
        router.replace('/(auth)/home');
      } else {
        Alert.alert('Erro', 'Verificação falhou. Status: ' + result.status);
      }
    } catch (err: any) {
      Alert.alert('Erro', err.errors?.[0]?.message || 'Código inválido ou expirado.');
    }
  }

  async function handleSetNewPassword() {
    if (!isLoaded || !signIn || !password || !confirmPassword) return;
    
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      // ESTA É A VERSÃO CORRETA DA CHAMADA API DO CLERK PARA DEFINIR A NOVA SENHA
      // Se o erro de tipagem persistir, é um problema de ambiente/tipos instalados.
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        newPassword: password, // <-- É 'newPassword', conforme a API do Clerk
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        Alert.alert('Sucesso', 'Senha alterada com sucesso e login efetuado!');
        router.replace('/(auth)/home');
      } else {
        Alert.alert('Erro', 'Não foi possível definir a nova senha. Status: ' + result.status);
      }
    } catch (err: any) {
      Alert.alert('Erro', err.errors?.[0]?.message || 'Erro ao definir nova senha.');
    }
  }


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Animatable.View
          animation="fadeInLeft"
          delay={500}
          style={[
            styles.containerHeader,
            {
              paddingTop: (Constants.statusBarHeight || 0) + 10 
            }
          ]}
        >
          <Text style={styles.message}>Alterar Senha</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" style={styles.containerForm}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {!pendingVerification && ( // Etapa 1: Solicitar E-mail
              <>
                <Text style={[styles.ForgotText, { color: theme.buttonPrimaryBg }]}>Esqueceu sua senha?</Text>
                <Text style={[styles.text, { color: theme.text }]}>Não se preocupe, enviaremos ao seu e-mail</Text>
                <Text style={[styles.text, { color: theme.text, marginBottom: 20 }]}>um código para checar sua autenticidade.</Text>

                <Text style={[styles.title, { color: theme.text }]}>Email da conta:</Text>
                <TextInput
                  placeholder="Digite seu email cadastrado para receber o código:"
                  style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                  placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                  autoCapitalize='none'
                  keyboardType="email-address"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                />

                <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonPrimaryBg }]} onPress={handleRequestReset} disabled={!isLoaded}>
                  <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>Enviar Código</Text>
                </TouchableOpacity>
              </>
            )}

            {pendingVerification && !pendingNewPassword && ( // Etapa 2: Inserir Código
              <>
                <Text style={[styles.ForgotText, { color: theme.buttonPrimaryBg }]}>Verificar Código</Text>
                <Text style={[styles.text, { color: theme.text, marginBottom: 20 }]}>Digite o código de verificação enviado para {emailAddress}:</Text>

                <Text style={[styles.title, { color: theme.text }]}>Código:</Text>
                <TextInput
                  placeholder="Código de verificação"
                  style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                  placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                />

                <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonPrimaryBg }]} onPress={handleVerifyCodeAndSetNewPassword} disabled={!isLoaded}>
                  <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>Verificar</Text>
                </TouchableOpacity>
              </>
            )}

            {pendingNewPassword && ( // Etapa 3: Definir Nova Senha
              <>
                <Text style={[styles.ForgotText, { color: theme.buttonPrimaryBg }]}>Definir Nova Senha</Text>
                <Text style={[styles.text, { color: theme.text, marginBottom: 20 }]}>Agora você pode definir uma nova senha para sua conta.</Text>

                <Text style={[styles.title, { color: theme.text }]}>Nova Senha:</Text>
                <TextInput
                  placeholder="Digite sua nova senha"
                  style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                  placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />

                <Text style={[styles.title, { color: theme.text }]}>Confirmar Nova Senha:</Text>
                <TextInput
                  placeholder="Confirme sua nova senha"
                  style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                  placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonPrimaryBg }]} onPress={handleSetNewPassword} disabled={!isLoaded}>
                  <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>Redefinir Senha</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity style={styles.buttonRegister} onPress={() => router.replace('/(public)/login')}>
              <Text style={[styles.registerText, { color: theme.text === '#FFFFFF' ? '#aaa' : '#a1a1a1' }]}>Voltar para o Login</Text>
            </TouchableOpacity>

          </ScrollView>
        </Animatable.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#38a69d',
  },
  container: {
    flex: 1,
    backgroundColor: '#38a69d',
  },
  containerHeader: {
    marginBottom: '8%',
    paddingStart: '5%',
  },
  message: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  containerForm: {
    backgroundColor: '#FFF',
    flex: 1,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingStart: '5%',
    paddingEnd: '5%',
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 20,
    flexGrow: 1,
  },
  ForgotText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
  title: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'left',
  },
  input: {
    borderBottomWidth: 1,
    height: 40,
    marginBottom: 12,
    fontSize: 16,
  },
  buttonForget: {
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#38a69d',
    width: '100%',
    borderRadius: 15,
    paddingVertical: 10,
    marginTop: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  buttonRegister: {
    marginTop: 14,
    alignSelf: 'center'
  },
  registerText: {
    color: '#a1a1a1'
  },
});