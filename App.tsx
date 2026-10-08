import React from 'react';
import { LogBox, StyleSheet, View } from 'react-native';
import AppProviders from './src/app/providers/AppProviders';
import RootNavigator from './src/app/navigation/RootNavigator';
import { NetworkErrorScreen } from './src/features/network/screens/NetworkErrorScreen';
import { useNetwork } from './src/services/network/NetworkContext';

LogBox.ignoreAllLogs(true);

const AppContent: React.FC = () => {
  const { isOffline, checkConnectivity } = useNetwork();

  return (
    <View style={styles.container}>
      <RootNavigator />
      {isOffline && (
        <View style={styles.networkErrorOverlay}>
          <NetworkErrorScreen onRetry={checkConnectivity} />
        </View>
      )}
    </View>
  );
};

export default function App() {
  return (
    <AppProviders>
      <AppContent />
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  networkErrorOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 999999,
    elevation: 999999,
  },
});

