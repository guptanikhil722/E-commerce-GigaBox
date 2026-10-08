export interface ShippingAddress {
  fullName: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
}

export type PaymentMethodType = 'CARD' | 'APPLE_PAY' | 'CASH_ON_DELIVERY';

export interface PlacedOrderItem {
  productId: number;
  title: string;
  price: number;
  quantity: number;
  thumbnail: string;
}

export interface PlacedOrder {
  orderId: string;
  date: string;
  items: PlacedOrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  total: number;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodType;
  status: 'CONFIRMED' | 'PREPARING' | 'IN_TRANSIT' | 'DELIVERED';
}

export interface CheckoutState {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethodType;
  deliveryInstructions: string;
  lastOrder: PlacedOrder | null;
}
