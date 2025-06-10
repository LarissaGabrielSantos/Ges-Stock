import { Modal, Alert, Platform, SafeAreaView } from 'react-native'; // REMOVER StatusBar daqui
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; // Certifique-se de ter 'expo install expo-constants'

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
  userId: string; // Adicionado para identificar categorias por usuário
}

interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  preco: number;
  categoriaId: string; // Renomeado de categoria_id para consistência com JS
  userId: string; // Adicionado para identificar produtos por usuário
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
    } catch (e) {
      console.error("Erro ao salvar produto no Async Storage:", e);
      Alert.alert("Erro ao Salvar", "Não foi possível salvar o produto.");
    } finally {
      setSavingProduct(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          style={[
            styles.headerText,
            { paddingTop: (Constants.statusBarHeight || 0) + 10 } // USAR SOMENTE Constants.statusBarHeight
          ]}
        >
          Cadastrar Produto
        </Text>
        <TextInput placeholder="Nome do produto" style={styles.input} value={nome} onChangeText={setNome} />
        <TextInput placeholder="Quantidade" style={styles.input} keyboardType="numeric" value={quantidade} onChangeText={setQuantidade} />
        <TextInput // CAMPO DE PREÇO FORMATADO
          placeholder="Preço ($0.00)"
          style={styles.input}
          keyboardType="numeric"
          value={formatCentsToCurrency(precoCents)}
          onChangeText={(text) => setPrecoCents(parseCurrencyInputToCents(text))}
        />

        {loadingCategorias ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#38a69d" />
            <Text style={{ marginLeft: 10 }}>Carregando categorias...</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.inputSelect}>
            <Text style={selectedCategoria ? styles.selectedText : styles.placeholderText}>
              {selectedCategoria ? selectedCategoria.nome : 'Selecionar categoria'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, savingProduct && styles.buttonDisabled]}
          onPress={handleSalvar}
          disabled={savingProduct}
        >
          {savingProduct ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Salvar</Text>
          )}
        </TouchableOpacity>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Selecione uma Categoria</Text>
              {categoriasDisponiveis.length === 0 ? (
                <Text style={styles.emptyCategoriesText}>Nenhuma categoria disponível. Cadastre uma categoria primeiro.</Text>
              ) : (
                <ScrollView>
                  {categoriasDisponiveis.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => {
                        setSelectedCategoria(cat);
                        setModalVisible(false);
                      }}
                      style={styles.modalItem}
                    >
                      <Text>{cat.nome}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeModalButton}>
                <Text style={styles.closeModalButtonText}>Fechar</Text>
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
    backgroundColor: '#f8f8f8',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputSelect: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
  },
  selectedText: {
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#38a69d',
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
    width: '85%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emptyCategoriesText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#777',
    fontStyle: 'italic',
  },
  closeModalButton: {
    marginTop: 20,
    backgroundColor: '#e0e0e0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  }
});