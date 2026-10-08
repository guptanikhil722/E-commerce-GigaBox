import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScreenContainer } from '../../../components/common/ScreenContainer';
import { AppButton } from '../../../components/common/AppButton';
import { EmptyView } from '../../../components/common/EmptyView';
import { useTheme } from '../../../theme';
import { moderateScale, scale, verticalScale } from '../../../utils/responsive';
import { formatCurrency } from '../../../utils/currency';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectCartItems,
  selectCartSubtotal,
  selectCartTax,
  selectCartTotal,
  selectDeliveryFee,
} from '../../cart/store/cartSelectors';
import { clearCart } from '../../cart/store/cartSlice';
import { setOrderPlaced } from '../store/checkoutSlice';
import {
  selectDeliveryInstructions,
  selectPaymentMethod,
  selectShippingAddress,
} from '../store/checkoutSelectors';
import type { ScreenProps } from '../../../app/navigation/navigationTypes';

export const CheckoutScreen: React.FC<ScreenProps<'Checkout'>> = ({
  navigation,
}) => {
  const { theme } = useTheme();
  const dispatch = useAppDispatch();

  // Read Cart and Checkout state from Redux
  const cartItems = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);
  const deliveryFee = useAppSelector(selectDeliveryFee);
  const tax = useAppSelector(selectCartTax);
  const total = useAppSelector(selectCartTotal);

  const shippingAddress = useAppSelector(selectShippingAddress);
  const paymentMethod = useAppSelector(selectPaymentMethod);
  const deliveryInstructions = useAppSelector(selectDeliveryInstructions);

  const [placingOrder, setPlacingOrder] = useState(false);
  const placeOrderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (placeOrderTimerRef.current) {
        clearTimeout(placeOrderTimerRef.current);
      }
    };
  }, []);

  const handlePlaceOrder = useCallback(() => {
    if (cartItems.length === 0) return;

    setPlacingOrder(true);
    placeOrderTimerRef.current = setTimeout(() => {
      setPlacingOrder(false);

      // Generate order ID and save to Redux
      const orderId = `GB-${Math.floor(10000 + Math.random() * 90000)}`;

      dispatch(
        setOrderPlaced({
          orderId,
          date: new Date().toISOString(),
          items: cartItems.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            thumbnail: item.thumbnail,
          })),
          subtotal,
          deliveryFee,
          tax,
          total,
          shippingAddress,
          paymentMethod,
          status: 'CONFIRMED',
        }),
      );

      // Client state: Empty cart after successful checkout
      dispatch(clearCart());

      // Navigate to tracking
      navigation.replace('Tracking', { orderId });
    }, 800);
  }, [
    cartItems,
    subtotal,
    deliveryFee,
    tax,
    total,
    shippingAddress,
    paymentMethod,
    dispatch,
    navigation,
  ]);

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
        Review & Checkout
      </Text>

      <View style={styles.headerSpacer} />
    </View>
  );

  // Bottom action
  const renderBottomAction = () => {
    if (cartItems.length === 0) return null;

    return (
      <View style={styles.bottomBarContent}>
        <AppButton
          title={placingOrder ? 'Processing...' : 'Place Order Now'}
          onPress={handlePlaceOrder}
          loading={placingOrder}
          variant="primary"
          size="lg"
          fullWidth={true}
          accessibilityLabel={`Place order for total $${total.toFixed(2)}`}
        />
      </View>
    );
  };

  if (cartItems.length === 0 && !placingOrder) {
    return (
      <ScreenContainer header={renderHeader()} scrollable={false}>
        <EmptyView
          icon="🛒"
          title="No Items to Checkout"
          message="Your shopping cart is currently empty. Add products from the catalog to proceed."
          actionText="Browse Catalog"
          onAction={() => navigation.navigate('Catalog')}
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
      <View
        style={[
          styles.contentContainer,
          { paddingHorizontal: theme.spacing.md },
        ]}
      >
        {/* Shipping Address Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card, // #fcfafb
              borderColor: theme.colors.border,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.lg,
            },
            theme.shadows.sm,
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📍</Text>
            <Text
              style={[
                styles.cardHeading,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.title,
                },
              ]}
            >
              Delivery Address
            </Text>
          </View>
          <Text
            style={[
              styles.addressName,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.body,
              },
            ]}
          >
            {shippingAddress.fullName}
          </Text>
          <Text
            style={[
              styles.addressDetail,
              {
                color: theme.colors.textSecondary,
                fontSize: theme.fontSize.bodySmall,
                lineHeight: theme.lineHeight.bodySmall,
              },
            ]}
          >
            {shippingAddress.street}
            {'\n'}
            {shippingAddress.city}, {shippingAddress.state}{' '}
            {shippingAddress.zipCode}
            {'\n'}
            Note: {deliveryInstructions}
          </Text>
        </View>

        {/* Payment Method Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card, // #fcfafb
              borderColor: theme.colors.border,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.lg,
            },
            theme.shadows.sm,
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💳</Text>
            <Text
              style={[
                styles.cardHeading,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.title,
                },
              ]}
            >
              Payment Method
            </Text>
          </View>
          <View style={styles.paymentMethodRow}>
            <View
              style={[
                styles.paymentLogoBox,
                { backgroundColor: theme.colors.primaryLight },
              ]}
            >
              <Text style={styles.paymentLogoText}>
                {paymentMethod === 'CARD'
                  ? 'VISA'
                  : paymentMethod === 'APPLE_PAY'
                  ? 'PAY'
                  : 'CASH'}
              </Text>
            </View>
            <View>
              <Text
                style={[
                  styles.paymentTitle,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSize.body,
                  },
                ]}
              >
                {paymentMethod === 'CARD'
                  ? 'Visa ending in 8842'
                  : paymentMethod === 'APPLE_PAY'
                  ? 'Apple Pay (Default)'
                  : 'Cash on Delivery'}
              </Text>
              <Text
                style={[
                  styles.paymentSubtitle,
                  {
                    color: theme.colors.textMuted,
                    fontSize: theme.fontSize.caption,
                  },
                ]}
              >
                Instant confirmation • Encrypted
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items Summary */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card, // #fcfafb
              borderColor: theme.colors.border,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.lg,
            },
            theme.shadows.sm,
          ]}
        >
          <Text
            style={[
              styles.cardHeading,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.title,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            Items in Order ({cartItems.length})
          </Text>

          {cartItems.map((item) => (
            <View key={item.productId} style={styles.checkoutItemRow}>
              <Image
                source={{
                  uri:
                    item.thumbnail ||
                    (item as { imageUrl?: string }).imageUrl ||
                    '',
                }}
                style={[
                  styles.itemThumbnail,
                  {
                    borderRadius: theme.borderRadius.sm,
                    backgroundColor: theme.colors.surface,
                  },
                ]}
              />
              <View style={styles.itemInfo}>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.itemTitle,
                    {
                      color: theme.colors.text,
                      fontSize: theme.fontSize.bodySmall,
                    },
                  ]}
                >
                  {item.title}
                </Text>
                <Text
                  style={[
                    styles.itemQty,
                    {
                      color: theme.colors.textMuted,
                      fontSize: theme.fontSize.caption,
                    },
                  ]}
                >
                  Qty: {item.quantity} × {formatCurrency(item.price)}
                </Text>
              </View>
              <Text
                style={[
                  styles.itemTotal,
                  {
                    color: theme.colors.text,
                    fontSize: theme.fontSize.body,
                  },
                ]}
              >
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Cost Breakdown Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card, // #fcfafb
              borderColor: theme.colors.border,
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.lg,
            },
            theme.shadows.sm,
          ]}
        >
          <Text
            style={[
              styles.cardHeading,
              {
                color: theme.colors.text,
                fontSize: theme.fontSize.title,
                marginBottom: theme.spacing.sm,
              },
            ]}
          >
            Cost Breakdown
          </Text>

          <View style={styles.costRow}>
            <Text
              style={[
                styles.costLabel,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSize.body,
                },
              ]}
            >
              Items Subtotal
            </Text>
            <Text
              style={[
                styles.costValue,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.body,
                },
              ]}
            >
              {formatCurrency(subtotal)}
            </Text>
          </View>

          <View style={styles.costRow}>
            <Text
              style={[
                styles.costLabel,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSize.body,
                },
              ]}
            >
              Estimated Shipping
            </Text>
            <Text
              style={[
                styles.costValue,
                {
                  color:
                    deliveryFee === 0
                      ? theme.colors.success
                      : theme.colors.text,
                  fontSize: theme.fontSize.body,
                },
              ]}
            >
              {deliveryFee === 0 ? 'FREE' : formatCurrency(deliveryFee)}
            </Text>
          </View>

          <View style={styles.costRow}>
            <Text
              style={[
                styles.costLabel,
                {
                  color: theme.colors.textSecondary,
                  fontSize: theme.fontSize.body,
                },
              ]}
            >
              Estimated Tax (8%)
            </Text>
            <Text
              style={[
                styles.costValue,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.body,
                },
              ]}
            >
              {formatCurrency(tax)}
            </Text>
          </View>

          <View
            style={[
              styles.divider,
              {
                backgroundColor: theme.colors.divider,
                marginVertical: theme.spacing.sm,
              },
            ]}
          />

          <View style={styles.costRow}>
            <Text
              style={[
                styles.totalLabel,
                {
                  color: theme.colors.text,
                  fontSize: theme.fontSize.h4,
                },
              ]}
            >
              Total Due
            </Text>
            <Text
              style={[
                styles.totalValue,
                {
                  color: theme.colors.primary, // #0466c8
                  fontSize: theme.fontSize.h3,
                },
              ]}
            >
              {formatCurrency(total)}
            </Text>
          </View>
        </View>

        {/* Trust Badges */}
        <View style={styles.trustBadgeRow}>
          <Text style={styles.trustBadgeText}>🔒 256-Bit SSL Encrypted Checkout</Text>
        </View>
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
  contentContainer: {
    paddingBottom: moderateScale(30),
  },
  card: {
    borderWidth: 1,
    marginBottom: moderateScale(14),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(10),
  },
  cardIcon: {
    fontSize: moderateScale(18),
    marginRight: moderateScale(8),
  },
  cardHeading: {
    fontWeight: '700',
  },
  addressName: {
    fontWeight: '700',
    marginBottom: moderateScale(4),
  },
  addressDetail: {
    fontWeight: '400',
  },
  paymentMethodRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentLogoBox: {
    width: scale(52),
    height: verticalScale(36),
    borderRadius: scale(6),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: moderateScale(12),
  },
  paymentLogoText: {
    fontWeight: '900',
    fontSize: moderateScale(14),
    letterSpacing: 1,
  },
  paymentTitle: {
    fontWeight: '700',
  },
  paymentSubtitle: {
    fontWeight: '400',
    marginTop: moderateScale(2),
  },
  checkoutItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: moderateScale(8),
  },
  itemThumbnail: {
    width: scale(46),
    height: verticalScale(46),
  },
  itemInfo: {
    flex: 1,
    marginLeft: moderateScale(10),
  },
  itemTitle: {
    fontWeight: '600',
  },
  itemQty: {
    fontWeight: '400',
    marginTop: moderateScale(2),
  },
  itemTotal: {
    fontWeight: '700',
    marginLeft: moderateScale(8),
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: moderateScale(4),
  },
  costLabel: {
    fontWeight: '500',
  },
  costValue: {
    fontWeight: '600',
  },
  divider: {
    height: 1,
  },
  totalLabel: {
    fontWeight: '700',
  },
  totalValue: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  trustBadgeRow: {
    alignItems: 'center',
    marginTop: moderateScale(6),
    marginBottom: moderateScale(16),
  },
  trustBadgeText: {
    fontSize: moderateScale(12),
    color: '#6c757d',
    fontWeight: '600',
  },
  bottomBarContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CheckoutScreen;
