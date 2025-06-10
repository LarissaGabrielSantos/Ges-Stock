import React from 'react';
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Platform, StatusBar } from 'react-native'; // Importar SafeAreaView, Platform, StatusBar
import { useSignIn } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import Constants from 'expo-constants'; // Certifique-se de ter 'expo install expo-constants'

export default function Login() {
  const { isLoaded, setActive, signIn } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignIn() {
    if (!isLoaded) return;

    try {
      const signInUser = await signIn.create({
        identifier: email,
        password: password
      });

      await setActive({ session: signInUser.createdSessionId });

    } catch (err: any) { // Tipar 'err' como 'any' para evitar erros de TS se não for pego em um catch block
      alert(err.errors?.[0]?.message || "Erro ao fazer login."); // Melhorar a mensagem de erro
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}> {/* 1. Usar SafeAreaView como wrapper principal */}
      <View style={styles.container}>
        {/* 2. Ajustar paddingTop do containerHeader para a Status Bar */}
        <Animatable.View
          animation="fadeInLeft"
          delay={500}
          style={[
            styles.containerHeader,
            {
              // --- CORREÇÃO AQUI: USAR Platform.select para um cálculo mais robusto ---
              paddingTop: Platform.select({
                android: StatusBar.currentHeight || 0, // Pega a altura atual da Status Bar no Android, ou 0 se undefined
                ios: Constants.statusBarHeight || 0,   // Pega a altura da Status Bar/notch no iOS, ou 0 se undefined
                default: 0 // Fallback para outras plataformas
              }) + 10 // Adiciona um padding extra de 10 unidades
            }
          ]}
        >
          <Text style={styles.message}>Bem Vindo(a)</Text>
        </Animatable.View>

        <Animatable.View animation="fadeInUp" style={styles.containerForm}>

          <Text style={styles.title}>Email</Text>
          <TextInput
            autoCapitalize='none'
            placeholder="Digite seu email:"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.title}>Senha</Text>
          <TextInput
            autoCapitalize='none'
            placeholder="Digite sua senha:"
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <Link href={"/(public)/forgot"} asChild>
            <TouchableOpacity style={styles.buttonForget}>
              <Text >Esqueci minha senha</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>Acessar</Text>
          </TouchableOpacity>

          <Link href={'/(public)/register'} asChild>
            <TouchableOpacity style={styles.buttonRegister} >
              <Text style={styles.registerText}>Não possui conta? Cadastre-se!</Text>
            </TouchableOpacity>
          </Link>

        </Animatable.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { // 3. Novo estilo para SafeAreaView
    flex: 1,
    backgroundColor: '#38a69d',
  },
  container: {
    flex: 1,
    // Remover qualquer paddingTop fixo que possa ter aqui
  },
  containerHeader: {
    // marginTop: 14, <--- REMOVER ESTA LINHA (paddingTop será dinâmico)
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
    paddingEnd: '5%'
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
  buttonForget: {
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center'
  },
  button: {
    backgroundColor: '#38a69d',
    width: '100%',
    borderRadius: 15,
    paddingVertical: 10, // Aumentado padding para melhor toque
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
  }
});