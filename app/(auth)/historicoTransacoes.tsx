// ARQUIVO historicoTransacoes.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; // Para ícones
import Constants from 'expo-constants';
import { useAuth } from '@clerk/clerk-expo';
import { useTheme } from '../../utils/context/themedContext';
import { loadTransactionHistory, Transaction } from '../../utils/transactionLogger'; // <-- Importar loadTransactionHistory e Transaction


export default function HistoricoTransacoesScreen() {
  const router = useRouter();
  const { userId, isLoaded } = useAuth();
  const { theme } = useTheme();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar o histórico de transações
  const fetchTransactionHistory = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const history = await loadTransactionHistory(userId);
      setTransactions(history);
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
      Alert.alert("Erro", "Não foi possível carregar o histórico de transações.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoaded && userId) {
      fetchTransactionHistory();
    } else if (isLoaded && !userId) {
      Alert.alert("Erro", "Você precisa estar logado para ver o histórico.");
      router.back();
    }
  }, [isLoaded, userId, fetchTransactionHistory, router]);

  // Renderiza cada item de transação na lista
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    const date = new Date(item.timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
    const time = new Date(item.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

    let description = '';
    let iconName: string = 'history'; // Ícone padrão
    let iconColor: string = theme.text; // Cor padrão do ícone

    switch (item.type) {
      case 'add_category':
        description = `Categoria "${item.details?.categoryName}" adicionada.`;
        iconName = 'shape-add';
        iconColor = theme.green;
        break;
      case 'delete_category':
        description = `Categoria "${item.details?.categoryName}" excluída.`;
        iconName = 'shape-remove';
        iconColor = theme.red;
        break;
      case 'add_product':
        description = `Produto "${item.details?.productName}" (${item.details?.quantityAdded} un.) adicionado na categoria "${item.details?.productCategoryName}".`;
        iconName = 'package-variant-plus';
        iconColor = theme.green;
        break;
      case 'edit_product':
        description = `Produto "${item.details?.productName}" editado.`;
        iconName = 'pencil';
        iconColor = theme.buttonPrimaryBg;
        // Detalhes extras se houver mudança de quantidade/preço
        if (item.details?.oldQuantity !== undefined && item.details?.newQuantity !== undefined) {
          description += ` Qtde: ${item.details.oldQuantity} -> ${item.details.newQuantity}.`;
        }
        if (item.details?.oldPrice !== undefined && item.details?.newPrice !== undefined) {
          description += ` Preço: ${item.details.oldPrice?.toFixed(2).replace('.', ',')} -> ${item.details.newPrice?.toFixed(2).replace('.', ',')}.`;
        }
        break;
      case 'delete_product':
        description = `Produto "${item.details?.productName}" (${item.details?.quantityRemoved} un.) excluído da categoria "${item.details?.productCategoryName}".`;
        iconName = 'package-variant-remove';
        iconColor = theme.red;
        break;
      case 'change_password':
        description = `Senha do perfil alterada.`;
        iconName = 'key-change';
        iconColor = theme.accent;
        break;
      case 'logout':
        description = `Logout realizado.`;
        iconName = 'logout';
        iconColor = theme.grayDark;
        break;
      default:
        description = `Transação desconhecida (${item.type}).`;
        iconName = 'alert-circle-outline';
        iconColor = theme.grayDark;
    }

    return (
      <View style={[styles.transactionCard, { backgroundColor: theme.cardBackground, borderColor: theme.cardBorder }]}>
        <MaterialCommunityIcons name={iconName as any} size={24} color={iconColor} style={styles.transactionIcon} />
        <View style={styles.transactionDetails}>
          <Text style={[styles.transactionDescription, { color: theme.text }]}>{description}</Text>
          <Text style={[styles.transactionTimestamp, { color: theme.grayDark }]}>{date} às {time}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.text} />
        <Text style={[styles.loadingText, { color: theme.text }]}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Header Customizado */}
        <View style={[styles.header, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : Constants.statusBarHeight + 10, backgroundColor: theme.cardBackground, borderBottomColor: theme.cardBorder }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={28} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Histórico de Transações</Text>
          <View style={styles.spacer} /> {/* Espaçador para centralizar o título */}
        </View>

        {/* Lista de Transações */}
        {transactions.length === 0 ? (
          <Text style={[styles.emptyListText, { color: theme.text }]}>Nenhuma transação registrada ainda.</Text>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransactionItem}
            contentContainerStyle={styles.flatListContentContainer}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
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
    // backgroundColor handled by theme
    borderBottomWidth: 1,
    // borderBottomColor handled by theme
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    // color handled by theme
  },
  backButton: {
    padding: 5,
  },
  spacer: {
    width: 28,
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
    fontStyle: 'italic',
  },
  flatListContentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    // backgroundColor and borderColor handled by theme
  },
  transactionIcon: {
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    marginBottom: 5,
    // color handled by theme
  },
  transactionTimestamp: {
    fontSize: 12,
    // color handled by theme (grayDark)
  },
});