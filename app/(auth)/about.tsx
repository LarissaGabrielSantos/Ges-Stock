import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../../utils/context/themedContext';
import { styles } from './styles/about';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useTheme();

  const links = [
    'https://github.com/LarissaGabrielSantos',
    'https://github.com/GabrielGXM',
    'https://github.com/onunis',
    'https://github.com/GabACampos',
    'https://github.com/Cassioogn',
  ];

  const handlePress = (url: string) => {
    Alert.alert(
      'Abrir link externo',
      `Deseja ir para o link?\n${url}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Abrir',
          onPress: async () => {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
              Linking.openURL(url);
            } else {
              Alert.alert('Erro', 'Não foi possível abrir o link');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        <View
          style={[
            styles.header,
            {
              paddingTop:
                Platform.OS === 'android'
                  ? StatusBar.currentHeight
                  : Constants.statusBarHeight + 10,
              backgroundColor: theme.cardBackground,
              borderBottomColor: theme.cardBorder,
            },
          ]}
        >
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Sobre</Text>
          <View style={styles.spacer} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Image source={require('../../assets/logo2.png')} style={styles.logo} />

          <Text style={[styles.appTitle, { color: theme.buttonPrimaryBg }]}>GES Stock</Text>
          <Text style={[styles.versionText, { color: theme.text }]}>Versão 1.0.1</Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>O que é o GES Stock?</Text>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            O GES Stock é um aplicativo móvel intuitivo e fácil de usar, desenvolvido para auxiliar
            pequenos negócios e empreendedores a controlar seus produtos de forma eficiente. Com ele,
            você pode controlar seus produtos e categorias de forma simples, diretamente na palma da sua
            mão.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Principais Funções:</Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>Cadastro de Produtos:</Text> Adicione novos itens ao seu
              estoque com nome, quantidade, preço e categoria.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>Cadastro de Categorias:</Text> Organize seus produtos
              criando categorias personalizadas (ex: "Eletrônicos", "Alimentos", "Limpeza").
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>Visualização do Estoque:</Text> Consulte todos os
              produtos cadastrados de forma clara, podendo editar ou excluir.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>Edição e Exclusão de Produtos:</Text> Mantenha seus dados
              atualizados modificando ou removendo produtos do estoque.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Tecnologias Utilizadas:</Text>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            O desenvolvimento do GES Stock foi realizado com as seguintes tecnologias de ponta:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>React Native:</Text> Framework para construção de
              aplicativos móveis multiplataforma.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>Expo:</Text> Plataforma que facilita o desenvolvimento,
              teste e deploy de aplicativos React Native.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>Clerk:</Text> Solução de autenticação robusta para
              gerenciamento de usuários.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>Async Storage:</Text> Armazenamento de dados persistente
              e local no dispositivo.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>Expo Router:</Text> Sistema de roteamento baseado em
              arquivos para navegação.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • <Text style={styles.boldText}>@expo/vector-icons:</Text> Biblioteca de ícones para a
              interface.
            </Text>
          </View>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Contexto do Projeto:</Text>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            Este aplicativo foi concebido e desenvolvido como parte de um{' '}
            <Text style={styles.boldText}>Projeto de Extensão Universitária</Text>, visando aplicar
            conhecimentos práticos em desenvolvimento móvel e oferecer uma ferramenta útil para a
            comunidade.
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Desenvolvimento:</Text>
          <Text style={[styles.bodyText, { color: theme.text }]}>
            Gabriel Galdino Ximenes Matos; Larissa Gabriel dos Santos; Gabriel Alves Campos; Cassio
            Garcia Nobre; Guilherme de Araujo Nunes
          </Text>

          <Text style={[styles.sectionTitle, { color: theme.text }]}>Github:</Text>
          {links.map((link) => (
            <TouchableOpacity key={link} onPress={() => handlePress(link)}>
              <Text
                style={[
                  styles.bodyText,
                  { color: 'blue', textDecorationLine: 'underline', marginBottom: 6 },
                ]}
              >
                {link}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={[styles.versionText, { color: theme.grayDark }]}>Versão 1.0.1</Text>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
