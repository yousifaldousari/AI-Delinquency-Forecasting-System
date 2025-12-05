/**
 * Format number as Indonesian Rupiah (IDR)
 * @param value - The numeric value to format
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string with IDR currency symbol
 */
export const formatIDR = (value: number, decimals: number = 0): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Format number as IDR with compact notation (K, M, B)
 * @param value - The numeric value to format
 * @returns Formatted string with IDR and compact notation
 */
export const formatIDRCompact = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `Rp ${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `Rp ${(value / 1_000).toFixed(1)}K`;
  }
  return `Rp ${value.toFixed(0)}`;
};

/**
 * Format percentage value
 * @param value - The percentage value (0-1 or 0-100)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  // If value is between 0 and 1, multiply by 100
  const percentage = value <= 1 ? value * 100 : value;
  return `${percentage.toFixed(decimals)}%`;
};
