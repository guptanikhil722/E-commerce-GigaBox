import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../../theme';
import { moderateScale } from '../../../utils/responsive';
import { OptimizedList } from '../../../components/common/OptimizedList';
import { LoadingView } from '../../../components/common/LoadingView';
import { ErrorView } from '../../../components/common/ErrorView';
import { EmptyView } from '../../../components/common/EmptyView';
import { ProductCard } from './ProductCard';
import { useNetwork } from '../../../services/network/NetworkContext';
import type { Product } from '../types';

export interface ProductGridProps {
  products: Product[];
  onSelectProduct: (id: number) => void;
  loading?: boolean;
  error?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  onClearFilters?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  ListHeaderComponent?: React.ReactElement;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  onSelectProduct,
  loading = false,
  error = false,
  errorMessage,
  onRetry,
  onClearFilters,
  refreshing = false,
  onRefresh,
  onEndReached,
  onEndReachedThreshold = 0.4,
  isFetchingNextPage = false,
  hasNextPage = false,
  ListHeaderComponent,
}) => {
  const { theme } = useTheme();
  const { isOffline } = useNetwork();

  // Guard ref against duplicate rapid onEndReached calls
  const isPaginatingRef = useRef(false);

  const handleEndReached = useCallback(() => {
    if (isFetchingNextPage || !hasNextPage || isPaginatingRef.current) return;
    isPaginatingRef.current = true;
    onEndReached?.();
    setTimeout(() => {
      isPaginatingRef.current = false;
    }, 500);
  }, [isFetchingNextPage, hasNextPage, onEndReached]);

  // Stable keyExtractor using unique product ID
  const keyExtractor = useCallback((item: Product) => String(item.id), []);

  // Stable memoized renderItem callback
  const renderItem = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        product={item}
        onPress={onSelectProduct}
      />
    ),
    [onSelectProduct],
  );

  if (loading && products.length === 0) {
    return (
      <View style={styles.stateWrapper}>
        {ListHeaderComponent}
        <LoadingView message="Fetching best products for you..." />
      </View>
    );
  }

  if (error && products.length === 0) {
    return (
      <View style={styles.stateWrapper}>
        {ListHeaderComponent}
        <ErrorView
          title={isOffline ? "You're Offline" : 'Could not load catalog'}
          message={
            errorMessage ||
            (isOffline
              ? 'No cached products available yet. Reconnect to internet to load catalog.'
              : 'We encountered an issue fetching the latest product catalog.')
          }
          onRetry={onRetry}
          retryText={isOffline ? 'Retry Connection' : 'Reload Catalog'}
        />
      </View>
    );
  }

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator
            size="small"
            color={theme.colors.primary}
            style={styles.loaderIndicator}
          />
          <Text
            style={[
              styles.footerText,
              {
                color: theme.colors.textMuted,
                fontSize: theme.fontSize.caption + moderateScale(3),
              },
            ]}
          >
            Loading more products...
          </Text>
        </View>
      );
    }

    if (!hasNextPage && products.length > 6) {
      return (
        <View style={styles.footerLoader}>
          <Text
            style={[
              styles.footerText,
              {
                color: theme.colors.textMuted,
                fontSize: theme.fontSize.caption + moderateScale(3),
              },
            ]}
          >
            You've viewed all available products
          </Text>
        </View>
      );
    }

    return undefined;
  };

  return (
    <OptimizedList<Product>
      data={products}
      keyExtractor={keyExtractor}
      numColumns={2}
      initialNumToRender={8}
      maxToRenderPerBatch={6}
      windowSize={7}
      updateCellsBatchingPeriod={50}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={renderFooter()}
      contentContainerStyle={styles.listContainer}
      columnWrapperStyle={styles.columnWrapper}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshing={refreshing}
      onRefresh={onRefresh}
      onEndReached={handleEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      renderItem={renderItem}
      ListEmptyComponent={
        <EmptyView
          icon={isOffline ? '⚡' : '📦'}
          title={isOffline ? 'No Offline Results' : 'No Products Found'}
          message={
            isOffline
              ? 'This search query is not available in offline cache. Clear search to view cached products.'
              : 'Try adjusting your search query or selecting a different category.'
          }
          actionText={onClearFilters ? (isOffline ? 'View Cached Products' : 'Reset Filters') : undefined}
          onAction={onClearFilters}
        />
      }
    />
  );
};

const styles = StyleSheet.create({
  stateWrapper: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: moderateScale(10),
    paddingBottom: moderateScale(36),
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: moderateScale(14),
    marginBottom: moderateScale(8),
    gap: moderateScale(10),
  },
  loaderIndicator: {
    transform: [{ scale: 1.2 }],
  },
  footerText: {
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

export default ProductGrid;
