/**
 * Helper to parse Brazilian Boleto (Linha Digitável)
 * Returns the extracted value and due date if possible.
 */
export interface ParsedBoleto {
  amount: number | null;
  dueDate: string | null;
  type: 'banco' | 'concessionaria' | 'invalido';
  error?: string;
}

export const parseBoleto = (codigo: string): ParsedBoleto => {
  // Remove non-numeric characters
  const clean = codigo.replace(/\D/g, '');

  if (clean.length === 47) {
    // Bank Boleto (Boleto Bancário - 47 digits)
    try {
      // Amount is the last 10 digits
      const amountStr = clean.substring(37);
      const amountVal = parseInt(amountStr, 10) / 100;

      // Due Date Factor is 4 digits (from index 33 to 36)
      const factorStr = clean.substring(33, 37);
      const factor = parseInt(factorStr, 10);

      let dueDateStr: string | null = null;
      if (factor >= 1000) {
        // Base date is 1997-10-07
        const baseDate = new Date('1997-10-07T12:00:00Z');
        const dueDate = new Date(baseDate.getTime() + factor * 24 * 60 * 60 * 1000);
        dueDateStr = dueDate.toISOString().split('T')[0];
      }

      return {
        amount: amountVal > 0 ? amountVal : null,
        dueDate: dueDateStr,
        type: 'banco'
      };
    } catch (err) {
      return { amount: null, dueDate: null, type: 'banco', error: 'Erro ao processar boleto bancário.' };
    }
  } else if (clean.length === 48) {
    // Utility Bill (Concessionária - 48 digits, starts with 8)
    try {
      // Amount is usually from position 4 to 15 (11 digits)
      const amountStr = clean.substring(4, 15);
      const amountVal = parseInt(amountStr, 10) / 100;

      // Due date is not universally standard, but let's try to find a valid date segment (YYYYMMDD or DDMMYYYY)
      // Standard for concessionárias is to look for date at specific positions, but let's keep it null for manual entry
      // if not clear. We will return the amount and let user confirm date.
      return {
        amount: amountVal > 0 ? amountVal : null,
        dueDate: null,
        type: 'concessionaria'
      };
    } catch (err) {
      return { amount: null, dueDate: null, type: 'concessionaria', error: 'Erro ao processar boleto tributo/concessionária.' };
    }
  }

  return {
    amount: null,
    dueDate: null,
    type: 'invalido',
    error: 'Tamanho do código inválido. Boletos têm 47 ou 48 dígitos.'
  };
};
