import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from './cartTypes';

const initialState: CartState = {
  items: [],
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        productId: number;
        title: string;
        price: number;
        thumbnail: string;
        quantity?: number;
        category?: string;
      }>,
    ) => {
      const { productId, title, price, thumbnail, quantity = 1, category } =
        action.payload;
      const validId = Number(productId);
      const validPrice = Number(price) || 0;
      const validQuantity = Math.max(1, Number(quantity) || 1);

      const existingItem = state.items.find(
        (item) => item.productId === validId,
      );

      if (existingItem) {
        existingItem.quantity += validQuantity;
      } else {
        state.items.push({
          productId: validId,
          title: title || 'Product',
          price: validPrice,
          thumbnail: thumbnail || '',
          quantity: validQuantity,
          category,
        });
      }
    },

    removeFromCart: (state, action: PayloadAction<number>) => {
      const validId = Number(action.payload);
      state.items = state.items.filter(
        (item) => item.productId !== validId,
      );
    },

    increaseQuantity: (state, action: PayloadAction<number>) => {
      const validId = Number(action.payload);
      const item = state.items.find(
        (cartItem) => cartItem.productId === validId,
      );
      if (item) {
        item.quantity += 1;
      }
    },

    decreaseQuantity: (state, action: PayloadAction<number>) => {
      const validId = Number(action.payload);
      const itemIndex = state.items.findIndex(
        (cartItem) => cartItem.productId === validId,
      );
      if (itemIndex >= 0) {
        const item = state.items[itemIndex];
        if (item.quantity > 1) {
          item.quantity -= 1;
        } else {
          state.items.splice(itemIndex, 1);
        }
      }
    },

    updateQuantity: (
      state,
      action: PayloadAction<{ productId: number; quantity: number }>,
    ) => {
      const { productId, quantity } = action.payload;
      const validId = Number(productId);
      const validQuantity = Number(quantity);
      const itemIndex = state.items.findIndex(
        (cartItem) => cartItem.productId === validId,
      );

      if (itemIndex >= 0) {
        if (validQuantity > 0) {
          state.items[itemIndex].quantity = validQuantity;
        } else {
          state.items.splice(itemIndex, 1);
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
    },

    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      if (Array.isArray(action.payload)) {
        state.items = action.payload;
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  updateQuantity,
  clearCart,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
