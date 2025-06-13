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