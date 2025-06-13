import React from 'react';
import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, SafeAreaView, Platform, StatusBar } from 'react-native'; // Importar SafeAreaView, Platform, StatusBar
import { useSignIn } from '@clerk/clerk-expo';
import { Link } from 'expo-router';
import * as Animatable from 'react-native-animatable';
import Constants from 'expo-constants';
import { styles } from '../(auth)/styles/login';

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

    } catch (err: any) { 
      alert(err.errors?.[0]?.message || "Erro ao fazer login."); 
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
              paddingTop: Platform.select({
                android: StatusBar.currentHeight || 0, 
                ios: Constants.statusBarHeight || 0,   
                default: 0 
              }) + 10 
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

