import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert, // Importar Alert para mensagens
  StatusBar // IMPORTAR StatusBar
} from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import Constants from 'expo-constants'; // IMPORTAR Constants


export default function Register() {
  const { isLoaded, setActive, signUp } = useSignUp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [code, setCode] = useState('');
  const [pendingEmailCode, setPendingEmailCode] = useState(false);

  async function handleSignUp() {
    if (!isLoaded) return;

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    try {
      await signUp.create({
        emailAddress: email.toLowerCase(),
        password,
        firstName,
        lastName,
        unsafeMetadata: {
          companyName,
        },
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingEmailCode(true);
    } catch (e: any) {
      Alert.alert('Erro', e.errors?.[0]?.message || 'Erro ao cadastrar.');
    }
  }

  async function handleVerifyUser() {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
      await setActive({ session: completeSignUp.createdSessionId });

      Alert.alert('Sucesso', 'Conta ativada com sucesso!');
      router.replace('/home');
    } catch (e) {
      Alert.alert('Erro', 'Código inválido ou expirado.');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}> {/* Usar styles.safeArea para padronizar */}
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView} // Usar estilo para KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? Constants.statusBarHeight + 10 : 0} // Ajustar offset para iOS se necessário
      >
        <View style={styles.container}>
          {!pendingEmailCode ? (
            <>
              {/* 1. Ajustar paddingTop do containerHeader para a Status Bar */}
              <Animatable.View
                animation="fadeInLeft"
                delay={500}
                style={[
                  styles.containerHeader,
                  {
                    paddingTop: Platform.select({
                      android: StatusBar.currentHeight || 0,
                      ios: Constants.statusBarHeight || 0,
                      default: 0
                    }) + 10 // Adiciona padding extra
                  }
                ]}
              >
                <Text style={styles.message}>Cadastre-se!</Text>
              </Animatable.View>

              <Animatable.View animation="fadeInUp" style={styles.containerForm}>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.title}>Nome</Text>
                  <TextInput
                    placeholder="Informe seu nome:"
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                  />

                  <Text style={styles.title}>Sobrenome</Text>
                  <TextInput
                    placeholder="Informe seu sobrenome:"
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                  />

                  <Text style={styles.title}>Nome da empresa</Text>
                  <TextInput
                    placeholder="Informe o nome da empresa:"
                    style={styles.input}
                    value={companyName}
                    onChangeText={setCompanyName}
                  />

                  <Text style={styles.title}>Email</Text>
                  <TextInput
                    placeholder="Digite seu email:"
                    style={styles.input}
                    onChangeText={setEmail}
                    value={email}
                    autoCapitalize="none"
                  />

                  <Text style={styles.title}>Senha</Text>
                  <TextInput
                    placeholder="Digite sua senha:"
                    style={styles.input}
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                    autoCapitalize="none"
                  />

                  <Text style={styles.title}>Confirme sua senha</Text>
                  <TextInput
                    placeholder="Digite sua senha novamente:"
                    style={styles.input}
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry
                    autoCapitalize="none"
                  />

                  <TouchableOpacity style={styles.button} onPress={handleSignUp}>
                    <Text style={styles.buttonText}>Cadastrar</Text>
                  </TouchableOpacity>

                  <Link href={'/(public)/login'} asChild>
                    <TouchableOpacity style={styles.buttonRegister}>
                      <Text style={styles.registerText}>Já possui conta? Faça Login!</Text>
                    </TouchableOpacity>
                  </Link>
                </ScrollView>
              </Animatable.View>
            </>
          ) : (
            <Animatable.View animation="fadeInUp" style={[styles.containerForm, { justifyContent: 'center' }]}>
              <Text style={[styles.title, { textAlign: 'center', marginBottom: 20 }]}>
                Digite o código enviado para seu email
              </Text>
              <TextInput
                placeholder="Código de verificação"
                style={styles.input}
                onChangeText={setCode}
                value={code}
                autoCapitalize="none"
                keyboardType="number-pad"
              />
              <TouchableOpacity style={styles.button} onPress={handleVerifyUser}>
                <Text style={styles.buttonText}>Ativar conta</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { // Estilo para SafeAreaView
    flex: 1,
    backgroundColor: '#38a69d',
  },
  keyboardAvoidingView: { // Estilo para KeyboardAvoidingView
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#38a69d',
  },
  containerHeader: {
    // Removido marginTop: 14, paddingTop será dinâmico
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
    paddingStart: '5%',
    paddingEnd: '5%',
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    marginTop: 28,
  },
  input: {
    borderBottomWidth: 1,
    height: 40,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#38a69d',
    width: '100%',
    borderRadius: 15,
    paddingVertical: 10,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonRegister: {
    marginTop: 14,
    alignSelf: 'center',
  },
  registerText: {
    color: '#a1a1a1',
  },
});