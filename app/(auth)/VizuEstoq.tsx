import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../../utils/context/themedContext'; // Importar useTheme
import { useRouter } from 'expo-router'; // Importar useRouter
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
  const router = useRouter();

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

  const { theme } = useTheme(); // CHAMAR O HOOK useTheme AQUI!


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
      // Guardar valores antigos antes de atualizar
      const oldQuantity = selectedProduct.quantidade;
      const oldPrice = selectedProduct.preco;
      const oldCategoryName = getCategoryName(selectedProduct.categoriaId);

      const updatedProduct: Produto = {
        ...selectedProduct,
        nome: editedProductName.trim(),
        quantidade: parsedQuantity,
        preco: editedProductPriceCents / 100, // Salva o preço como REAL
        categoriaId: editedProductCategory.id,
      };
      const newCategoryName = getCategoryName(updatedProduct.categoriaId); // Nova categoria


      const updatedProdutos = produtos.map(p =>
        p.id === updatedProduct.id ? updatedProduct : p
      );
      await AsyncStorage.setItem(PRODUTOS_ASYNC_KEY, JSON.stringify(updatedProdutos));
      setProdutos(updatedProdutos);

      Alert.alert("Sucesso", "Produto atualizado!");
      setEditModalVisible(false);
      setSelectedProduct(null);

      // --- REGISTRAR TRANSAÇÃO: Edição de Produto ---
      await logTransaction(userId, 'edit_product', {
        productName: updatedProduct.nome,
        oldQuantity: oldQuantity,
        newQuantity: updatedProduct.quantidade,
        oldPrice: oldPrice,
        newPrice: updatedProduct.preco,
        productCategoryName: newCategoryName,
        // Você pode adicionar mais detalhes se a categoria mudou
        // categoryChanged: oldCategoryName !== newCategoryName,
      });
      // --- FIM REGISTRO ---

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
            if (!userId) { // Garante userId antes de deletar e logar
              Alert.alert("Erro", "Usuário não identificado.");
              return;
            }
            try {
              const productToDelete = produtos.find(p => p.id === productId); // Captura o produto completo
              const updatedProdutos = produtos.filter(p => p.id !== productId);
              await AsyncStorage.setItem(PRODUTOS_ASYNC_KEY, JSON.stringify(updatedProdutos));
              setProdutos(updatedProdutos);
              Alert.alert("Sucesso", "Produto excluído!");
              setEditModalVisible(false); // Fechar modal se a exclusão for de um produto selecionado

              // --- REGISTRAR TRANSAÇÃO: Exclusão de Produto ---
              if (productToDelete) {
                await logTransaction(userId, 'delete_product', {
                  productName: productToDelete.nome,
                  quantityRemoved: productToDelete.quantidade, // Quantidade que foi removida
                  productCategoryName: getCategoryName(productToDelete.categoriaId),
                  oldPrice: productToDelete.preco, // O preço do item que foi removido
                });
              }
              // --- FIM REGISTRO ---

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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Carregando estoque...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      {/* ADICIONADO: Cabeçalho com o botão de voltar */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10, backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Estoque Atual</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.container}>
        {/* O antigo Text do cabeçalho foi removido daqui e substituído pelo componente acima */}
        {produtos.length === 0 ? (
          <Text style={[styles.emptyListText, { color: theme.text }]}>Nenhum produto cadastrado ainda.</Text>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.productCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
                <View style={styles.productInfo}>
                  <Text style={[styles.productName, { color: theme.text }]}>{item.nome}</Text>
                  <Text style={[{ color: theme.text }]}>Qtde: {item.quantidade} | Preço: {formatCentsToCurrency(Math.round(item.preco * 100))}</Text>
                  <Text style={[{ color: theme.text }]}>Categoria: {getCategoryName(item.categoriaId)}</Text>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity onPress={() => handleEditPress(item)} style={styles.actionButton}>
                    <MaterialIcons name="edit" size={24} color={theme.buttonPrimaryBg} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteProduct(item.id, item.nome)} style={styles.actionButton}>
                    <MaterialIcons name="delete" size={24} color={theme.red} />
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
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Editar Produto</Text>
            <ScrollView contentContainerStyle={styles.modalScrollView}>
              <TextInput
                placeholder="Nome do produto"
                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                value={editedProductName}
                onChangeText={setEditedProductName}
              />
              <TextInput
                placeholder="Quantidade"
                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                keyboardType="numeric"
                value={editedProductQuantity}
                onChangeText={setEditedProductQuantity}
              />
              <TextInput
                placeholder="Preço ($0.00)"
                style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder, color: theme.inputText }]}
                placeholderTextColor={theme.text === '#FFFFFF' ? '#aaa' : '#999'}
                keyboardType="numeric"
                value={formatCentsToCurrency(editedProductPriceCents)}
                onChangeText={(text) => setEditedProductPriceCents(parseCurrencyInputToCents(text))}
              />

              {/* Seleção de Categoria dentro do Modal de Edição */}
              <TouchableOpacity onPress={() => setCategorySelectModalVisible(true)} style={[styles.inputSelect, { backgroundColor: theme.inputBackground, borderColor: theme.cardBorder }]}>
                <Text style={editedProductCategory ? { color: theme.inputText } : { color: theme.text === '#FFFFFF' ? '#aaa' : '#999' }}>
                  {editedProductCategory ? editedProductCategory.nome : 'Selecionar categoria'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, { backgroundColor: theme.buttonPrimaryBg }]} onPress={handleSaveEdit}>
                <Text style={styles.buttonText}>Salvar Edição</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.buttonCancel, { backgroundColor: theme.buttonSecondaryBg }]} onPress={() => setEditModalVisible(false)}>
                <Text style={[styles.buttonTextCancel, { color: theme.buttonSecondaryText }]}>Cancelar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal de Seleção de Categoria */}
      <Modal visible={categorySelectModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Selecione uma Categoria</Text>
            {categorias.length === 0 ? (
              <Text style={[styles.emptyCategoriesText, { color: theme.text }]}>Nenhuma categoria disponível.</Text>
            ) : (
              <ScrollView>
                {categorias.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => {
                      setEditedProductCategory(cat);
                      setCategorySelectModalVisible(false);
                    }}
                    style={[styles.modalItem, { borderBottomColor: theme.cardBorder }]}
                  >
                    <Text style={{ color: theme.text }}>{cat.nome}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={[styles.closeModalButton, { backgroundColor: theme.buttonSecondaryBg }]} onPress={() => setCategorySelectModalVisible(false)}>
              <Text style={[styles.closeModalButtonText, { color: theme.buttonSecondaryText }]}>Fechar</Text>
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
    // backgroundColor handled by theme
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
    // color handled by theme
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor handled by theme
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    // color handled by theme
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    // color handled by theme
  },
  productCard: {
    // backgroundColor handled by theme
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    // borderColor handled by theme
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
    // color handled by theme
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
    // backgroundColor handled by theme
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
    // color handled by theme
  },
  modalScrollView: {
    paddingBottom: 10,
  },
  input: {
    borderWidth: 1,
    // borderColor handled by theme
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
    marginBottom: 15,
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
    marginBottom: 15,
    // backgroundColor handled by theme
  },
  placeholderText: {
    // color handled by theme (via conditional inline style)
    fontSize: 16,
  },
  selectedText: {
    // color handled by theme (via conditional inline style)
    fontSize: 16,
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
  spacer: {
    width: 38, // Largura do ícone (28) + padding (5*2) para manter o título centralizado
  },
  backButton: {
    padding: 5,
  },
  button: {
    // backgroundColor handled by theme
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
    // backgroundColor handled by theme
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { // This one is good
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  buttonTextCancel: {
    color: '#333', // This one should be theme.buttonSecondaryText
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalItem: {
    padding: 12,
    borderBottomWidth: 1,
    // borderBottomColor handled by theme
  },
  emptyCategoriesText: {
  textAlign: 'center',
  marginTop: 10,
  color: '#777',
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
    color: '#333', // This one should be theme.buttonSecondaryText
    fontWeight: 'bold',
    fontSize: 18,
  },
});