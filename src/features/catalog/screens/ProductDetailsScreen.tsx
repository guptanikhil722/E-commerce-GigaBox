import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppButton } from '../../../components/common/AppButton';
import { QuantityStepper } from '../../../components/common/QuantityStepper';
import { AppIcon } from '../../../components/common/AppIcon';
import { useTheme } from '../../../theme';
import { moderateScale, scale, verticalScale, wp } from '../../../utils/responsive';
import { useProductDetails } from '../hooks/useProducts';
import LoadingView from '../../../components/common/LoadingView';
import ErrorView from '../../../components/common/ErrorView';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addToCart } from '../../cart/store/cartSlice';
import { selectCartItemCount } from '../../cart/store/cartSelectors';
import { formatCurrency } from '../../../utils/currency';
import { calculateItemTotal } from '../../../utils/pricing';
import type { ScreenProps } from '../../../app/navigation/navigationTypes';

export const ProductDetailsScreen: React.FC<ScreenProps<'ProductDetails'>> = ({
  route,
  navigation,
}) => {
  const { theme } = useTheme();
  const { productId } = route.params;
  const { width: screenWidth } = useWindowDimensions();

  // React Query server state for product details
  const { data: serverProduct, isLoading, isError, error, refetch } =
    useProductDetails(productId);

  const fallbackProduct = React.useMemo(() => {
    const found = MOCK_PRODUCTS.find((p) => p.id === productId);
    if (found) return found;
    return {
      ...MOCK_PRODUCTS[0],
      id: productId,
      title: `Product #${productId}`,
    };
  }, [productId]);

  const product = serverProduct || fallbackProduct;

  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [addedToast, setAddedToast] = useState(false);

  // Gallery images from API or fallback:
  // Requirement: if only one image is there, expand to three and make carousel
  const gallery: string[] = useMemo(() => {
    const raw =
      product.images && product.images.length > 0
        ? product.images.filter(Boolean)
        : [product.thumbnail || product.imageUrl || fallbackProduct.imageUrl || ''];

    if (raw.length === 0) {
      const fallback = product.thumbnail || fallbackProduct.imageUrl || '';
      return [fallback, fallback, fallback];
    }
    if (raw.length === 1) {
      return [raw[0], raw[0], raw[0]];
    }
    if (raw.length === 2) {
      return [raw[0], raw[1], raw[0]];
    }
    return raw;
  }, [product.images, product.thumbnail, product.imageUrl, fallbackProduct.imageUrl]);

  const reviewCount = product.ratingCount || product.reviews?.length || 18;
  const featuresList =
    product.features ||
    (product.tags?.length
      ? product.tags.map((t) => t.toUpperCase())
      : [
          'Certified Authentic Quality',
          'Fast Global Delivery Eligible',
          '30-Day Hassle-Free Returns',
        ]);

  const dispatch = useAppDispatch();
  const cartItemCount = useAppSelector(selectCartItemCount);

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Satisfying Add-To-Cart native animation values (UI-thread, 60fps)
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cartIconScale = useRef(new Animated.Value(1)).current;
  const flyingBadgeY = useRef(new Animated.Value(0)).current;
  const flyingBadgeOpacity = useRef(new Animated.Value(0)).current;
  const flyingBadgeScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const totalNumericPrice = calculateItemTotal(product.price, quantity);
  const formattedTotalPrice = formatCurrency(totalNumericPrice);

  const handleGoBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleGoToCart = useCallback(() => {
    navigation.navigate('Cart');
  }, [navigation]);

  const handleAddToCart = useCallback(() => {
    // 1. Dispatch to Redux (persisted automatically by middleware)
    dispatch(
      addToCart({
        productId: Number(product.id || productId),
        title: product.title,
        price: Number(product.price) || 0,
        thumbnail:
          product.thumbnail ||
          product.imageUrl ||
          (product.images && product.images[0]) ||
          '',
        quantity,
        category: product.category,
      }),
    );
    setAddedToast(true);

    // 2. Button spring compression & bounce
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 3.5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // 3. Satisfying flying item badge floating towards cart
    flyingBadgeY.setValue(0);
    flyingBadgeOpacity.setValue(1);
    flyingBadgeScale.setValue(0.7);

    Animated.parallel([
      Animated.timing(flyingBadgeY, {
        toValue: -150,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(flyingBadgeScale, {
        toValue: 1.1,
        friction: 4,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(300),
        Animated.timing(flyingBadgeOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 4. Header Cart Icon celebratory scale bounce
    setTimeout(() => {
      Animated.sequence([
        Animated.spring(cartIconScale, {
          toValue: 1.35,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(cartIconScale, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
    }, 250);

    // 5. Toast cleanup
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setAddedToast(false);
    }, 1400);
  }, [
    dispatch,
    product,
    productId,
    quantity,
    buttonScale,
    cartIconScale,
    flyingBadgeY,
    flyingBadgeOpacity,
    flyingBadgeScale,
  ]);

  // Custom Header
  const renderHeader = () => (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.background,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Pressable
        onPress={handleGoBack}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        style={({ pressed }) => [
          styles.headerButton,
          {
            backgroundColor: theme.colors.card, // #fcfafb
            borderColor: theme.colors.border,
            opacity: pressed ? 0.75 : 1,
          },
          theme.shadows.sm,
        ]}
      >
        <AppIcon name="back" size={18} color={theme.colors.text} />
      </Pressable>

      <Text
        style={[
          styles.headerTitle,
          {
            color: theme.colors.text,
            fontSize: theme.fontSize.title,
          },
        ]}
      >
        Product Details
      </Text>

      <Animated.View style={{ transform: [{ scale: cartIconScale }] }}>
        <Pressable
          onPress={handleGoToCart}
          accessibilityRole="button"
          accessibilityLabel={`Go to cart, ${cartItemCount} items`}
          style={({ pressed }) => [
            styles.headerButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              opacity: pressed ? 0.75 : 1,
            },
            theme.shadows.sm,
          ]}
        >
          <AppIcon name="cart" size={18} color={theme.colors.text} />
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
      </Animated.View>
    </View>
  );

  // Bottom CTA Bar
  const renderBottomAction = () => (
    <View style={styles.bottomBarRow}>
      <View style={styles.priceColumn}>
        <Text
          style={[
            styles.totalLabel,
            {
              color: theme.colors.textMuted,
              fontSize: theme.fontSize.caption,
            },
          ]}
        >
          Total Price ({quantity} {quantity === 1 ? 'item' : 'items'})
        </Text>
        <Text
          style={[
            styles.totalPriceValue,
            {
              color: theme.colors.primary, // #0466c8
              fontSize: theme.fontSize.h2,
            },
          ]}
        >
          {formattedTotalPrice}
        </Text>
      </View>

      <View style={styles.buttonColumn}>
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <AppButton
            title={addedToast ? 'Added to Cart ✓' : 'Add to Cart'}
            onPress={handleAddToCart}
            variant="primary"
            size="lg"
            accessibilityLabel={`Add ${quantity} of ${product.title} to cart for ${formattedTotalPrice}`}
          />
        </Animated.View>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.flyingBadge,
            {
              backgroundColor: theme.colors.primary,
              opacity: flyingBadgeOpacity,
              transform: [
                { translateY: flyingBadgeY },
                { scale: flyingBadgeScale },
              ],
            },
          ]}
        >
          <Text style={styles.flyingBadgeText}>+{quantity} Added! 🛍️</Text>
        </Animated.View>
      </View>
    </View>
  );

  if (isLoading && !serverProduct) {
    return (
      <ScreenContainer header={renderHeader()} scrollable={false}>
        <LoadingView message="Loading product specifications..." />
      </ScreenContainer>
    );
  }

  if (isError && !serverProduct) {
    return (
      <ScreenContainer header={renderHeader()} scrollable={false}>
        <ErrorView
          title="Could not load product"
          message={error?.message || 'Unable to retrieve product details.'}
          onRetry={refetch}
          retryText="Try Again"
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      header={renderHeader()}
      bottomAction={renderBottomAction()}
      scrollable={true}
    >
      {/* Product Image Carousel */}
      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          onScroll={(event) => {
            const offsetX = event.nativeEvent.contentOffset.x;
            const index = Math.round(offsetX / (screenWidth || 1));
            setActiveImageIndex(index);
          }}
          scrollEventThrottle={16}
        >
          {gallery.map((uri, index) => (
            <View key={index} style={[styles.imageSlide, { width: screenWidth }]}>
              <Image
                source={{ uri }}
                style={styles.heroImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>

        {/* Carousel Pagination Dots */}
        <View style={styles.paginationRow}>
          {gallery.map((_, index) => {
            const active = index === activeImageIndex;
            return (
              <View
                key={index}
                style={[
                  styles.dot,
                  active
                    ? [styles.dotActive, { backgroundColor: theme.colors.primary }]
                    : styles.dotInactive,
                ]}
              />
            );
          })}
        </View>
      </View>

      {/* Product Information Card */}
      <View
        style={[
          styles.infoContainer,
          {
            backgroundColor: theme.colors.card, // #fcfafb
            borderColor: theme.colors.border,
            padding: theme.spacing.lg,
            borderTopLeftRadius: theme.borderRadius.xl,
            borderTopRightRadius: theme.borderRadius.xl,
          },
          theme.shadows.md,
        ]}
      >
        {/* Category & Rating Row */}
        <View style={styles.metaRow}>
          <View
            style={[
              styles.categoryPill,
              {
                backgroundColor: theme.colors.primaryLight,
              },
            ]}
          >
            <Text
              style={[
                styles.categoryPillText,
                {
                  color: theme.colors.primary,
                  fontSize: theme.fontSize.caption,
                },
              ]}
            >
              {product.category}
            </Text>
          </View>

          <View style={styles.ratingBadge}>
            <Text style={styles.ratingStar}>★</Text>
            <Text
              style={[
                styles.ratingScore,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.bodySmall,
                },
              ]}
            >
              {product.rating.toFixed(1)}
            </Text>
            <Text
              style={[
                styles.ratingReviewCount,
                {
                  color: theme.colors.textMuted,
                  fontSize: theme.fontSize.bodySmall,
                },
              ]}
            >
              ({reviewCount} reviews)
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.h2,
              lineHeight: theme.lineHeight.h2,
            },
          ]}
        >
          {product.title}
        </Text>

        {/* Unit Price */}
        <Text
          style={[
            styles.unitPrice,
            {
              color: theme.colors.primary,
              fontSize: theme.fontSize.h3,
            },
          ]}
        >
          ${product.price.toFixed(2)}
        </Text>

        {/* Stepper Selection Row */}
        <View
          style={[
            styles.stepperRow,
            {
              borderColor: theme.colors.border,
              paddingVertical: theme.spacing.md,
            },
          ]}
        >
          <View>
            <Text
              style={[
                styles.stepperLabel,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.title,
                },
              ]}
            >
              Quantity
            </Text>
            <Text
              style={[
                styles.stockStatus,
                {
                  color: theme.colors.success,
                  fontSize: theme.fontSize.caption,
                },
              ]}
            >
              In Stock & Ready to Ship
            </Text>
          </View>

          <QuantityStepper
            value={quantity}
            onIncrement={() => setQuantity((prev) => prev + 1)}
            onDecrement={() => setQuantity((prev) => Math.max(1, prev - 1))}
            min={1}
            max={20}
          />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.title,
              },
            ]}
          >
            Description
          </Text>
          <Text
            style={[
              styles.descriptionText,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.fontSize.body,
                lineHeight: theme.lineHeight.body,
              },
            ]}
          >
            {product.description}
          </Text>
        </View>

        {/* Key Features List */}
        {featuresList && featuresList.length > 0 && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.title,
                },
              ]}
            >
              Highlights
            </Text>
            {featuresList.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View
                  style={[
                    styles.featureBullet,
                    { backgroundColor: theme.colors.primary },
                  ]}
                />
                <Text
                  style={[
                    styles.featureText,
                    {
                      color: theme.colors.textSecondary,
                      fontSize: theme.fontSize.body,
                    },
                  ]}
                >
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: moderateScale(10),
  },
  headerButton: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  headerButtonIcon: {
    fontSize: moderateScale(18),
  },
  headerTitle: {
    fontWeight: '700',
  },
  carouselContainer: {
    width: '100%',
    height: verticalScale(280),
    position: 'relative',
  },
  imageSlide: {
    height: '100%',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  paginationRow: {
    position: 'absolute',
    bottom: moderateScale(16),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: moderateScale(6),
  },
  dot: {
    height: scale(8),
    borderRadius: scale(4),
  },
  dotActive: {
    width: scale(20),
  },
  dotInactive: {
    width: scale(8),
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  infoContainer: {
    marginTop: -moderateScale(16),
    borderWidth: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: moderateScale(10),
  },
  categoryPill: {
    paddingHorizontal: moderateScale(10),
    paddingVertical: moderateScale(4),
    borderRadius: moderateScale(6),
  },
  categoryPillText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStar: {
    color: '#ff9f1c',
    fontSize: moderateScale(15),
    marginRight: moderateScale(4),
  },
  ratingScore: {
    fontWeight: '700',
  },
  ratingReviewCount: {
    marginLeft: moderateScale(4),
  },
  title: {
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: moderateScale(8),
  },
  unitPrice: {
    fontWeight: '800',
    marginBottom: moderateScale(16),
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: moderateScale(16),
  },
  stepperLabel: {
    fontWeight: '700',
  },
  stockStatus: {
    fontWeight: '600',
    marginTop: moderateScale(2),
  },
  section: {
    marginBottom: moderateScale(16),
  },
  sectionTitle: {
    fontWeight: '700',
    marginBottom: moderateScale(8),
  },
  descriptionText: {
    fontWeight: '400',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(6),
  },
  featureBullet: {
    width: scale(6),
    height: scale(6),
    borderRadius: scale(3),
    marginRight: moderateScale(10),
  },
  featureText: {
    flex: 1,
  },
  bottomBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceColumn: {
    flex: 1,
    marginRight: moderateScale(16),
  },
  totalLabel: {
    fontWeight: '500',
  },
  totalPriceValue: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  buttonColumn: {
    flex: 1.2,
  },
  cartBadge: {
    position: 'absolute',
    top: -scale(4),
    right: -scale(4),
    minWidth: scale(20),
    height: scale(20),
    borderRadius: scale(10),
    paddingHorizontal: scale(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: moderateScale(11),
    fontWeight: '700',
  },
  flyingBadge: {
    position: 'absolute',
    top: -moderateScale(12),
    alignSelf: 'center',
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(16),
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    zIndex: 99,
  },
  flyingBadgeText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: moderateScale(13),
  },
});

export default ProductDetailsScreen;
