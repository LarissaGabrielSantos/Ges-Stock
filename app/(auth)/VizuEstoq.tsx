import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';

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

// Tipagens para Categoria e Produto
interface Categoria {
  id: string;
  nome: string;
  userId: string;
}

interface Produto {
  id: string;
  nome: string;
  quantidade: number;
  preco: number; // Preço real (ex: 10.50)
  categoriaId: string;
  userId: string;
}

export default function VisualizarEstoque() {
  const { userId, isLoaded } = useAuth();
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);

  // Estados para edição no modal
  const [editedProductName, setEditedProductName] = useState('');
  const [editedProductQuantity, setEditedProductQuantity] = useState('');
  const [editedProductPriceCents, setEditedProductPriceCents] = useState(0); // Preço em CENTAVOS para edição
  const [editedProductCategory, setEditedProductCategory] = useState<Categoria | null>(null);

  // Variável de estado para o modal de seleção de categoria (dentro do modal de edição)
  const [categorySelectModalVisible, setCategorySelectModalVisible] = useState(false);


  // Chaves para AsyncStorage
  const PRODUTOS_ASYNC_KEY = `user_${userId}_produtos`;
  const CATEGORIAS_ASYNC_KEY = `user_${userId}_categorias`;

  // Função para carregar produtos e categorias
  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const storedProdutos = await AsyncStorage.getItem(PRODUTOS_ASYNC_KEY);
      const storedCategorias = await AsyncStorage.getItem(CATEGORIAS_ASYNC_KEY);

      if (storedProdutos) {
        setProdutos(JSON.parse(storedProdutos));
      } else {
        setProdutos([]);
      }

      if (storedCategorias) {
        setCategorias(JSON.parse(storedCategorias));
      } else {
        setCategorias([]);
      }
    } catch (e) {
      console.error("Erro ao carregar dados do Async Storage:", e);
      Alert.alert("Erro", "Não foi possível carregar os dados do estoque.");
    } finally {
      setLoading(false);
    }
  }, [userId, PRODUTOS_ASYNC_KEY, CATEGORIAS_ASYNC_KEY]);

  useEffect(() => {
    if (isLoaded && userId) {
      loadData();
    } else if (isLoaded && !userId) {
      setLoading(false);
      Alert.alert("Erro de Autenticação", "Você precisa estar logado para visualizar o estoque.");
    }
  }, [isLoaded, userId, loadData]);

  // Função para obter o nome da categoria pelo ID
  const getCategoryName = (categoryId: string) => {
    const category = categorias.find(cat => cat.id === categoryId);
    return category ? category.nome : 'Sem Categoria';
  };

  // Função para abrir o modal de edição
  const handleEditPress = (product: Produto) => {
    setSelectedProduct(product);
    setEditedProductName(product.nome);
    setEditedProductQuantity(product.quantidade.toString());
    setEditedProductPriceCents(Math.round(product.preco * 100)); // Converte preço float para centavos
    const currentCategory = categorias.find(cat => cat.id === product.categoriaId);
    setEditedProductCategory(currentCategory || null);
    setEditModalVisible(true);
  };

  // Função para salvar as edições de um produto
  const handleSaveEdit = async () => {
    if (!selectedProduct || !userId) return;

    if (!editedProductName.trim() || !editedProductQuantity.trim() || editedProductPriceCents <= 0 || !editedProductCategory) {
      Alert.alert("Preencha todos os campos", "Por favor, preencha todos os dados do produto, insira um preço válido e selecione uma categoria.");
      return;
    }

    const parsedQuantity = parseInt(editedProductQuantity);

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      Alert.alert("Dados inválidos", "Verifique Quantidade e Preço.");
      return;
    }

    try {
      const updatedProduct: Produto = {
        ...selectedProduct,
        nome: editedProductName.trim(),
        quantidade: parsedQuantity,
        preco: editedProductPriceCents / 100, // Salva o preço como REAL
        categoriaId: editedProductCategory.id,
      };

      const updatedProdutos = produtos.map(p =>
        p.id === updatedProduct.id ? updatedProduct : p
      );
      await AsyncStorage.setItem(PRODUTOS_ASYNC_KEY, JSON.stringify(updatedProdutos));
      setProdutos(updatedProdutos);

      Alert.alert("Sucesso", "Produto atualizado!");
      setEditModalVisible(false);
      setSelectedProduct(null);
    } catch (e) {
      console.error("Erro ao salvar edição:", e);
      Alert.alert("Erro", "Não foi possível atualizar o produto.");
    }
  };

  // Função para deletar um produto
  const handleDeleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir "${productName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const updatedProdutos = produtos.filter(p => p.id !== productId);
              await AsyncStorage.setItem(PRODUTOS_ASYNC_KEY, JSON.stringify(updatedProdutos));
              setProdutos(updatedProdutos);
              Alert.alert("Sucesso", "Produto excluído!");
              setEditModalVisible(false);
            } catch (e) {
              console.error("Erro ao deletar produto:", e);
              Alert.alert("Erro", "Não foi possível excluir o produto.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38a69d" />
        <Text style={styles.loadingText}>Carregando estoque...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text
          style={[
            styles.headerText,
            { paddingTop: (Constants.statusBarHeight || 0) + 10 }
          ]}
        >
          Estoque Atual
        </Text>
        {produtos.length === 0 ? (
          <Text style={styles.emptyListText}>Nenhum produto cadastrado ainda.</Text>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.nome}</Text>
                  <Text>Qtde: {item.quantidade} | Preço: {formatCentsToCurrency(Math.round(item.preco * 100))}</Text>
                  <Text>Categoria: {getCategoryName(item.categoriaId)}</Text>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.actionButton}>
                    <MaterialIcons name="edit" size={24} color="#38a69d" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteProduct(item.id, item.nome)} style={styles.actionButton}>
                    <MaterialIcons name="delete" size={24} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.flatListContentContainer}
          />
        )}
      </View>

      {/* Modal de Edição de Produto */}
      <Modal visible={editModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar Produto</Text>
            <ScrollView contentContainerStyle={styles.modalScrollView}>
              <TextInput
                placeholder="Nome do produto"
                style={styles.input}
                value={editedProductName}
                onChangeText={setEditedProductName}
              />
              <TextInput
                placeholder="Quantidade"
                style={styles.input}
                keyboardType="numeric"
                value={editedProductQuantity}
                onChangeText={setEditedProductQuantity}
              />
              <TextInput
                placeholder="Preço ($0.00)"
                style={styles.input}
                keyboardType="numeric"
                value={formatCentsToCurrency(editedProductPriceCents)}
                onChangeText={(text) => setEditedProductPriceCents(parseCurrencyInputToCents(text))}
              />

              {/* Seleção de Categoria dentro do Modal de Edição */}
              <TouchableOpacity onPress={() => setCategorySelectModalVisible(true)} style={styles.inputSelect}>
                <Text style={editedProductCategory ? styles.selectedText : styles.placeholderText}>
                  {editedProductCategory ? editedProductCategory.nome : 'Selecionar categoria'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleSaveEdit}>
                <Text style={styles.buttonText}>Salvar Edição</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.buttonCancel} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.buttonTextCancel}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Categoria */}
      <Modal visible={categorySelectModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecione uma Categoria</Text>
            {categorias.length === 0 ? (
              <Text style={styles.emptyCategoriesText}>Nenhuma categoria disponível.</Text>
            ) : (
              <ScrollView>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setEditedProductCategory(cat);
                      setCategorySelectModalVisible(false);
                    }}
                    style={styles.modalItem}
                  >
                    <Text>{cat.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setCategorySelectModalVisible(false)} style={styles.closeModalButton}>
              <Text style={styles.closeModalButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  flatListContentContainer: {
    flexGrow: 1,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyListText: { // <<---- Este estilo estava correto aqui
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#777',
  },
  emptyCategoriesText: {
  textAlign: 'center',
  marginTop: 10,
  color: '#777',
  fontStyle: 'italic',
  },
  productCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
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
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalScrollView: {
    paddingBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
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
    marginBottom: 15,
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
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonCancel: {
    backgroundColor: '#e0e0e0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { // <<---- Este estilo estava correto aqui
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonTextCancel: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
});