/**
 * Pure Pricing Calculation Utilities
 * Centralizes all commerce and checkout financial arithmetic.
 */

export const FREE_DELIVERY_THRESHOLD = 300;
export const STANDARD_DELIVERY_FEE = 15.0;
export const TAX_RATE = 0.08; // 8% sales tax

/**
 * Calculates item subtotal
 */
export const calculateItemTotal = (price: number, quantity: number): number => {
  const p = Math.max(0, Number(price) || 0);
  const q = Math.max(0, Number(quantity) || 0);
  return Math.round(p * q * 100) / 100;
};

/**
 * Calculates cart subtotal from items
 */
export const calculateSubtotal = (
  items: Array<{ price: number; quantity: number }>,
): number => {
  if (!Array.isArray(items) || items.length === 0) return 0;
  const rawSum = items.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 0),
    0,
  );
  return Math.round(rawSum * 100) / 100;
};

/**
 * Calculates dynamic delivery fee based on order subtotal
 */
export const calculateDeliveryFee = (subtotal: number): number => {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : STANDARD_DELIVERY_FEE;
};

/**
 * Calculates applicable sales tax
 */
export const calculateTax = (subtotal: number, rate: number = TAX_RATE): number => {
  if (subtotal <= 0) return 0;
  return Math.round(subtotal * rate * 100) / 100;
};

/**
 * Calculates final order total
 */
export const calculateOrderTotal = (
  subtotal: number,
  deliveryFee: number,
  tax: number,
): number => {
  if (subtotal <= 0) return 0;
  return Math.round((subtotal + deliveryFee + tax) * 100) / 100;
};
