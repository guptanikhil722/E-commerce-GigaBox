import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './navigationTypes';
import CatalogScreen from '../../features/catalog/screens/CatalogScreen';
import ProductDetailsScreen from '../../features/catalog/screens/ProductDetailsScreen';
import CartScreen from '../../features/cart/screens/CartScreen';
import CheckoutScreen from '../../features/checkout/screens/CheckoutScreen';
import TrackingScreen from '../../features/order/screens/TrackingScreen';
import NetworkErrorScreen from '../../features/network/screens/NetworkErrorScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Catalog"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        orientation: 'portrait',
      }}
    >
      <Stack.Screen name="Catalog" component={CatalogScreen} />
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Tracking"
        component={TrackingScreen}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="NetworkError"
        component={NetworkErrorScreen}
        options={{ animation: 'fade' }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
