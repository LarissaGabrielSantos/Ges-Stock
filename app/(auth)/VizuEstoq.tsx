import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useTheme } from '../../utils/context/themedContext';
import { useRouter } from 'expo-router';
import { logTransaction } from '../../utils/transactionLogger'; 
import { styles } from './styles/VizuEstoq';

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

const parseCurrencyInputToCents = (text: string): number => {
  const cleanText = text.replace(/[^0-9]/g, '');
  if (!cleanText) {
    return 0;
  }
  return parseInt(cleanText, 10);
};


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

 
  const [editedProductName, setEditedProductName] = useState('');
  const [editedProductQuantity, setEditedProductQuantity] = useState('');
  const [editedProductPriceCents, setEditedProductPriceCents] = useState(0); 
  const [editedProductCategory, setEditedProductCategory] = useState<Categoria | null>(null);

  
  const [categorySelectModalVisible, setCategorySelectModalVisible] = useState(false);

  const { theme } = useTheme(); 



  const PRODUTOS_ASYNC_KEY = `user_${userId}_produtos`;
  const CATEGORIAS_ASYNC_KEY = `user_${userId}_categorias`;

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

  const getCategoryName = (categoryId: string) => {
    const category = categorias.find(cat => cat.id === categoryId);
    return category ? category.nome : 'Sem Categoria';
  };

  const handleEditPress = (product: Produto) => {
    setSelectedProduct(product);
    setEditedProductName(product.nome);
    setEditedProductQuantity(product.quantidade.toString());
    setEditedProductPriceCents(Math.round(product.preco * 100)); 
    const currentCategory = categorias.find(cat => cat.id === product.categoriaId);
    setEditedProductCategory(currentCategory || null);
    setEditModalVisible(true);
  };

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
      const oldQuantity = selectedProduct.quantidade;
      const oldPrice = selectedProduct.preco;
      const oldCategoryName = getCategoryName(selectedProduct.categoriaId);

      const updatedProduct: Produto = {
        ...selectedProduct,
        nome: editedProductName.trim(),
        quantidade: parsedQuantity,
        preco: editedProductPriceCents / 100, 
        categoriaId: editedProductCategory.id,
      };
      const newCategoryName = getCategoryName(updatedProduct.categoriaId);


      const updatedProdutos = produtos.map(p =>
        p.id === updatedProduct.id ? updatedProduct : p
      );
      await AsyncStorage.setItem(PRODUTOS_ASYNC_KEY, JSON.stringify(updatedProdutos));
      setProdutos(updatedProdutos);

      Alert.alert("Sucesso", "Produto atualizado!");
      setEditModalVisible(false);
      setSelectedProduct(null);

      await logTransaction(userId, 'edit_product', {
        productName: updatedProduct.nome,
        oldQuantity: oldQuantity,
        newQuantity: updatedProduct.quantidade,
        oldPrice: oldPrice,
        newPrice: updatedProduct.preco,
        productCategoryName: newCategoryName,
    
      });

    } catch (e) {
      console.error("Erro ao salvar edição:", e);
      Alert.alert("Erro", "Não foi possível atualizar o produto.");
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir "${productName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            if (!userId) { 
              Alert.alert("Erro", "Usuário não identificado.");
              return;
            }
            try {
              const productToDelete = produtos.find(p => p.id === productId); 
              const updatedProdutos = produtos.filter(p => p.id !== productId);
              await AsyncStorage.setItem(PRODUTOS_ASYNC_KEY, JSON.stringify(updatedProdutos));
              setProdutos(updatedProdutos);
              Alert.alert("Sucesso", "Produto excluído!");
              setEditModalVisible(false); 

              if (productToDelete) {
                await logTransaction(userId, 'delete_product', {
                  productName: productToDelete.nome,
                  quantityRemoved: productToDelete.quantidade, 
                  productCategoryName: getCategoryName(productToDelete.categoriaId),
                  oldPrice: productToDelete.preco, 
                });
              }

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
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10, backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Estoque Atual</Text>
        <View style={styles.spacer} />
      </View>

      <View style={styles.container}>
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
