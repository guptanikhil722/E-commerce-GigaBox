import React, { createContext, useContext, useEffect, useState } from 'react';
import { networkService } from './NetworkService';

export interface NetworkContextValue {
  isOnline: boolean;
  isOffline: boolean;
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  checkConnectivity: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextValue>({
  isOnline: true,
  isOffline: false,
  isConnected: true,
  isInternetReachable: true,
  checkConnectivity: async () => true,
});

export interface NetworkProviderProps {
  children: React.ReactNode;
}

/**
 * Global Network Provider
 * Centralized network connectivity provider powered by NetworkService.
 * Screens and components consume via useNetwork().
 */
export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(networkService.getIsOnline());
  const [isConnected, setIsConnected] = useState<boolean | null>(
    networkService.getIsConnected(),
  );
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(
    networkService.getIsInternetReachable(),
  );

  useEffect(() => {
    networkService.init();

    const unsubscribe = networkService.subscribe((online) => {
      setIsOnline(online);
      setIsConnected(networkService.getIsConnected());
      setIsInternetReachable(networkService.getIsInternetReachable());
    });

    return unsubscribe;
  }, []);

  const checkConnectivity = async (): Promise<boolean> => {
    const online = await networkService.checkConnectivity();
    setIsOnline(online);
    setIsConnected(networkService.getIsConnected());
    setIsInternetReachable(networkService.getIsInternetReachable());
    return online;
  };

  return (
    <NetworkContext.Provider
      value={{
        isOnline,
        isOffline: !isOnline,
        isConnected,
        isInternetReachable,
        checkConnectivity,
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = (): NetworkContextValue => {
  const context = useContext(NetworkContext);
  if (!context) {
    return {
      isOnline: true,
      isOffline: false,
      isConnected: true,
      isInternetReachable: true,
      checkConnectivity: async () => true,
    };
  }
  return context;
};

export default NetworkProvider;
