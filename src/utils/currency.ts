/**
 * Pure Currency Formatting Utilities
 * Eliminates repetitive inline string interpolations across components.
 */

/**
 * Formats a numeric value into a USD currency string ($X.XX)
 * @param amount - Number to format
 * @returns Formatted currency string (e.g., "$19.99")
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  return `$${amount.toFixed(2)}`;
};

/**
 * Formats a discount percentage
 * @param percentage - Discount percentage number
 * @returns Formatted discount string (e.g., "15% OFF")
 */
export const formatDiscount = (percentage: number | null | undefined): string => {
  if (!percentage || percentage <= 0) return '';
  return `${Math.round(percentage)}% OFF`;
};
