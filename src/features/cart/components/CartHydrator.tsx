import React, { useEffect } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { setCartItems } from '../store/cartSlice';
import { CartItem } from '../store/cartTypes';
import { storage } from '../../../services/storage/storage';
import { CART_STORAGE_KEY } from '../../../store/store';
import { logger } from '../../../services/logger';

/**
 * CartHydrator
 * Automatically restores persisted cart state from AsyncStorage on app launch
 * so items and badge counts survive app restarts and process recreation.
 */
export const CartHydrator: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    storage
      .getItem<CartItem[]>(CART_STORAGE_KEY)
      .then((items: CartItem[] | null) => {
        if (items && Array.isArray(items) && items.length > 0) {
          dispatch(setCartItems(items));
          logger.info(
            `[CART PERSISTENCE] Successfully hydrated ${items.length} items from storage`,
          );
        }
      })
      .catch((err: unknown) => {
        logger.error('[CART PERSISTENCE] Error hydrating cart from storage', err);
      });
  }, [dispatch]);

  return <>{children}</>;
};

export default CartHydrator;
