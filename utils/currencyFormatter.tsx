// Converte um número inteiro (centavos) para uma string de moeda formatada ($X.XX)
const formatCentsToCurrency = (cents: number): string => {
  if (isNaN(cents) || cents < 0) {
    return "$0.00";
  }
  // Garante que o número seja inteiro e positivo
  const actualCents = Math.round(Math.max(0, cents));
  
  // Converte para string e preenche com zeros à esquerda para ter pelo menos 3 dígitos (para centavos)
  // Ex: 5 -> "005", 50 -> "050", 100 -> "100"
  const str = String(actualCents).padStart(3, '0');
  
  // Insere o ponto decimal duas posições antes do final
  // Ex: "005" -> "0.05", "050" -> "0.50", "100" -> "1.00", "12345" -> "123.45"
  const integerPart = str.slice(0, -2);
  const decimalPart = str.slice(-2);
  
  return `$${integerPart}.${decimalPart}`;
};

// Converte uma string de input (com ou sem símbolos, letras, etc.) para um número inteiro (centavos)
const parseCurrencyInputToCents = (text: string): number => {
  // Remove todos os caracteres que não são dígitos
  const cleanText = text.replace(/[^0-9]/g, '');
  
  // Se a string estiver vazia após a limpeza, retorna 0 centavos
  if (!cleanText) {
    return 0;
  }
  // Converte para inteiro. Ex: "100" -> 100, "12345" -> 12345
  return parseInt(cleanText, 10);
};