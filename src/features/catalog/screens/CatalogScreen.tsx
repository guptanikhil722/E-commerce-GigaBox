import React, { useCallback, useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { OptimizedList } from '../../../components/common/OptimizedList';
import { AppIcon } from '../../../components/common/AppIcon';
import { useTheme } from '../../../theme';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';
import { useDebounce } from '../../../hooks/useDebounce';
import { useInfiniteProducts } from '../hooks/useProducts';
import { ProductGrid } from '../components/ProductGrid';
import { SearchBar } from '../components/SearchBar';
import { CategoryChip } from '../components/CategoryChip';
import { useAppSelector } from '../../../store/hooks';
import { selectCartItemCount } from '../../cart/store/cartSelectors';
import type { ScreenProps } from '../../../app/navigation/navigationTypes';

// Static categories configuration moved outside component to prevent re-creation
const CATALOG_CATEGORIES: readonly string[] = [
  'All',
  'beauty',
  'fragrances',
  'furniture',
  'groceries',
  'home-decoration',
  'kitchen-accessories',
  'laptops',
  'mens-shirts',
  'mens-shoes',
  'mens-watches',
  'mobile-accessories',
  'motorcycle',
  'skin-care',
  'smartphones',
  'sports-accessories',
  'sunglasses',
  'tablets',
  'tops',
  'vehicle',
  'womens-bags',
  'womens-dresses',
  'womens-jewellery',
  'womens-shoes',
  'womens-watches',
] as const;

export const CatalogScreen: React.FC<ScreenProps<'Catalog'>> = ({ navigation }) => {
  const { theme } = useTheme();

  // Narrow client state selector: only re-renders when count changes
  const cartItemCount = useAppSelector(selectCartItemCount);

  // Search input state and debounce
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 350);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Server state from TanStack React Query (Infinite Query)
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
    error,
    refetch,
  } = useInfiniteProducts({
    search: debouncedSearch,
    category: selectedCategory,
    limit: 10,
  });

  // Flatten infinite query pages into a single products list
  const products = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.products);
  }, [data?.pages]);

  const handleProductPress = useCallback(
    (productId: number) => {
      navigation.navigate('ProductDetails', { productId });
    },
    [navigation],
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('All');
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSelectCategory = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  const handleOpenCart = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  const isScreenLoading = isLoading && !data;
  const isScreenError = isError;
  const errorMessage = error?.message;

  // Custom Header
  const renderHeader = () => (
    <View
      style={[
        styles.headerRow,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <View>
        <Text
          style={[
            styles.brandSub,
            {
              color: theme.colors.primary,
              fontSize: theme.fontSize.caption,
            },
          ]}
        >
          GIGABOX COMMERCE • DUMMYJSON API
        </Text>
        <Text
          style={[
            styles.brandTitle,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.h2,
              lineHeight: theme.lineHeight.h2,
            },
          ]}
        >
          Discover Gear
        </Text>
      </View>

      {/* Cart Button with real Redux item count badge */}
      <Pressable
        onPress={handleOpenCart}
        accessibilityRole="button"
        accessibilityLabel={`View Cart, ${cartItemCount} items`}
        style={({ pressed }) => [
          styles.cartButton,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.8 : 1,
          },
          theme.shadows.sm,
        ]}
      >
        <AppIcon name="cart" size={moderateScale(18)} />
        {cartItemCount > 0 && (
          <View
            style={[
              styles.cartBadge,
              { backgroundColor: theme.colors.primary },
            ]}
          >
            <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
          </View>
        )}
      </Pressable>
    </View>
  );

  // List header inside ProductGrid: Search bar, Category chips
  const renderListHeader = () => (
    <View style={styles.listHeaderWrapper}>
      {/* Search Bar with Debounce */}
      <View style={styles.searchSection}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
        />
      </View>

      {/* Category Chips Bar */}
      <OptimizedList<string>
        data={CATALOG_CATEGORIES as unknown as string[]}
        keyExtractor={(item) => item}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryChipsList}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={5}
        renderItem={({ item }) => (
          <CategoryChip
            label={item}
            selected={selectedCategory === item}
            onPress={() => handleSelectCategory(item)}
          />
        )}
      />
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.screenFlex}>
        <ScreenContainer header={renderHeader()} scrollable={false}>
          <ProductGrid
            products={products}
            onSelectProduct={handleProductPress}
            loading={isScreenLoading}
            error={isScreenError}
            errorMessage={errorMessage}
            onRetry={refetch}
            onClearFilters={handleClearFilters}
            refreshing={isFetchingNextPage}
            onRefresh={refetch}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            ListHeaderComponent={renderListHeader()}
          />
        </ScreenContainer>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  screenFlex: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  brandSub: {
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: verticalScale(2),
  },
  brandTitle: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  cartButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: scale(22),
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -scale(4),
    right: -scale(4),
    minWidth: scale(18),
    height: scale(18),
    borderRadius: scale(9),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(4),
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: moderateScale(10),
    fontWeight: '800',
  },
  listHeaderWrapper: {
    paddingBottom: verticalScale(12),
  },
  searchSection: {
    marginBottom: verticalScale(12),
  },
  categoryChipsList: {
    gap: moderateScale(8),
    paddingBottom: verticalScale(4),
  },
});

export default CatalogScreen;
