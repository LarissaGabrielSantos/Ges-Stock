// ARQUIVO gerarQrCode.tsx

import React, { useState, useEffect, useCallback } from 'react';
// REMOVER ScrollView daqui: FlatList fará o scroll principal
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar, FlatList, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QRCode from 'react-native-qrcode-svg'; // Importar QRCode
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as MailComposer from 'expo-mail-composer';
import { useAuth, useUser } from '@clerk/clerk-expo';

// Tipagens (devem ser consistentes em todo o app)
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

// Funções de formatação (copiadas de outras telas)
const formatPriceForDisplay = (price: number): string => {
  return `R$ ${price.toFixed(2).replace('.', ',')}`;
};

// Funções para gerar QR Code (internamente)
const generateQrCodeData = (product: Produto) => {
  return JSON.stringify({
    id: product.id,
    nome: product.nome,
    qtde: product.quantidade,
    preco: product.preco,
    categoriaId: product.categoriaId,
    userId: product.userId,
  });
};

export default function GerarQrCodeScreen() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Produto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);

  const PRODUTOS_ASYNC_KEY = `user_${userId}_produtos`;
  const CATEGORIAS_ASYNC_KEY = `user_${userId}_categorias`;

  const loadData = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    setLoading(true);
    try {
      const storedProducts = await AsyncStorage.getItem(PRODUTOS_ASYNC_KEY);
      const storedCategories = await AsyncStorage.getItem(CATEGORIAS_ASYNC_KEY);
      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedCategories) setCategories(JSON.parse(storedCategories));
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
      Alert.alert("Erro", "Não foi possível carregar os dados do estoque.");
    } finally {
      setLoading(false);
    }
  }, [userId, PRODUTOS_ASYNC_KEY, CATEGORIAS_ASYNC_KEY]);

  useEffect(() => {
    if (isLoaded && userId) { loadData(); }
    else if (isLoaded && !userId) { Alert.alert("Erro", "Você precisa estar logado."); router.back(); }
  }, [isLoaded, userId, loadData, router]);

  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) { newSet.delete(productId); }
      else { newSet.add(productId); }
      return newSet;
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nome : 'Sem Categoria';
  };

  const renderProductItem = ({ item }: { item: Produto }) => (
    <TouchableOpacity
      style={styles.productSelectItem}
      onPress={() => toggleProductSelection(item.id)}
    >
      <MaterialCommunityIcons
        name={selectedProductIds.has(item.id) ? "checkbox-marked" : "checkbox-blank-outline"}
        size={24}
        color={selectedProductIds.has(item.id) ? "#38a69d" : "#777"}
      />
      <View style={styles.productSelectInfo}>
        <Text style={styles.productSelectName}>{item.nome}</Text>
        <Text style={styles.productSelectDetails}>Qtde: {item.quantidade} | Preço: {formatPriceForDisplay(item.preco)}</Text>
        <Text style={styles.productSelectDetails}>Categoria: {getCategoryName(item.categoriaId)}</Text>
      </View>
    </TouchableOpacity>
  );

  const generateAndEmailLabels = async () => {
    if (isGenerating) return;
    if (selectedProductIds.size === 0) {
      Alert.alert("Selecione Produtos", "Por favor, selecione ao menos um produto para gerar as etiquetas.");
      return;
    }

    setIsGenerating(true);
    const selectedProducts = products.filter(p => selectedProductIds.has(p.id));
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    try {
      const productsWithLabelHtml = await Promise.all(selectedProducts.map(async (product) => {
        const qrData = generateQrCodeData(product);
        const base64PlaceholderImage = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"; // Um gif 1x1 transparente
        
        return `
          <div class="label-container">
            <div class="product-info">
              <p class="product-name">${product.nome}</p>
              <p class="product-details">Qtde: ${product.quantidade}</p>
              <p class="product-details">Preço: ${formatPriceForDisplay(product.preco)}</p>
            </div>
            <img class="qrcode-image" src="${base64PlaceholderImage}" alt="QR Code" />
            <p class="qr-data-text">${qrData.substring(0, 30)}...</p>
          </div>
        `;
      }));

      const finalHtmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Etiquetas de Estoque</title>
          <style>
            body { font-family: 'Arial', sans-serif; margin: 0; padding: 0; }
            .label-container {
              width: 2.5in; /* 2.5 polegadas */
              height: 1.5in; /* 1.5 polegadas */
              border: 1px solid #ccc;
              padding: 5px;
              margin: 5px;
              display: inline-block; /* Para colocar lado a lado */
              vertical-align: top;
              box-sizing: border-box;
              text-align: center;
              font-size: 10px;
              line-height: 1.2;
              overflow: hidden;
            }
            .product-name { font-weight: bold; margin-bottom: 2px; font-size: 1.1em; }
            .product-info p { margin: 0; padding: 0; }
            .qrcode-image {
              width: 1.2in; /* Tamanho do QR code */
              height: 1.2in;
              margin: 0 auto; /* Centraliza o QR code */
              background-color: #eee; /* Placeholder visual */
            }
            .qr-data-text { font-size: 0.8em; color: #555; margin-top: 5px; }
            @media print {
              .label-container { border: 1px solid #000; }
            }
          </style>
        </head>
        <body>
          ${productsWithLabelHtml.join('')}
        </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html: finalHtmlContent, width: 8.5 * 72, height: 11 * 72 }); // Padrão A4 em points

      if (uri) {
        const emailRecipient = userEmail || '';
        const canComposeMail = await MailComposer.isAvailableAsync();

        if (canComposeMail) {
          await MailComposer.composeAsync({
            recipients: [emailRecipient],
            subject: 'Etiquetas de Estoque - GES Stock',
            body: 'Segue em anexo as etiquetas de QR Code dos seus produtos.',
            attachments: [uri],
            isHtml: false,
          });
          Alert.alert("Sucesso", "E-mail com etiquetas pronto para enviar!");
        } else if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
          Alert.alert("Sucesso", "Etiquetas geradas! Compartilhe o PDF manualmente.");
        } else {
          Alert.alert("Erro", "Nenhum aplicativo de e-mail ou compartilhamento disponível.");
        }
      } else {
        Alert.alert("Erro", "Não foi possível gerar o arquivo PDF.");
      }

    } catch (error: any) {
      console.error("Erro ao gerar/enviar etiquetas:", error);
      Alert.alert("Erro", `Ocorreu um erro ao gerar as etiquetas: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38a69d" />
        <Text style={styles.loadingText}>Carregando produtos...</Text>
      </View>
    );
  }

  // --- COMPONENTE DE HEADER E CONTEÚDO ESTÁTICO DA LISTA ---
  // Este View conterá todo o conteúdo que antes estava ANTES da FlatList
  const ListHeader = () => (
    <View style={styles.listHeaderContainer}> {/* Novo container para o header da lista */}
      {/* Header Customizado */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gerar Etiquetas QR Code</Text>
        <View style={styles.spacer} /> {/* Espaçador para centralizar o título */}
      </View>

      <Text style={styles.sectionTitle}>Selecione Produtos para Etiqueta</Text>
      {products.length === 0 && (
        <Text style={styles.emptyListText}>Nenhum produto cadastrado para gerar etiquetas.</Text>
      )}
    </View>
  );
  // --- FIM DO COMPONENTE DE HEADER E CONTEÚDO ESTÁTICO DA LISTA ---


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* A FlatList AGORA é o componente de rolagem principal */}
      <FlatList
        data={products} // Renderiza todos os produtos para seleção
        keyExtractor={(item) => item.id}
        renderItem={renderProductItem}
        // Adicione o ListHeaderComponent aqui
        ListHeaderComponent={ListHeader}
        // Adicione o ListFooterComponent para o botão de gerar/enviar
        ListFooterComponent={() => (
          selectedProductIds.size > 0 ? (
            <TouchableOpacity
              style={[styles.generateButton, isGenerating && styles.generateButtonDisabled]}
              onPress={generateAndEmailLabels}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialCommunityIcons name="qrcode-scan" size={24} color="#fff" style={styles.buttonIcon} />
                  <Text style={styles.generateButtonText}>Gerar e Enviar Etiquetas ({selectedProductIds.size})</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null
        )}
        // Adicione estilo ao conteúdo geral da lista via contentContainerStyle
        contentContainerStyle={styles.flatListContentContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  container: { // Este container é apenas um placeholder se a FlatList for o principal
    flex: 1,
  },
  // Novo estilo para o contentContainerStyle da FlatList principal
  flatListContentContainer: {
    paddingHorizontal: 20, // Mantém o padding horizontal
    paddingBottom: 20, // Mantém o padding inferior (espaço para o botão gerar)
    flexGrow: 1, // Permite que a lista ocupe todo o espaço disponível
  },
  // NOVO ESTILO para o container do cabeçalho da lista
  listHeaderContainer: {
    marginBottom: 20, // Espaço entre o cabeçalho e a lista de produtos
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
    // paddingTop já é definido no componente
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  backButton: {
    padding: 5,
  },
  spacer: {
    width: 28, // Largura do ícone de voltar para simetria
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  emptyListText: { // <<-- AGORA USADO NO LISTHEADERCOMPONENT
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
    fontStyle: 'italic',
  },
  flatListContent: { // Este estilo será aplicado ao contentContainerStyle da FlatList
    paddingBottom: 20, // Espaço no final da lista
  },
  productSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
  },
  productSelectInfo: {
    marginLeft: 15,
    flex: 1,
  },
  productSelectName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  productSelectDetails: {
    fontSize: 14,
    color: '#555',
  },
  generateButton: {
    backgroundColor: '#38a69d',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 30, // Margem acima do botão
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  generateButtonDisabled: {
    backgroundColor: '#a0a0a0',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonIcon: {
    marginRight: 5,
  },
});