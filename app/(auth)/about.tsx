// ARQUIVO about.tsx

import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants'; // Certifique-se de ter 'expo install expo-constants'


export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Customizado */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sobre</Text>
          <View style={styles.spacer} /> {/* Espaçador para centralizar o título */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.appTitle}>📈 GES Stock</Text>
          <Text style={styles.versionText}>Versão 1.0.0</Text>

          <Text style={styles.sectionTitle}>O que é o GES Stock?</Text>
          <Text style={styles.bodyText}>
            O GES Stock é um aplicativo móvel intuitivo e fácil de usar, desenvolvido para auxiliar pequenos negócios e empreendedores a controlar seus produtos de forma eficiente.
            Com ele, você pode controlar seus produtos e categorias de forma simples, diretamente na palma da sua mão.
          </Text>

          <Text style={styles.sectionTitle}>Principais Funções:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Cadastro de Produtos:</Text> Adicione novos itens ao seu estoque com nome, quantidade, preço e categoria.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Cadastro de Categorias:</Text> Organize seus produtos criando categorias personalizadas (ex: "Eletrônicos", "Alimentos", "Limpeza").</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Visualização do Estoque:</Text> Consulte todos os produtos cadastrados de forma clara, podendo editar ou excluir.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Edição e Exclusão:</Text> Mantenha seus dados atualizados modificando ou removendo produtos do estoque.</Text>
          </View>

          <Text style={styles.sectionTitle}>Tecnologias Utilizadas:</Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>React Native:</Text> Framework para construção de aplicativos móveis multiplataforma.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Expo:</Text> Plataforma que facilita o desenvolvimento, teste e deploy de aplicativos React Native.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Clerk:</Text> Solução de autenticação robusta para gerenciamento de usuários.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Async Storage:</Text> Armazenamento de dados persistente e local no dispositivo do usuário.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>Expo Router:</Text> Sistema de roteamento baseado em arquivos para navegação.</Text>
            <Text style={styles.bulletItem}>• <Text style={styles.boldText}>@expo/vector-icons:</Text> Biblioteca de ícones para a interface.</Text>
          </View>

          <Text style={styles.sectionTitle}>Contexto do Projeto:</Text>
          <Text style={styles.bodyText}>
            Este aplicativo foi concebido e desenvolvido como parte de um <Text style={styles.boldText}>Projeto de Extensão Universitária</Text>, visando aplicar conhecimentos práticos
            em desenvolvimento móvel e oferecer uma ferramenta útil para a comunidade.
          </Text>

          <Text style={styles.sectionTitle}>Desenvolvimento:</Text>
          <Text style={styles.bodyText}>
            [Seu Nome ou Nomes dos Membros da Equipe]
          </Text>
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
    flex: 1, // Permite que o título ocupe o espaço e centralize se quiser
    textAlign: 'center', // Centraliza o título
  },
  backButton: {
    padding: 5,
    marginRight: 10, // Espaço entre o botão e o título
  },
  spacer: {
    width: 28 + 10, // Largura do ícone + margem para simetria com o backButton
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40, // Espaço extra no final para evitar que o conteúdo fique grudado
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#38a69d',
    textAlign: 'center',
    marginBottom: 5,
  },
  versionText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 25,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 10,
  },
  bulletList: {
    marginTop: 5,
    marginBottom: 10,
  },
  bulletItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  }
});