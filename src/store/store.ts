import { configureStore, Middleware } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import { logger } from '../services/logger';


import { storage } from '../services/storage';

export const CART_STORAGE_KEY = '@gigabox_cart_items';

const cartPersistenceMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  const result = next(action);
  // Persist to storage whenever a cart action changes cart items (except during hydration)
  if (
    typeof action?.type === 'string' &&
    action.type.startsWith('cart/') &&
    action.type !== 'cart/setCartItems'
  ) {
    const nextState: any = storeApi.getState();
    const items = nextState?.cart?.items;
    if (Array.isArray(items)) {
      logger.info(`[REDUX PERSISTENCE] Persisting ${items.length} items to ${CART_STORAGE_KEY}`);
      storage.setItem(CART_STORAGE_KEY, items).catch((err: unknown) => {
        logger.error('[REDUX] Failed to persist cart items to storage', err);
      });
    }
  }
  return result;
};

const actionLoggerMiddleware: Middleware = (storeApi) => (next) => (action: any) => {
  logger.info(`[REDUX ACTION] ${action?.type}`, action?.payload);
  const result = next(action);
  const nextState: any = storeApi.getState();
  logger.info(`[REDUX CART STATE] items count: ${nextState?.cart?.items?.length}`, nextState?.cart?.items);
  return result;
};

function createReduxStore() {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: true,
      }).concat(actionLoggerMiddleware, cartPersistenceMiddleware),
  });
}

export const store = createReduxStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;


