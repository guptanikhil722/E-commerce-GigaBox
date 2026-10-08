import React from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { store } from '../../store';
import { queryClient } from '../../services/query';
import { ThemeProvider } from '../../theme';
import { NetworkProvider } from '../../services/network';
import CartHydrator from '../../features/cart/components/CartHydrator';

export interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * Centralized Application Providers
 * Combines Redux Provider (Client State), Cart Hydration, Network Provider (Connectivity),
 * React Query Client (Server State), Theme Context, and Safe Area Providers.
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <Provider store={store}>
      <CartHydrator>
        <SafeAreaProvider>
          <NetworkProvider>
            <QueryClientProvider client={queryClient}>
              <ThemeProvider initialMode="light">{children}</ThemeProvider>
            </QueryClientProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </CartHydrator>
    </Provider>
  );
};

export default AppProviders;
