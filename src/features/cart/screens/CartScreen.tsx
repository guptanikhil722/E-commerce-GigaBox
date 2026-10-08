import React, { useCallback, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppButton } from '../../../components/common/AppButton';
import { AppModal } from '../../../components/common/AppModal';
import { EmptyView } from '../../../components/common/EmptyView';
import { OptimizedList } from '../../../components/common/OptimizedList';
import { useTheme } from '../../../theme';
import { moderateScale, scale } from '../../../utils/responsive';
import CartItem, { CartItemModel } from '../components/CartItem';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  clearCart,
} from '../store/cartSlice';
import {
  selectCartItemCount,
  selectCartItems,
  selectCartSubtotal,
  selectCartTotal,
  selectDeliveryFee,
} from '../store/cartSelectors';
import {
  FREE_DELIVERY_THRESHOLD,
  STANDARD_DELIVERY_FEE,
} from '../../../utils/pricing';
import type { ScreenProps } from '../../../app/navigation/navigationTypes';

export const CartScreen: React.FC<ScreenProps<'Cart'>> = ({ navigation }) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  // Read Cart State from Redux
  const cartItems = useAppSelector(selectCartItems);
  const cartItemCount = useAppSelector(selectCartItemCount);
  const subtotal = useAppSelector(selectCartSubtotal);
  const deliveryFee = useAppSelector(selectDeliveryFee);
  const total = useAppSelector(selectCartTotal);

  const [itemToRemove, setItemToRemove] = useState<CartItemModel | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Mutable ref for current cart items to keep handleDecrement identity completely stable
  const cartItemsRef = useRef(cartItems);
  cartItemsRef.current = cartItems;

  const handleIncrement = useCallback((productId: number) => {
    dispatch(increaseQuantity(productId));
  }, [dispatch]);

  const handleDecrement = useCallback((productId: number) => {
    const item = cartItemsRef.current.find((i: CartItemModel) => i.productId === productId);
    if (item && item.quantity <= 1) {
      setItemToRemove(item);
    } else {
      dispatch(decreaseQuantity(productId));
    }
  }, [dispatch]);

  const handleRemove = useCallback((item: CartItemModel) => {
    setItemToRemove(item);
  }, []);

  const confirmRemoveItem = useCallback(() => {
    if (itemToRemove) {
      dispatch(removeFromCart(itemToRemove.productId));
      setItemToRemove(null);
    }
  }, [dispatch, itemToRemove]);

  // Header
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
        onPress={() => navigation.goBack()}
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
        <Text style={[styles.headerButtonIcon, { color: theme.colors.text }]}>
          ←
        </Text>
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
        Shopping Cart ({cartItemCount})
      </Text>

      {cartItems.length > 0 ? (
        <Pressable
          onPress={() => setShowClearConfirm(true)}
          accessibilityRole="button"
          accessibilityLabel="Clear cart"
          style={({ pressed }) => [
            styles.clearButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Text style={[styles.clearButtonText, { color: theme.colors.error }]}>
            Clear
          </Text>
        </Pressable>
      ) : (
        <View style={styles.headerSpacer} />
      )}
    </View>
  );

  // Bottom CTA: Proceed to Checkout
  const renderBottomAction = () => {
    if (cartItems.length === 0) return null;

    return (
      <View style={styles.bottomBarContent}>
        <AppButton
          title="Proceed to Checkout"
          onPress={() => navigation.navigate('Checkout')}
          variant="primary"
          size="lg"
          fullWidth={true}
          accessibilityLabel={`Proceed to checkout for total $${total.toFixed(2)}`}
        />
      </View>
    );
  };

  // Order summary breakdown component placed below cart list
  const renderOrderSummary = () => (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: theme.colors.card, // #fcfafb
          borderColor: theme.colors.border,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.lg,
        },
        theme.shadows.sm,
      ]}
    >
      <Text
        style={[
          styles.summaryTitle,
          {
            color: theme.colors.text,
            fontSize: theme.fontSize.title,
            marginBottom: theme.spacing.sm,
          },
        ]}
      >
        Order Summary
      </Text>

      {/* Free Delivery Threshold Rule Banner */}
      <View
        style={[
          styles.thresholdBanner,
          {
            backgroundColor:
              subtotal >= FREE_DELIVERY_THRESHOLD
                ? 'rgba(40, 167, 69, 0.1)'
                : 'rgba(4, 102, 200, 0.08)',
            borderColor:
              subtotal >= FREE_DELIVERY_THRESHOLD
                ? theme.colors.success
                : theme.colors.primary,
          },
        ]}
      >
        <Text
          style={[
            styles.thresholdTitle,
            {
              color:
                subtotal >= FREE_DELIVERY_THRESHOLD
                  ? theme.colors.success
                  : theme.colors.primary,
              fontSize: theme.fontSize.bodySmall,
            },
          ]}
        >
          {subtotal >= FREE_DELIVERY_THRESHOLD
            ? '🎉 Free Delivery Unlocked!'
            : `🚚 Add $${(FREE_DELIVERY_THRESHOLD - subtotal).toFixed(2)} more for FREE Delivery`}
        </Text>
        <Text
          style={[
            styles.thresholdSubtitle,
            {
              color: theme.colors.textMuted,
              fontSize: theme.fontSize.caption,
            },
          ]}
        >
          Free standard delivery on orders above ${FREE_DELIVERY_THRESHOLD}.00
        </Text>
        <View style={styles.thresholdProgressTrack}>
          <View
            style={[
              styles.thresholdProgressBar,
              {
                width: `${Math.min(100, Math.round((subtotal / FREE_DELIVERY_THRESHOLD) * 100))}%`,
                backgroundColor:
                  subtotal >= FREE_DELIVERY_THRESHOLD
                    ? theme.colors.success
                    : theme.colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Subtotal */}
      <View style={styles.summaryRow}>
        <Text
          style={[
            styles.summaryLabel,
            {
              color: theme.colors.textSecondary,
              fontSize: theme.fontSize.body,
            },
          ]}
        >
          Subtotal ({cartItemCount} items)
        </Text>
        <Text
          style={[
            styles.summaryValue,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.body,
            },
          ]}
        >
          ${subtotal.toFixed(2)}
        </Text>
      </View>

      {/* Delivery Fee */}
      <View style={styles.summaryRow}>
        <View>
          <Text
            style={[
              styles.summaryLabel,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.fontSize.body,
              },
            ]}
          >
            Standard Delivery
          </Text>
          <Text
            style={[
              styles.feeRuleSubtext,
              {
                color: theme.colors.textMuted,
                fontSize: theme.fontSize.caption,
              },
            ]}
          >
            {subtotal >= FREE_DELIVERY_THRESHOLD
              ? 'Qualified for Free Delivery'
              : `$${STANDARD_DELIVERY_FEE.toFixed(2)} (Free above $${FREE_DELIVERY_THRESHOLD})`}
          </Text>
        </View>
        <Text
          style={[
            styles.summaryValue,
            {
              color: deliveryFee === 0 ? theme.colors.success : theme.colors.text,
              fontSize: theme.fontSize.body,
              fontWeight: '700',
            },
          ]}
        >
          {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
        </Text>
      </View>

      {/* Divider */}
      <View
        style={[
          styles.divider,
          { backgroundColor: theme.colors.divider, marginVertical: theme.spacing.md },
        ]}
      />

      {/* Total */}
      <View style={styles.summaryRow}>
        <Text
          style={[
            styles.totalBoldLabel,
            {
              color: theme.colors.text,
              fontSize: theme.fontSize.h4,
            },
          ]}
        >
          Total Amount
        </Text>
        <Text
          style={[
            styles.totalBoldValue,
            {
              color: theme.colors.primary, // #0466c8
              fontSize: theme.fontSize.h3,
            },
          ]}
        >
          ${total.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer
      header={renderHeader()}
      bottomAction={renderBottomAction()}
      scrollable={false}
    >
      {cartItems.length > 0 ? (
        <OptimizedList<CartItemModel>
          data={cartItems}
          keyExtractor={(item) => String(item.productId)}
          contentContainerStyle={[
            styles.listContainer,
            { paddingHorizontal: theme.spacing.md },
          ]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <CartItem
              item={item}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onRemove={handleRemove}
            />
          )}
          ListFooterComponent={renderOrderSummary()}
        />
      ) : (
        <EmptyView
          icon="🛍️"
          title="Your Cart is Empty"
          message="Looks like you haven't added any gear yet. Explore our latest collection!"
          actionText="Browse Catalog"
          onAction={() => navigation.navigate('Catalog')}
        />
      )}

      {/* Confirmation Modal for Item Removal */}
      <AppModal
        visible={itemToRemove !== null}
        onClose={() => setItemToRemove(null)}
        title="Remove Item?"
        message={`Are you sure you want to remove "${itemToRemove?.title}" from your shopping cart?`}
        confirmText="Remove"
        cancelText="Keep"
        confirmVariant="danger"
        onConfirm={confirmRemoveItem}
      />

      {/* Confirmation Modal for Clear Cart */}
      <AppModal
        visible={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        title="Clear Shopping Cart?"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={() => {
          dispatch(clearCart());
          setShowClearConfirm(false);
        }}
      />
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
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonIcon: {
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  headerTitle: {
    fontWeight: '700',
  },
  headerSpacer: {
    width: scale(40),
  },
  clearButton: {
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(6),
  },
  clearButtonText: {
    fontWeight: '700',
    fontSize: moderateScale(13),
  },
  listContainer: {
    paddingTop: moderateScale(10),
    paddingBottom: moderateScale(24),
  },
  summaryCard: {
    borderWidth: 1,
    marginTop: moderateScale(8),
    marginBottom: moderateScale(16),
  },
  summaryTitle: {
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: moderateScale(4),
  },
  summaryLabel: {
    fontWeight: '500',
  },
  summaryValue: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  totalBoldLabel: {
    fontWeight: '700',
  },
  totalBoldValue: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  bottomBarContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thresholdBanner: {
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    marginBottom: moderateScale(14),
  },
  thresholdTitle: {
    fontWeight: '700',
    marginBottom: moderateScale(2),
  },
  thresholdSubtitle: {
    marginBottom: moderateScale(8),
  },
  thresholdProgressTrack: {
    height: moderateScale(6),
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: moderateScale(3),
    overflow: 'hidden',
  },
  thresholdProgressBar: {
    height: '100%',
    borderRadius: moderateScale(3),
  },
  feeRuleSubtext: {
    marginTop: moderateScale(2),
  },
});

export default CartScreen;
