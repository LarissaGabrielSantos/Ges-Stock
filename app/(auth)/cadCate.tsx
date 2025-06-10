
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@clerk/clerk-expo";
// REMOVER ScrollView aqui: Já que FlatList fará o scroll principal
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native'; 
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants'; 

// Tipagem para a categoria (para Async Storage)
interface Categoria {
  id: string;
  nome: string;
  userId: string;
}

export default function CadastroCategoria() {
  const { userId, isLoaded } = useAuth();
  const [categoria, setCategoria] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);

  const CATEGORIAS_KEY = `user_${userId}_categorias`;

  const loadCategorias = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const storedCategorias = await AsyncStorage.getItem(CATEGORIAS_KEY);
      if (storedCategorias) {
        setCategorias(JSON.parse(storedCategorias));
      }
    } catch (e) {
      console.error("Erro ao carregar categorias do Async Storage:", e);
      Alert.alert("Erro", "Não foi possível carregar as categorias salvas.");
    } finally {
      setLoading(false);
    }
  }, [userId, CATEGORIAS_KEY]);

  useEffect(() => {
    if (isLoaded && userId) {
      loadCategorias();
    } else if (isLoaded && !userId) {
      setLoading(false);
      Alert.alert("Erro de Autenticação", "Você precisa estar logado para gerenciar categorias.");
    }
  }, [isLoaded, userId, loadCategorias]);

  const adicionarCategoria = async () => {
    if (!categoria.trim()) {
      Alert.alert("Erro", "Por favor, digite o nome da categoria.");
      return;
    }
    if (!userId) {
      Alert.alert("Erro", "Usuário não identificado. Tente novamente.");
      return;
    }

    setAddingCategory(true);
    try {
      const newCategoria: Categoria = {
        id: Date.now().toString(),
        nome: categoria.trim(),
        userId: userId,
      };

      const updatedCategorias = [...categorias, newCategoria];
      await AsyncStorage.setItem(CATEGORIAS_KEY, JSON.stringify(updatedCategorias));
      setCategorias(updatedCategorias);
      setCategoria('');
      Alert.alert("Sucesso", "Categoria adicionada!");
    } catch (e) {
      console.error("Erro ao adicionar categoria no Async Storage:", e);
      Alert.alert("Erro", "Não foi possível adicionar a categoria.");
    } finally {
      setAddingCategory(false);
    }
  };

  const deletarCategoria = async (id: string, nome: string) => {
    Alert.alert(
      "Confirmar Exclusão",
      `Tem certeza que deseja excluir a categoria "${nome}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          onPress: async () => {
            try {
              const updatedCategorias = categorias.filter(cat => cat.id !== id);
              await AsyncStorage.setItem(CATEGORIAS_KEY, JSON.stringify(updatedCategorias));
              setCategorias(updatedCategorias);
              Alert.alert("Sucesso", "Categoria excluída!");
            } catch (e) {
              console.error("Erro ao deletar categoria do Async Storage:", e);
              Alert.alert("Erro", "Não foi possível excluir a categoria.");
            }
          },
        },
      ]
    );
  };

  // --- COMPONENTE DE HEADER DA LISTA ---
  // Este View conterá todo o conteúdo que antes estava ANTES da FlatList
  const ListHeader = () => (
    <View style={styles.listHeaderContainer}> {/* Novo container para o header da lista */}
      <Text
        style={[
          styles.headerText,
          { paddingTop: (Constants.statusBarHeight || 0) + 10 }
        ]}
      >
        Cadastrar Categoria
      </Text>
      <TextInput
        placeholder="Nome da categoria"
        style={styles.input}
        value={categoria}
        onChangeText={setCategoria}
      />
      <TouchableOpacity style={[styles.button, addingCategory && styles.buttonDisabled]} onPress={adicionarCategoria} disabled={addingCategory}>
        {addingCategory ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Adicionar</Text>
        )}
      </TouchableOpacity>
    </View>
  );
  // --- FIM DO COMPONENTE DE HEADER DA LISTA ---


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38a69d" />
        <Text>Carregando categorias...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* A FlatList AGORA é o componente de rolagem principal */}
      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.nome}</Text>
            <TouchableOpacity onPress={() => deletarCategoria(item.id, item.nome)}>
              <MaterialIcons name="delete" size={24} color="red" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={() => (
          <Text style={styles.emptyListText}>Nenhuma categoria cadastrada ainda.</Text>
        )}
        // Adicione o ListHeaderComponent aqui
        ListHeaderComponent={ListHeader}
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
  flatListContentContainer: { // Novo estilo para o contentContainerStyle da FlatList
    paddingHorizontal: 20, // Mantém o padding horizontal
    paddingBottom: 20, // Mantém o padding inferior
    flexGrow: 1, // Permite que a lista ocupe todo o espaço disponível
  },
  listHeaderContainer: { // NOVO estilo para o container do cabeçalho da lista
    // Nenhum padding horizontal aqui, pois flatListContentContainer já tem
    marginBottom: 20, // Espaço entre o header e a lista
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20, // Espaço abaixo do texto do header
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
  },
  button: {
    backgroundColor: '#38a69d',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
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
  card: {
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
  emptyListText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
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
    flex: 1,
  }
});