import { createSelector } from '@reduxjs/toolkit';
import type { CheckoutState } from './checkoutTypes';

export interface HasCheckoutState {
  checkout: CheckoutState;
}

export const selectCheckoutState = (state: HasCheckoutState) => state.checkout;

export const selectShippingAddress = createSelector(
  [selectCheckoutState],
  (checkout) => checkout.shippingAddress,
);

export const selectPaymentMethod = createSelector(
  [selectCheckoutState],
  (checkout) => checkout.paymentMethod,
);

export const selectDeliveryInstructions = createSelector(
  [selectCheckoutState],
  (checkout) => checkout.deliveryInstructions,
);

export const selectLastOrder = createSelector(
  [selectCheckoutState],
  (checkout) => checkout.lastOrder,
);
