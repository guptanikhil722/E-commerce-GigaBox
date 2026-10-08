import React from 'react';
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
import QuantityStepper from '../../../components/common/QuantityStepper';
import type { CartItem as ReduxCartItem } from '../store/cartTypes';

export type CartItemModel = ReduxCartItem;

export interface CartItemProps {
  item: CartItemModel;
  onIncrement: (productId: number) => void;
  onDecrement: (productId: number) => void;
  onRemove: (item: CartItemModel) => void;
}

const CartItemComponent: React.FC<CartItemProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  const { theme } = useTheme();
  const imageUri = item.thumbnail || (item as { imageUrl?: string }).imageUrl || '';

  const handleIncrement = () => onIncrement(item.productId);
  const handleDecrement = () => onDecrement(item.productId);
  const handleRemove = () => onRemove(item);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.lg,
          padding: theme.spacing.md,
        },
        theme.shadows.sm,
      ]}
    >
      {/* Product Image */}
      <Image
        source={{ uri: imageUri }}
        style={[
          styles.thumbnail,
          {
            borderRadius: theme.borderRadius.md,
            backgroundColor: theme.colors.surface,
          },
        ]}
        resizeMode="cover"
        fadeDuration={100}
      />

      {/* Item Info */}
      <View style={styles.details}>
        <View style={styles.topRow}>
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.body,
              },
            ]}
          >
            {item.title}
          </Text>

          <Pressable
            onPress={handleRemove}
            accessibilityRole="button"
            accessibilityLabel={`Remove ${item.title} from cart`}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [
              styles.deleteButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
          >
            <Text style={[styles.deleteIcon, { color: theme.colors.error }]}>
              ✕
            </Text>
          </Pressable>
        </View>

        {item.category && (
          <Text
            style={[
              styles.category,
              {
                color: theme.colors.textMuted,
                fontSize: theme.fontSize.caption,
              },
            ]}
          >
            {item.category.toUpperCase()}
          </Text>
        )}

        <View style={styles.bottomRow}>
          <Text
            style={[
              styles.price,
              {
                color: theme.colors.primary,
                fontSize: theme.fontSize.title,
              },
            ]}
          >
            {formatCurrency(item.price * item.quantity)}
          </Text>

          {/* Stepper Component */}
          <QuantityStepper
            value={item.quantity}
            onIncrement={handleIncrement}
            onDecrement={handleDecrement}
            min={1}
            size="sm"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: moderateScale(12),
  },
  thumbnail: {
    width: scale(78),
    height: verticalScale(78),
  },
  details: {
    flex: 1,
    marginLeft: moderateScale(12),
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontWeight: '600',
    flex: 1,
    marginRight: moderateScale(8),
  },
  deleteButton: {
    padding: moderateScale(2),
  },
  deleteIcon: {
    fontSize: moderateScale(16),
    fontWeight: '700',
  },
  category: {
    marginTop: moderateScale(2),
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: moderateScale(8),
  },
  price: {
    fontWeight: '700',
  },
});

export const CartItem = React.memo(
  CartItemComponent,
  (prev, next) =>
    prev.item.productId === next.item.productId &&
    prev.item.quantity === next.item.quantity &&
    prev.item.price === next.item.price &&
    prev.onIncrement === next.onIncrement &&
    prev.onDecrement === next.onDecrement &&
    prev.onRemove === next.onRemove,
);

export default CartItem;
