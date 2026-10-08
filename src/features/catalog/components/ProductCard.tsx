import React, { useCallback, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useTheme } from '../../../theme';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';
import { formatCurrency } from '../../../utils/currency';
import type { Product } from '../types';

export interface ProductCardProps {
  product: Product;
  onPress: (id: number) => void;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const { theme } = useTheme();
  const [imageError, setImageError] = useState(false);

  // Optimized image source: thumbnails are pre-scaled (~150-200px) WebP/JPGs from DummyJSON
  const imageUri = product.thumbnail || product.images?.[0];
  const reviewCount = product.reviews?.length || 18;

  const handlePress = useCallback(() => {
    onPress(product.id);
  }, [onPress, product.id]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatCurrency(product.price)}, rating ${product.rating} stars`}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        theme.shadows.sm,
      ]}
    >
      {/* Product Image Container */}
      <View
        style={[
          styles.imageContainer,
          {
            backgroundColor: theme.colors.surface,
            borderTopLeftRadius: theme.borderRadius.lg,
            borderTopRightRadius: theme.borderRadius.lg,
          },
        ]}
      >
        {!imageError && imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode="cover"
            fadeDuration={100}
            onError={handleImageError}
          />
        ) : (
          <View style={styles.imageFallback}>
            <Text style={styles.fallbackIcon}>📦</Text>
          </View>
        )}

        {/* Category Tag Overlay */}
        <View
          style={[
            styles.categoryBadge,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryBadgeText,
              {
                color: theme.colors.primary,
                fontSize: theme.fontSize.caption,
              },
            ]}
          >
            {product.category}
          </Text>
        </View>
      </View>

      {/* Details Container */}
      <View style={styles.content}>
        {/* Rating row */}
        <View style={styles.ratingRow}>
          <Text style={styles.starIcon}>★</Text>
          <Text
            style={[
              styles.ratingText,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.caption,
              },
            ]}
          >
            {product.rating.toFixed(1)}
          </Text>
          <Text
            style={[
              styles.ratingCount,
              {
                color: theme.colors.textMuted,
                fontSize: theme.fontSize.caption,
              },
            ]}
          >
            ({reviewCount})
          </Text>
        </View>

        {/* Title */}
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.body,
              lineHeight: theme.lineHeight.body,
            },
          ]}
        >
          {product.title}
        </Text>

        {/* Price & Action Row */}
        <View style={styles.priceRow}>
          <Text
            style={[
              styles.price,
              {
                color: theme.colors.primary,
                fontSize: theme.fontSize.title,
                fontWeight: theme.fontWeight.bold,
              },
            ]}
          >
            {formatCurrency(product.price)}
          </Text>

          <View
            style={[
              styles.addPill,
              {
                backgroundColor: theme.colors.primaryLight,
              },
            ]}
          >
            <Text
              style={[
                styles.addPillText,
                { color: theme.colors.primary },
              ]}
            >
              +
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: moderateScale(6),
    borderWidth: 1,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: verticalScale(140),
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackIcon: {
    fontSize: moderateScale(36),
  },
  categoryBadge: {
    position: 'absolute',
    top: moderateScale(8),
    left: moderateScale(8),
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(3),
    borderRadius: moderateScale(6),
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  content: {
    padding: moderateScale(12),
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(4),
  },
  starIcon: {
    color: '#ff9f1c',
    fontSize: moderateScale(13),
    marginRight: moderateScale(3),
  },
  ratingText: {
    fontWeight: '700',
  },
  ratingCount: {
    marginLeft: moderateScale(3),
  },
  title: {
    fontWeight: '600',
    minHeight: verticalScale(38),
    marginBottom: moderateScale(8),
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    letterSpacing: -0.3,
  },
  addPill: {
    width: scale(26),
    height: scale(26),
    borderRadius: scale(13),
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPillText: {
    fontSize: moderateScale(16),
    fontWeight: '700',
    includeFontPadding: false,
    lineHeight: moderateScale(18),
  },
});

/**
 * React.memo to prevent re-rendering identical items during infinite scrolling
 * and parent state changes.
 */
export const ProductCard = React.memo(
  ProductCardComponent,
  (prev, next) =>
    prev.product.id === next.product.id &&
    prev.product.price === next.product.price &&
    prev.product.title === next.product.title &&
    prev.product.rating === next.product.rating &&
    prev.onPress === next.onPress,
);

export default ProductCard;
