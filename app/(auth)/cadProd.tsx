import { Modal, Alert, Platform, SafeAreaView, StatusBar } from 'react-native';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useTheme } // <-- Caminho atualizado pelo seu feedback
 from '../../utils/context/themedContext'; 
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { logTransaction } from '../../utils/transactionLogger'; // <-- IMPORTAR O LOGGER DE TRANSAÇÕES


// Converte um número inteiro (centavos) para uma string de moeda formatada ($X.XX)
const formatCentsToCurrency = (cents: number): string => {
  if (isNaN(cents) || cents < 0) {
    return "$0.00";
  }
  const actualCents = Math.round(Math.max(0, cents));
  const str = String(actualCents).padStart(3, '0');
  const integerPart = str.slice(0, -2);
  const decimalPart = str.slice(-2);
  return `$${integerPart}.${decimalPart}`;
};

// Converte uma string de input (com ou sem símbolos, letras, etc.) para um número inteiro (centavos)
const parseCurrencyInputToCents = (text: string): number => {
  const cleanText = text.replace(/[^0-9]/g, '');
  if (!cleanText) {
    return 0;
  }
  return parseInt(cleanText, 10);
};

// Tipagem para Categoria e Produto (para Async Storage)
interface Categoria {
  id: string;
  nome: string;
  userId: string;
}

interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
  categoriaId: string; // Renomeado de categoria_id para consistência com JS
  userId: string;
}

