// utils/transactionLogger.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

export type TransactionType =
  'add_category' | 'delete_category' |
  'add_product' | 'edit_product' | 'delete_product' |
  'change_password' | 'logout' | 'edit_profile'; // 'edit_profile' já deveria estar aqui

export interface TransactionDetails {
  categoryName?: string;
  productId?: string;
  productName?: string;
  quantityAdded?: number;
  quantityRemoved?: number;
  oldQuantity?: number;
  newQuantity?: number;
  oldPrice?: number;
  newPrice?: number;
  productCategoryName?: string;
  
  // --- NOVAS PROPRIEDADES PARA DETALHES DO PERFIL ---
  oldFirstName?: string | null;
  newFirstName?: string | null;
  oldLastName?: string | null;
  newLastName?: string | null;
  oldCompanyName?: string | null;
  newCompanyName?: string | null;
  // --- FIM NOVAS PROPRIEDADES ---
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  timestamp: string; // ISO string for date and time
  details?: TransactionDetails;
}

const TRANSACTION_HISTORY_KEY_PREFIX = 'user_';

const getTransactionKey = (userId: string): string => {
  return `${TRANSACTION_HISTORY_KEY_PREFIX}${userId}_transactions`;
};

export const logTransaction = async (userId: string, type: TransactionType, details?: TransactionDetails) => {
  if (!userId) {
    console.warn("Tentativa de logar transação sem userId. Ignorando.");
    return;
  }

  const transactionKey = getTransactionKey(userId);
  
  try {
    const storedHistory = await AsyncStorage.getItem(transactionKey);
    const history: Transaction[] = storedHistory ? JSON.parse(storedHistory) : [];

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      userId: userId,
      type: type,
      timestamp: new Date().toISOString(),
      details: details,
    };

    history.unshift(newTransaction);
    const limitedHistory = history.slice(0, 200);

    await AsyncStorage.setItem(transactionKey, JSON.stringify(limitedHistory));
    console.log(`Transação logada: ${type} para ${userId}`);
  } catch (e) {
    console.error("Erro ao logar transação no AsyncStorage:", e);
  }
};

export const loadTransactionHistory = async (userId: string): Promise<Transaction[]> => {
  if (!userId) {
    return [];
  }
  const transactionKey = getTransactionKey(userId);
  try {
    const storedHistory = await AsyncStorage.getItem(transactionKey);
    return storedHistory ? JSON.parse(storedHistory) : [];
  } catch (e) {
    console.error("Erro ao carregar histórico de transações:", e);
    return [];
  }
};