// ARQUIVO exportData.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, ScrollView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // MaterialCommunityIcons para ícone de PDF
import Constants from 'expo-constants'; // Certifique-se de ter 'expo install expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print'; // expo install expo-print
import * as Sharing from 'expo-sharing'; // expo install expo-sharing
import { useAuth } from '@clerk/clerk-expo'; // Para obter o userId do Clerk

// Tipagens para Categoria e Produto (devem ser consistentes em todo o app)
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

// Funções de formatação de moeda (copiadas de outras telas para reusabilidade)
const formatCentsToCurrency = (cents: number): string => {
  if (isNaN(cents) || cents < 0) { return "$0.00"; }
  const actualCents = Math.round(Math.max(0, cents));
  const str = String(actualCents).padStart(3, '0');
  return `$${str.slice(0, -2)}.${str.slice(-2)}`;
};

const formatPriceForDisplay = (price: number): string => { // Helper para formatar o preço float para exibição
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
};


// Função para construir o HTML do relatório PDF
const buildStockHtml = (products: Produto[], categories: Categoria[]): string => {
    let categoriesHtml = '';
    let uncategorizedProductsHtml = '';
    let totalProductsCount = 0;
    let totalStockValue = 0;

    // Mapeia categorias para um objeto para acesso rápido (nome da categoria pelo ID)
    const categoryMap = new Map<string, string>();
    categories.forEach(cat => categoryMap.set(cat.id, cat.nome));

    // Agrupa produtos por categoria (e sem categoria)
    const productsByCategory = new Map<string, Produto[]>();
    products.forEach(p => {
        const categoryKey = p.categoriaId || 'uncategorized'; // Usa 'uncategorized' para produtos sem categoria
        if (!productsByCategory.has(categoryKey)) {
            productsByCategory.set(categoryKey, []);
        }
        productsByCategory.get(categoryKey)?.push(p);
        totalProductsCount += p.quantidade;
        totalStockValue += p.quantidade * p.preco;
    });

    // Ordena categorias por nome para exibição no relatório
    const sortedCategories = [...categories].sort((a, b) => a.nome.localeCompare(b.nome));

    // Constrói o HTML para produtos por categoria
    sortedCategories.forEach(cat => {
        const catProducts = productsByCategory.get(cat.id);
        if (catProducts && catProducts.length > 0) {
            categoriesHtml += `<div class="category-header">Categoria: ${cat.nome}</div>`;
            categoriesHtml += '<table>';
            categoriesHtml += '<tr><th>Nome</th><th>Quantidade</th><th>Preço Unit.</th><th>Subtotal</th></tr>';
            catProducts.forEach(p => {
                const subtotal = p.quantidade * p.preco;
                categoriesHtml += `<tr>
                    <td>${p.nome}</td>
                    <td>${p.quantidade}</td>
                    <td>${formatPriceForDisplay(p.preco)}</td>
                    <td>${formatPriceForDisplay(subtotal)}</td>
                </tr>`;
            });
            categoriesHtml += '</table>';
        }
    });

    // Constrói o HTML para produtos sem categoria
    const uncategorized = productsByCategory.get('uncategorized');
    if (uncategorized && uncategorized.length > 0) {
        uncategorizedProductsHtml += '<h2>Produtos Sem Categoria</h2>';
        uncategorizedProductsHtml += '<table>';
        uncategorizedProductsHtml += '<tr><th>Nome</th><th>Quantidade</th><th>Preço Unit.</th><th>Subtotal</th></tr>';
        uncategorized.forEach(p => {
            const subtotal = p.quantidade * p.preco;
            uncategorizedProductsHtml += `<tr>
                <td>${p.nome}</td>
                <td>${p.quantidade}</td>
                <td>${formatPriceForDisplay(p.preco)}</td>
                <td>${formatPriceForDisplay(subtotal)}</td>
            </tr>`;
        });
        uncategorizedProductsHtml += '</table>';
    }

    // Estrutura HTML completa do relatório
    const htmlFullContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Estoque</title>
            <style>
                body { font-family: 'Helvetica Neue', 'Helvetica', Arial, sans-serif; margin: 20px; color: #333; }
                h1 { color: #38a69d; text-align: center; margin-bottom: 20px; }
                h2 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px; color: #555; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; font-weight: bold; }
                .total-row td { font-weight: bold; background-color: #e6f7ff; }
                .category-header { background-color: #e0f2f1; padding: 8px; margin-top: 15px; margin-bottom: 5px; border-radius: 4px; font-weight: bold; color: #38a69d; }
                .summary { margin-top: 40px; border-top: 1px solid #ccc; padding-top: 20px; }
                .summary-item { margin-bottom: 5px; font-size: 16px; }
            </style>
        </head>
        <body>
            <h1>Relatório de Estoque - GES Stock</h1>
            <p>Data de Geração: ${new Date().toLocaleDateString('pt-BR')}</p>

            <h2>Resumo Geral</h2>
            <table>
                <tr><th>Total de Itens em Estoque</th><th>Valor Total Estimado</th></tr>
                <tr><td>${totalProductsCount}</td><td>${formatPriceForDisplay(totalStockValue)}</td></tr>
            </table>

            ${categoriesHtml}

            ${uncategorizedProductsHtml}

            <div class="summary">
                <p class="summary-item">Relatório gerado pelo aplicativo GES Stock. Todos os dados são locais e dependem dos registros do usuário.</p>
                <p class="summary-item">Desenvolvido como Projeto de Extensão Universitária.</p>
                <p class="summary-item">Desenvolvedor: [Seu Nome ou Nome da Equipe]</p>
            </div>
        </body>
        </html>
    `;
    return htmlFullContent;
};


export default function ExportDataScreen() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [products, setProducts] = useState<Produto[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);

  const PRODUTOS_ASYNC_KEY = `user_${userId}_produtos`;
  const CATEGORIAS_ASYNC_KEY = `user_${userId}_categorias`;

  // Função para carregar produtos e categorias do Async Storage
  const loadInventoryData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const storedProducts = await AsyncStorage.getItem(PRODUTOS_ASYNC_KEY);
      const storedCategories = await AsyncStorage.getItem(CATEGORIAS_ASYNC_KEY);

      if (storedProducts) setProducts(JSON.parse(storedProducts));
      if (storedCategories) setCategories(JSON.parse(storedCategories));

    } catch (e) {
      console.error("Erro ao carregar dados para exportação:", e);
      Alert.alert("Erro", "Não foi possível carregar os dados para gerar o relatório.");
    } finally {
      setLoading(false);
    }
  }, [userId, PRODUTOS_ASYNC_KEY, CATEGORIAS_ASYNC_KEY]);

  useEffect(() => {
    if (isLoaded && userId) {
      loadInventoryData();
    } else if (isLoaded && !userId) {
      Alert.alert("Erro", "Você precisa estar logado para exportar dados.");
      router.back(); // Volta para a tela anterior se não estiver logado
    }
  }, [isLoaded, userId, loadInventoryData, router]);

  const generateAndSharePdf = async () => {
    setIsGeneratingPdf(true);
    try {
      // Gera o conteúdo HTML
      const html = buildStockHtml(products, categories);

      // Gera o PDF a partir do HTML
      const { uri } = await Print.printToFileAsync({ html: html });

      if (uri) {
        // Compartilha o PDF
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
          Alert.alert("Sucesso", "Relatório PDF gerado e pronto para compartilhar!");
        } else {
          Alert.alert("Sucesso", "Relatório PDF gerado! Compartilhamento não disponível no seu dispositivo.");
          console.log('Sharing not available on this platform.');
        }
      } else {
        Alert.alert("Erro", "Não foi possível gerar o arquivo PDF.");
      }

    } catch (error: any) {
      console.error("Erro ao gerar/compartilhar PDF:", error);
      Alert.alert("Erro", `Ocorreu um erro ao gerar o relatório PDF: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38a69d" />
        <Text style={styles.loadingText}>Carregando dados para exportação...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header Customizado */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10 }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exportar Dados</Text>
          <View style={styles.spacer} /> {/* Espaçador para centralizar o título */}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.sectionTitle}>Relatório de Estoque em PDF</Text>
          <Text style={styles.bodyText}>
            Clique no botão abaixo para gerar um relatório completo do seu estoque atual em formato PDF.
            O relatório incluirá todos os produtos, suas quantidades, preços e categorias associadas.
          </Text>

          {/* Seção para mostrar resumo de dados ou mensagem de vazio */}
          {products.length === 0 && categories.length === 0 ? (
            <Text style={styles.emptyDataText}>Nenhum produto ou categoria cadastrado para exportação.</Text>
          ) : (
            <>
              <Text style={styles.dataSummary}>
                Produtos Cadastrados: <Text style={styles.boldText}>{products.length}</Text>
              </Text>
              <Text style={styles.dataSummary}>
                Categorias Cadastradas: <Text style={styles.boldText}>{categories.length}</Text>
              </Text>
              <TouchableOpacity
                style={[styles.button, isGeneratingPdf && styles.buttonDisabled]}
                onPress={generateAndSharePdf}
                disabled={isGeneratingPdf}
              >
                {isGeneratingPdf ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="document-text-outline" size={24} color="#fff" style={styles.buttonIcon} /> {/* Ícone para PDF */}
                    <Text style={styles.buttonText}>Gerar e Compartilhar PDF</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}

          <Text style={styles.noteText}>
            Atenção: Os dados exportados são os que estão salvos localmente no seu dispositivo.
            Para imprimir, utilize a opção de compartilhamento e selecione uma impressora.
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
    flex: 1, // Para centralizar o título
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
    marginBottom: 10,
  },
  dataSummary: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  emptyDataText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#38a69d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
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
  buttonIcon: { // Estilo para o ícone no botão
    marginRight: 8, // Espaço entre o ícone e o texto
  },
  noteText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});