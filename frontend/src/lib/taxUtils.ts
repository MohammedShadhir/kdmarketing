
export const TAX_RATES: Record<string, number> = {
  'buffalo': 8.75,
  'rochester': 8,
  'syracuse': 8,
  'albany': 8,
};

export function getTaxPercentageByCity(city?: string): number {
  if (!city) return 0;

  const normalizedCity = city.toLowerCase().trim();
  return TAX_RATES[normalizedCity] || 0;
}

export function calculateTaxAmount(amount: number, taxPercentage: number): number {
  if (!amount || !taxPercentage) return 0;
  return Math.round((amount * (taxPercentage / 100)) * 100) / 100;
}

export function calculateTotalWithTax(amount: number, taxPercentage: number): number {
  const taxAmount = calculateTaxAmount(amount, taxPercentage);
  return Math.round((amount + taxAmount) * 100) / 100;
}

export function formatTaxPercentage(percentage: number): string {
  return `${percentage}%`;
}