export default function CadastroProduto() {
  const { userId, isLoaded } = useAuth();
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [precoCents, setPrecoCents] = useState(0); // Estado para o preço em CENTAVOS
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [categoriasDisponiveis, setCategoriasDisponiveis] = useState<Categoria[]>([]);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);

  const { theme } = useTheme(); // Chamar o hook useTheme
  const router = useRouter(); // Chamar useRouter para botão de voltar


  // Chaves para AsyncStorage
  const CATEGORIAS_ASYNC_KEY = `user_${userId}_categorias`;
  const PRODUTOS_ASYNC_KEY = `user_${userId}_produtos`;

  const fetchCategorias = useCallback(async () => {
    if (!userId) {
      setLoadingCategorias(false);
      return;
    }
    setLoadingCategorias(true);
    try {
      const storedCategorias = await AsyncStorage.getItem(CATEGORIAS_ASYNC_KEY);
      if (storedCategorias) {
        setCategoriasDisponiveis(JSON.parse(storedCategorias));
      }
    } catch (e) {
      console.error("Erro ao carregar categorias do Async Storage:", e);
      Alert.alert("Erro", "Não foi possível carregar as categorias disponíveis.");
    } finally {
      setLoadingCategorias(false);
    }
  }, [userId, CATEGORIAS_ASYNC_KEY]);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchCategorias();
    } else if (isLoaded && !userId) {
      setLoadingCategorias(false);
      Alert.alert("Erro", "Você precisa estar logado para carregar categorias.");
    }
  }, [isLoaded, userId, fetchCategorias]);

  const handleSalvar = async () => {
    if (savingProduct) return;

    if (!nome.trim() || !quantidade.trim() || precoCents <= 0 || !selectedCategoria || !userId) {
      Alert.alert("Preencha todos os campos", "Por favor, preencha todos os dados do produto, insira um preço válido e selecione uma categoria.");
      return;
    }

    const parsedQuantidade = parseInt(quantidade);

    if (isNaN(parsedQuantidade) || parsedQuantidade <= 0) {
      Alert.alert("Quantidade inválida", "Por favor, insira uma quantidade numérica e positiva.");
      return;
    }

    setSavingProduct(true);
    try {
      const storedProdutos = await AsyncStorage.getItem(PRODUTOS_ASYNC_KEY);
      const produtos: Produto[] = storedProdutos ? JSON.parse(storedProdutos) : [];

      const newProduto: Produto = {
        id: Date.now().toString(),
        nome: nome.trim(),
        quantidade: parsedQuantidade,
        preco: precoCents / 100, // Salva o preço como REAL (ex: 1.00)
        categoriaId: selectedCategoria.id,
        userId: userId,
      };

      const updatedProdutos = [...produtos, newProduto];
      await AsyncStorage.setItem(PRODUTOS_ASYNC_KEY, JSON.stringify(updatedProdutos));

      Alert.alert("Sucesso", "Produto cadastrado com sucesso!");
      setNome('');
      setQuantidade('');
      setPrecoCents(0); // Reseta para 0 centavos
      setSelectedCategoria(null);

      // --- REGISTRAR TRANSAÇÃO: Adição de Produto ---
      await logTransaction(userId, 'add_product', {
        productName: newProduto.nome,
        quantityAdded: newProduto.quantidade,
        newPrice: newProduto.preco,
        productCategoryName: selectedCategoria.nome, // Nome da categoria
      });
      // --- FIM REGISTRO ---

    } catch (e) {
      console.error("Erro ao salvar produto no Async Storage:", e);
      Alert.alert("Erro ao Salvar", "Não foi possível salvar o produto.");
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* Header Customizado */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10, backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Cadastrar Produto</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          placeholder="Nome do produto"
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
          placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
          value={nome}
          onChangeText={setNome}
        />
        <TextInput
          placeholder="Quantidade"
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
          placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
          keyboardType="numeric"
          value={quantidade}
          onChangeText={setQuantidade}
        />
        <TextInput
          placeholder="Preço ($0.00)"
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
          placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
          keyboardType="numeric"
          value={formatCentsToCurrency(precoCents)}
          onChangeText={(text) => setPrecoCents(parseCurrencyInputToCents(text))}
        />

        {loadingCategorias ? (
          <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
            <ActivityIndicator size="small" color={theme.text} />
            <Text style={[{ marginLeft: 10, color: theme.text }]}>Carregando categorias...</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setModalVisible(true)} style={[styles.inputSelect, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
            <Text style={selectedCategoria ? { color: theme.inputText } : { color: theme.text === '#FFFFFF' ? '#aaa' : '#999' }}>
              {selectedCategoria ? selectedCategoria.nome : 'Selecionar categoria'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.buttonPrimaryBg }, savingProduct && styles.buttonDisabled]}
          onPress={handleSalvar}
          disabled={savingProduct}
        >
          {savingProduct ? (
            <ActivityIndicator color={theme.buttonPrimaryText} />
          ) : (
            <Text style={[styles.buttonText, { color: theme.buttonPrimaryText }]}>Salvar</Text>
          )}
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Selecione uma Categoria</Text>
              {categoriasDisponiveis.length === 0 ? (
                <Text style={[styles.emptyCategoriesText, { color: theme.text }]}>Nenhuma categoria disponível. Cadastre uma categoria primeiro.</Text>
              ) : (
                <ScrollView>
                  {categoriasDisponiveis.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategoria(cat);
                        setModalVisible(false);
                      }}
                      style={[styles.modalItem, { borderBottomColor: theme.cardBorder }]}
                    >
                      <Text style={{ color: theme.text }}>{cat.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <TouchableOpacity style={[styles.closeModalButton, { backgroundColor: theme.buttonSecondaryBg }]} onPress={() => setModalVisible(false)}>
                <Text style={[styles.closeModalButtonText, { color: theme.buttonSecondaryText }]}>Fechar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor handled by theme
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  input: {
    borderWidth: 1,
    // borderColor handled by theme
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    // backgroundColor handled by theme
    // color handled by theme
  },
  inputSelect: {
    borderWidth: 1,
    // borderColor handled by theme
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 20,
    // backgroundColor handled by theme
  },
  button: {
    // backgroundColor handled by theme
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  buttonText: {
    // color handled by theme (via conditional inline style)
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
    // backgroundColor handled by theme
    padding: 20,
    borderRadius: 10,
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    // color handled by theme
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    // borderBottomColor handled by theme
  },
  emptyCategoriesText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    // color handled by theme
    fontStyle: 'italic',
  },
  closeModalButton: {
    marginTop: 20,
    // backgroundColor handled by theme
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    // color handled by theme
    fontWeight: 'bold',
    fontSize: 18,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    // backgroundColor handled by theme
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 5,
  },
  spacer: {
    width: 28,
  },
});