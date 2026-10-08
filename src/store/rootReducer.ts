import { combineReducers } from '@reduxjs/toolkit';
import cartReducer from '../features/cart/store/cartSlice';
import checkoutReducer from '../features/checkout/store/checkoutSlice';
import orderReducer from '../features/order/store/orderSlice';

/**
 * Root Reducer
 * ONLY Client/Application State lives here (Cart, Checkout, Order Tracking, Local UI).
 * Server state (Products, search results, pagination, API errors) is strictly
 * owned by TanStack React Query.
 */
export const rootReducer = combineReducers({
  cart: cartReducer,
  checkout: checkoutReducer,
  order: orderReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
