import { createSelector } from '@reduxjs/toolkit';
import type { CartState } from './cartTypes';
import {
  calculateDeliveryFee,
  calculateOrderTotal,
  calculateSubtotal,
  calculateTax,
} from '../../../utils/pricing';

// Define a minimal root state interface that holds cart
export interface HasCartState {
  cart: CartState;
}

export const selectCartState = (state: HasCartState) => state.cart;

export const selectCartItems = createSelector(
  [selectCartState],
  (cart) => (cart && Array.isArray(cart.items) ? cart.items : []),
);

export const selectCartItemCount = createSelector(
  [selectCartItems],
  (items) => items.reduce((total, item) => total + item.quantity, 0),
);

export const selectCartSubtotal = createSelector(
  [selectCartItems],
  (items) => calculateSubtotal(items),
);

export const selectDeliveryFee = createSelector(
  [selectCartSubtotal],
  (subtotal) => calculateDeliveryFee(subtotal),
);

export const selectCartTax = createSelector(
  [selectCartSubtotal],
  (subtotal) => calculateTax(subtotal),
);

export const selectCartTotal = createSelector(
  [selectCartSubtotal, selectDeliveryFee, selectCartTax],
  (subtotal, deliveryFee, tax) => calculateOrderTotal(subtotal, deliveryFee, tax),
);

export const selectItemQuantity = (productId: number) =>
  createSelector([selectCartItems], (items) => {
    const item = items.find((cartItem) => cartItem.productId === productId);
    return item ? item.quantity : 0;
  });
