import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  CheckoutState,
  PaymentMethodType,
  PlacedOrder,
  ShippingAddress,
} from './checkoutTypes';

const initialAddress: ShippingAddress = {
  fullName: 'Alex Vance',
  street: '742 Evergreen Terrace, Suite 4B',
  city: 'Springfield',
  state: 'OR',
  zipCode: '97477',
};

const initialState: CheckoutState = {
  shippingAddress: initialAddress,
  paymentMethod: 'CARD',
  deliveryInstructions: 'Leave package at front porch or ring video bell.',
  lastOrder: null,
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setShippingAddress: (state, action: PayloadAction<ShippingAddress>) => {
      state.shippingAddress = action.payload;
    },
    setPaymentMethod: (state, action: PayloadAction<PaymentMethodType>) => {
      state.paymentMethod = action.payload;
    },
    setDeliveryInstructions: (state, action: PayloadAction<string>) => {
      state.deliveryInstructions = action.payload;
    },
    setOrderPlaced: (state, action: PayloadAction<PlacedOrder>) => {
      state.lastOrder = action.payload;
    },
    resetCheckout: (state) => {
      state.lastOrder = null;
    },
  },
});

export const {
  setShippingAddress,
  setPaymentMethod,
  setDeliveryInstructions,
  setOrderPlaced,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
