import cartReducer, {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
  setCartItems,
} from '../src/features/cart/store/cartSlice';
import {
  selectCartItemCount,
  selectCartSubtotal,
  selectDeliveryFee,
  selectCartTotal,
} from '../src/features/cart/store/cartSelectors';
import { FREE_DELIVERY_THRESHOLD, STANDARD_DELIVERY_FEE } from '../src/utils/pricing';

describe('Cart State & Reducer Unit Tests', () => {
  const initialCartState = { items: [] };

  test('adds item to cart and calculates quantity properly', () => {
    let state = cartReducer(
      initialCartState,
      addToCart({
        productId: 101,
        title: 'Wireless Headphones',
        price: 99.99,
        thumbnail: 'https://example.com/item.png',
        quantity: 2,
        category: 'electronics',
      }),
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe(101);
    expect(state.items[0].quantity).toBe(2);

    // Adding same product again increments quantity
    state = cartReducer(
      state,
      addToCart({
        productId: 101,
        title: 'Wireless Headphones',
        price: 99.99,
        thumbnail: 'https://example.com/item.png',
        quantity: 1,
      }),
    );

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  test('increases and decreases item quantity with auto-removal on 0', () => {
    let state = {
      items: [
        {
          productId: 202,
          title: 'Smart Watch',
          price: 199.99,
          thumbnail: '',
          quantity: 2,
        },
      ],
    };

    state = cartReducer(state, increaseQuantity(202));
    expect(state.items[0].quantity).toBe(3);

    state = cartReducer(state, decreaseQuantity(202));
    expect(state.items[0].quantity).toBe(2);

    state = cartReducer(state, decreaseQuantity(202));
    expect(state.items[0].quantity).toBe(1);

    // Decrementing when quantity is 1 removes the item
    state = cartReducer(state, decreaseQuantity(202));
    expect(state.items).toHaveLength(0);
  });

  test('removes item directly and clears all items', () => {
    let state = {
      items: [
        { productId: 1, title: 'Item 1', price: 10, thumbnail: '', quantity: 1 },
        { productId: 2, title: 'Item 2', price: 20, thumbnail: '', quantity: 2 },
      ],
    };

    state = cartReducer(state, removeFromCart(1));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe(2);

    state = cartReducer(state, clearCart());
    expect(state.items).toHaveLength(0);
  });

  test('setCartItems restores persisted cart state accurately (persistence hydration)', () => {
    const savedFromStorage = [
      {
        productId: 301,
        title: 'Ergonomic Chair',
        price: 250,
        thumbnail: 'https://example.com/chair.jpg',
        quantity: 2,
      },
    ];

    const state = cartReducer(initialCartState, setCartItems(savedFromStorage));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].productId).toBe(301);
    expect(state.items[0].quantity).toBe(2);

    const rootState = { cart: state };
    expect(selectCartItemCount(rootState)).toBe(2);
    expect(selectCartSubtotal(rootState)).toBe(500);
    // 500 > FREE_DELIVERY_THRESHOLD (300) => free delivery
    expect(selectDeliveryFee(rootState)).toBe(0);
  });

  test('verifies delivery fee rule thresholds', () => {
    // Under 300: Standard delivery fee
    const underThresholdState = {
      cart: {
        items: [
          { productId: 1, title: 'Mouse', price: 50, thumbnail: '', quantity: 1 },
        ],
      },
    };
    expect(selectCartSubtotal(underThresholdState)).toBe(50);
    expect(selectDeliveryFee(underThresholdState)).toBe(STANDARD_DELIVERY_FEE);

    // Exactly or above 300: Free delivery
    const overThresholdState = {
      cart: {
        items: [
          { productId: 2, title: 'Laptop', price: 350, thumbnail: '', quantity: 1 },
        ],
      },
    };
    expect(selectCartSubtotal(overThresholdState)).toBe(350);
    expect(selectDeliveryFee(overThresholdState)).toBe(0);
    expect(selectCartTotal(overThresholdState)).toBeGreaterThan(350);
  });
});

describe('Image Carousel Fallback Logic', () => {
  const expandGallery = (images?: string[], fallbackUrl = 'default.jpg'): string[] => {
    const raw = images && images.length > 0 ? images.filter(Boolean) : [fallbackUrl];
    if (raw.length === 0) return [fallbackUrl, fallbackUrl, fallbackUrl];
    if (raw.length === 1) return [raw[0], raw[0], raw[0]];
    if (raw.length === 2) return [raw[0], raw[1], raw[0]];
    return raw;
  };

  test('expands single image to 3 images for carousel swipeability', () => {
    const singleImage = ['https://cdn.example.com/product.jpg'];
    const carouselImages = expandGallery(singleImage);
    expect(carouselImages).toHaveLength(3);
    expect(carouselImages[0]).toBe('https://cdn.example.com/product.jpg');
    expect(carouselImages[1]).toBe('https://cdn.example.com/product.jpg');
    expect(carouselImages[2]).toBe('https://cdn.example.com/product.jpg');
  });

  test('expands 2 images to 3 images', () => {
    const twoImages = ['https://img.com/1.jpg', 'https://img.com/2.jpg'];
    const carouselImages = expandGallery(twoImages);
    expect(carouselImages).toHaveLength(3);
  });

  test('preserves galleries with 3 or more images untouched', () => {
    const multiImages = [
      'https://img.com/1.jpg',
      'https://img.com/2.jpg',
      'https://img.com/3.jpg',
      'https://img.com/4.jpg',
    ];
    const carouselImages = expandGallery(multiImages);
    expect(carouselImages).toHaveLength(4);
  });
});
