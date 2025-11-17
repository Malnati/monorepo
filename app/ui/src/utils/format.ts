// app/ui/src/utils/format.ts

/**
 * Formata um número removendo zeros à direita desnecessários e arredondando até 2 casas decimais
 * @param value - Número a ser formatado
 * @param maxFractionDigits - Número máximo de casas decimais (padrão: 2)
 * @returns String formatada sem zeros à direita, formato brasileiro (vírgula como separador decimal)
 */
export const formatNumber = (value: number | null | undefined | string, maxFractionDigits: number = 2): string => {
  // Validar valor antes de formatar
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  const numValue = Number(value);
  // Verificar se é um número válido e finito
  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0';
  }
  // Arredondar o valor antes de formatar
  const rounded = Number(numValue.toFixed(maxFractionDigits));
  return rounded.toLocaleString('pt-BR', {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  });
};

/**
 * Formata um número como moeda (R$) removendo zeros à direita desnecessários e arredondando até 2 casas decimais
 * @param value - Número a ser formatado
 * @param maxFractionDigits - Número máximo de casas decimais (padrão: 2)
 * @returns String formatada como moeda sem zeros à direita, formato brasileiro
 */
export const formatCurrency = (value: number | null | undefined | string, maxFractionDigits: number = 2): string => {
  // Validar valor antes de formatar
  if (value === null || value === undefined || value === '') {
    return 'R$ 0,00';
  }
  const numValue = Number(value);
  // Verificar se é um número válido e finito
  if (isNaN(numValue) || !isFinite(numValue)) {
    return 'R$ 0,00';
  }
  // Arredondar o valor antes de formatar
  const rounded = Number(numValue.toFixed(maxFractionDigits));
  return rounded.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  });
};

/**
 * Formata um número como moeda simples (sem símbolo R$) removendo zeros à direita e arredondando até 2 casas decimais
 * @param value - Número a ser formatado
 * @param maxFractionDigits - Número máximo de casas decimais (padrão: 2)
 * @returns String formatada sem símbolo de moeda e sem zeros à direita, formato brasileiro
 */
export const formatCurrencyValue = (value: number | null | undefined | string, maxFractionDigits: number = 2): string => {
  // Validar valor antes de formatar
  if (value === null || value === undefined || value === '') {
    return '0,00';
  }
  const numValue = Number(value);
  // Verificar se é um número válido e finito
  if (isNaN(numValue) || !isFinite(numValue)) {
    return '0,00';
  }
  // Arredondar o valor antes de formatar
  const rounded = Number(numValue.toFixed(maxFractionDigits));
  return rounded.toLocaleString('pt-BR', {
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  });
};

/**
 * Formata uma data para o formato brasileiro (DD/MM/YYYY)
 * @param value - Data a ser formatada (string ISO, Date ou timestamp)
 * @returns String formatada no padrão brasileiro ou string vazia se inválida
 */
export const formatDate = (value: string | Date | null | undefined): string => {
  if (!value) {
    return '';
  }
  
  try {
    const date = typeof value === 'string' ? new Date(value) : value;
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

