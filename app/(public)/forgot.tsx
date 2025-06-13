import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  Alert,
  Platform,
  StatusBar
} from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import Constants from 'expo-constants';
import { styles } from '../(auth)/styles/forgot';

export default function Forgot() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [pendingNewPassword, setPendingNewPassword] = useState(false);

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
      Alert.alert('Sucesso', 'Código enviado para o seu e-mail.');
    } catch (err: any) {
      Alert.alert('Erro', err.errors?.[0]?.message || 'Erro ao enviar código.');
    }
  }

  async function handleVerifyCodeAndSetNewPassword() {
    if (!isLoaded || !code.trim()) {
      Alert.alert('Erro', 'Por favor, digite o código.');
      return;
    }

    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code,
      });

      if (result.status === 'needs_new_password') {
        setPendingNewPassword(true);
        Alert.alert('Verificação concluída', 'Agora defina sua nova senha.');
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        Alert.alert('Sucesso', 'Senha resetada com sucesso!');
        router.replace('/(auth)/home');
      } else {
        Alert.alert('Erro', 'Status inesperado: ' + result.status);
      }
    } catch (err: any) {
      Alert.alert('Erro', err.errors?.[0]?.message || 'Código inválido.');
    }
  }

  async function handleSetNewPassword() {
    if (!isLoaded || !password || !confirmPassword) return;

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'A nova senha e a confirmação não coincidem.');
      return;
    }

    try {
      const result = await signIn.resetPassword({ password });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        Alert.alert('Sucesso', 'Senha alterada com sucesso!');
        router.replace('/(auth)/home');
      } else {
        Alert.alert('Erro', 'Não foi possível alterar a senha. Status: ' + result.status);
      }
    } catch (err: any) {
      Alert.alert('Erro', err?.errors?.[0]?.message || 'Erro ao redefinir senha.');
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
              paddingTop: (Constants.statusBarHeight || 0) + 10,
            },
          ]}
        >
          <Text style={styles.message}>Alterar Senha</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" style={styles.containerForm}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {!pendingVerification && (
              <>
                <Text style={[styles.ForgotText]}>Esqueceu sua senha?</Text>
                <Text style={[styles.text]}>Enviaremos um código para seu e-mail.</Text>

                <Text style={[styles.title]}>Email da conta:</Text>
                <TextInput
                  placeholder="Digite seu email"
                  style={[
                    styles.input,
                  ]}
                  placeholderTextColor=  '#aaa' 
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                />

                <TouchableOpacity
                  style={[styles.button]}
                  onPress={handleRequestReset}
                  disabled={!isLoaded}
                >
                  <Text style={[styles.buttonText]}>Enviar Código</Text>
                </TouchableOpacity>
              </>
            )}

            {pendingVerification && !pendingNewPassword && (
              <>
                <Text style={[styles.ForgotText]}>Verificar Código</Text>
                <Text style={[styles.text]}>
                  Código enviado para {emailAddress}
                </Text>

                <Text style={[styles.title]}>Código:</Text>
                <TextInput
                  placeholder="Digite o código"
                  style={[
                    styles.input,
                  ]}
                  placeholderTextColor='#aaa'
                  keyboardType="number-pad"
                  value={code}
                  onChangeText={setCode}
                />

                <TouchableOpacity
                  style={[styles.button]}
                  onPress={handleVerifyCodeAndSetNewPassword}
                  disabled={!isLoaded}
                >
                  <Text style={[styles.buttonText]}>Verificar</Text>
                </TouchableOpacity>
              </>
            )}

            {pendingNewPassword && (
              <>
                <Text style={[styles.ForgotText]}>Nova Senha</Text>

                <Text style={[styles.title]}>Nova Senha:</Text>
                <TextInput
                  placeholder="Digite nova senha"
                  secureTextEntry
                  style={[
                    styles.input
                  ]}
                  placeholderTextColor= '#aaa'
                  value={password}
                  onChangeText={setPassword}
                />

                <Text style={[styles.title]}>Confirmar Nova Senha:</Text>
                <TextInput
                  placeholder="Confirme a senha"
                  secureTextEntry
                  style={[
                    styles.input
                  ]}
                  placeholderTextColor= '#aaa'
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />

                <TouchableOpacity
                  style={[styles.button]}
                  onPress={handleSetNewPassword}
                  disabled={!isLoaded}
                >
                  <Text style={[styles.buttonText]}>Redefinir Senha</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.buttonRegister}
              onPress={() => router.replace('/(public)/login')}
            >
              <Text
                style={[
                  styles.registerText
                ]}
              >
                Voltar para o Login
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animatable.View>
      </View>
    </SafeAreaView>
  );
}

