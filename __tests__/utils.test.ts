import {
  formatCurrency,
  formatDiscount,
} from '../src/utils/currency';
import {
  calculateSubtotal,
  calculateDeliveryFee,
  calculateTax,
  calculateOrderTotal,
  calculateItemTotal,
} from '../src/utils/pricing';
import {
  validateAddress,
  isValidZipCode,
  isValidPhone,
} from '../src/utils/validation';
import {
  getStatusTitle,
  getStatusDescription,
  getStatusStepIndex,
  formatEtaMinutes,
  getEstimatedDeliveryText,
} from '../src/features/order/utils/trackingFormatters';

describe('Domain Utilities: Pricing & Currency', () => {
  test('formats currency properly', () => {
    expect(formatCurrency(29.99)).toBe('$29.99');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(15.5)).toBe('$15.50');
  });

  test('formats discount percentages properly', () => {
    expect(formatDiscount(15)).toBe('15% OFF');
    expect(formatDiscount(0)).toBe('');
    expect(formatDiscount(undefined)).toBe('');
  });

  test('calculates cart pricing accurately', () => {
    const items = [
      { id: '1', productId: 1, title: 'Item 1', price: 10, quantity: 2, thumbnail: '' },
      { id: '2', productId: 2, title: 'Item 2', price: 20, quantity: 1, thumbnail: '' },
    ];

    const subtotal = calculateSubtotal(items);
    expect(subtotal).toBe(40);

    // Free delivery threshold is >= 300
    expect(calculateDeliveryFee(350)).toBe(0);

    // Subtotal below 300 gets standard delivery fee ($15)
    expect(calculateDeliveryFee(25)).toBe(15);

    // Subtotal 0 gets $0 delivery fee
    expect(calculateDeliveryFee(0)).toBe(0);

    // Tax calculation (8% tax rate)
    expect(calculateTax(100)).toBe(8);

    // Order total
    const total = calculateOrderTotal(subtotal, calculateDeliveryFee(subtotal), calculateTax(subtotal));
    expect(total).toBe(40 + 15 + 3.2);

    // Single item total
    expect(calculateItemTotal(15, 3)).toBe(45);
  });
});

describe('Domain Utilities: Validation', () => {
  test('validates zip codes correctly', () => {
    expect(isValidZipCode('12345')).toBe(true);
    expect(isValidZipCode('12345-6789')).toBe(true);
    expect(isValidZipCode('1234')).toBe(false);
    expect(isValidZipCode('abcde')).toBe(false);
  });

  test('validates phone numbers correctly', () => {
    expect(isValidPhone('1234567890')).toBe(true);
    expect(isValidPhone('(123) 456-7890')).toBe(true);
    expect(isValidPhone('123-456-7890')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });

  test('validates shipping addresses with granular error reporting', () => {
    const valid = validateAddress({
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      phoneNumber: '5551234567',
    });
    expect(valid.isValid).toBe(true);
    expect(Object.keys(valid.errors).length).toBe(0);

    const invalid = validateAddress({
      fullName: '',
      street: '',
      city: '',
      state: '',
      zipCode: 'invalid',
      phoneNumber: '123',
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.errors.fullName).toBeDefined();
    expect(invalid.errors.street).toBeDefined();
    expect(invalid.errors.zipCode).toBeDefined();
    expect(invalid.errors.phoneNumber).toBeDefined();
  });
});

describe('Domain Utilities: Tracking Formatters', () => {
  test('maps status titles and descriptions', () => {
    expect(getStatusTitle('PLACED')).toBe('Order Placed');
    expect(getStatusTitle('PACKED')).toBe('Packed & Ready');
    expect(getStatusTitle('OUT_FOR_DELIVERY')).toBe('Out for Delivery');
    expect(getStatusTitle('DELIVERED')).toBe('Order Delivered');

    expect(getStatusDescription('DELIVERED')).toContain('safely delivered');
    expect(getStatusStepIndex('OUT_FOR_DELIVERY')).toBe(2);
  });

  test('formats ETA and status estimates', () => {
    expect(formatEtaMinutes(0)).toBe('Arrived');
    expect(formatEtaMinutes(1)).toBe('1 min away');
    expect(formatEtaMinutes(10)).toBe('10 mins away');

    expect(getEstimatedDeliveryText('DELIVERED')).toContain('Delivered today');
    expect(getEstimatedDeliveryText('OUT_FOR_DELIVERY')).toContain('8-12 minutes');
  });
});
