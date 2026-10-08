# Gigabox — Performance & Offline Optimization Architecture

This document details the real-world performance, memory, and offline resilience optimizations implemented across the Gigabox React Native application, with particular emphasis on resource-constrained and low/mid-range Android devices.

---

## 1. Offline Strategy

### Architecture & Data Flow

```text
       NetInfo (Native Module)
                 │
                 ▼
      NetworkService (Singleton)
                 │
         ┌───────┴────────────────┐
         ▼                        ▼
TanStack React Query       NetworkProvider /
   onlineManager             useNetwork() Hook
         │                        │
         ▼                        ▼
  Auto-pause/resume        UI OfflineBanner +
   Query Invalidation       Catalog/Cart Fallbacks
```

### Key Engineering Decisions:
1. **Centralized Network Mechanism (`NetworkService`):**
   - Instead of subscribing to `@react-native-community/netinfo` inside multiple screens or components (which spawns redundant native listeners, memory leaks, and bridge traffic), a single centralized service coordinates connectivity.
   - It hooks directly into TanStack React Query's `onlineManager.setEventListener`, synchronizing server queries globally.
   - It exposes a typed `NetworkProvider` and `useNetwork()` hook for UI presentation.

2. **Error Classification (`ApiErrorType: 'OFFLINE'`):**
   - In `src/services/api/errorHandler.ts`, request failures occurring when the device is disconnected are categorized as `'OFFLINE'` rather than generic HTTP or network errors.
   - UI components inspect `error.type === 'OFFLINE'` to render friendly messaging without alarming the user with cryptic 5xx or connection refused messages.

3. **Query Pausing & Resumption (`networkMode: 'online'`):**
   - Configured in `src/services/query/queryClient.ts`.
   - Prevents React Query from repeatedly attempting network requests when the device lacks connectivity, preventing battery drain and useless API transport failure loops.
   - When connection returns, paused queries auto-resume and active screens seamlessly revalidate.

4. **Offline Cart & Catalog Browsing:**
   - Redux Toolkit manages cart state and is completely decoupled from network reachability; adding, incrementing, decrementing, and removing items functions 100% offline.
   - The catalog query retains its cached snapshot in TanStack React Query memory (`gcTime: 15 mins`, `staleTime: 5 mins`).
   - If an uncached query or empty search occurs offline, `ProductGrid` displays an offline guidance empty state rather than a crash or infinite spinner.

5. **Full-Screen Network Error Screen (`NetworkErrorScreen.tsx`):**
   - Replaced top offline banner with a dedicated, immersive full-screen network error experience.
   - Features 60 FPS UI-thread concentric radar pulse animations (`useNativeDriver: true`) behind a satellite icon disc.
   - Includes diagnostic troubleshooting cards (Wi-Fi/Cellular, Airplane Mode, Router).
   - Interactive "Try Again" CTA button that invokes `checkConnectivity()` on `NetworkService`.
   - Automatically transitions back to active screen upon network restoration while preserving navigation and user form state intact.

---

## 2. Product List Performance (`OptimizedList.tsx` & `ProductGrid.tsx`)

### List Optimizations:
1. **Stable `keyExtractor`:**
   - Uses `(item) => String(item.id)`. Avoids array index keys which force re-renders of the entire list whenever items are prepended or filtered.
2. **Stable `renderItem` Identity:**
   - Wrapped in `useCallback` with no inline function closures or recreated JSX.
3. **Pagination Duplicate Guard (`isPaginatingRef`):**
   - Employs a mutable `useRef(false)` guard inside `handleEndReached` to prevent duplicate concurrent pagination calls when momentum scrolling triggers `onEndReached` multiple times in rapid succession.
4. **Android Native View Clipping:**
   - Android leverages `removeClippedSubviews={true}` to detach off-screen views from the native hierarchy, reducing draw calls and GPU texture memory.
5. **Configured Batch Rendering:**
   - `initialNumToRender={6}`: Instantly renders items visible within the initial viewport, slashing Time to First Meaningful Paint (TTFMP).
   - `maxToRenderPerBatch={8}` & `windowSize={5}`: Restricts off-screen buffer allocations to avoid OOM memory spikes on low-RAM devices.

---

## 3. Selective Memoization Strategy

### Strict Value-Based Memoization:
We explicitly avoided "memoizing everything". `React.memo`, `useMemo`, and `useCallback` were applied strictly where there is measurable rendering prevention.

| Component / Function | Technique | Rationale |
| :--- | :--- | :--- |
| `ProductCard` | `React.memo` | Prevents hundreds of product card re-renders when parent states (such as active category, search text, or scroll offsets) update. |
| `CartItem` | `React.memo` (custom comparator) | Compares only `productId`, `quantity`, `price`, and `title`. Incrementing item A does not re-render items B, C, or D. |
| `ProductGrid.renderItem` | `useCallback` | Preserves referential equality across list re-renders, preventing list re-initialization. |
| `CartScreen.handleIncrement / handleDecrement` | `useCallback` + `cartItemsRef` | Accesses cart items through `cartItemsRef.current` so the callbacks never change identity when cart contents change. |
| Redux Cart Selectors | Narrow selectors (`selectCartSubtotal`, etc.) | Components subscribe to discrete scalar primitives instead of the root cart state object. |

---

## 4. State Classification & Ownership

Every piece of state in the application follows strict ownership boundaries to eliminate duplicate sources of truth:

```text
1. Server State        → TanStack React Query (products, categories, search results)
2. Shared Client State → Redux Toolkit (cart items, checkout preferences, order tracking events)
3. Local UI State      → React useState (modal visibility, active image carousel index, search input string)
4. Non-UI Mutable Refs → React useRef (debounce timers, pagination locks, interval IDs, previous state snapshots)
5. Derived State       → Pure Selectors & Utilities (subtotal, delivery fee, tax, order totals, formatted prices)
```

### Derived Values Removed from State:
- `subtotal`, `deliveryFee`, `tax`, and `total` are **never stored as independent React state**. They are computed purely via `src/utils/pricing.ts` from Redux `cart.items`.

---

## 5. `useState` vs `useRef` Separation

Values that do NOT directly affect the visual JSX tree were migrated from `useState` to `useRef` to eliminate dropped frames and redundant render passes:

- **Pagination Lock (`isPaginatingRef`):** Prevents duplicate API requests during fast fling scrolling without triggering a render.
- **Debounce Timer (`debounceTimerRef`):** Stores the 350ms search debounce timeout reference.
- **Cart Items Mirror (`cartItemsRef`):** Enables stable list action callbacks without re-allocating handlers on every cart mutation.
- **Order Timeout Refs (`placeOrderTimerRef`, `toastTimerRef`):** Cleaned up gracefully during unmount to prevent memory leaks and setState-on-unmounted-component warnings.

---

## 6. Logic Separation: Pure Domain Utilities

All business logic, financial arithmetic, and formatting rules were extracted completely outside React components into pure, testable TypeScript modules:

- **`src/utils/pricing.ts`**:
  - `calculateSubtotal(items)`
  - `calculateDeliveryFee(subtotal)` (Free above $300, standard $15 fee)
  - `calculateTax(subtotal, rate)` (8% sales tax calculation)
  - `calculateOrderTotal(subtotal, fee, tax)`
  - `calculateItemTotal(price, quantity)`
- **`src/utils/currency.ts`**:
  - `formatCurrency(amount)`: Guarantees `$XX.XX` decimal formatting.
  - `formatDiscount(percentage)`: Standardized discount badge formatting.
- **`src/utils/validation.ts`**:
  - `validateAddress(address)`: Pure address validation with field-level errors.
  - `isValidZipCode(zip)`
  - `isValidPhone(phone)`
- **`src/features/order/utils/trackingFormatters.ts`**:
  - `getStatusTitle`, `getStatusDescription`, `getStatusStepIndex`, `formatEtaMinutes`, `getEstimatedDeliveryText`.

---

## 7. Animation Performance & Telemetry Architecture

### Offloading to the UI Thread:
- **`OfflineBanner`:** Uses `Animated.timing` with `useNativeDriver: true`. Animation frames execute entirely on the native UI thread, guaranteeing 60 FPS even if the JS thread is busy parsing API payloads.
- **Live Order Tracking Marker (`CourierMarker.tsx`):**
  - **Previous Flaw:** Ran an `Animated.addListener` that invoked React `setState` (`setCurrentCoord`) 60 times a second on the JS thread.
  - **Optimized Solution:** Replaced with `react-native-maps` `AnimatedRegion`. Position interpolation is computed natively without dispatching React state changes.
  - **`tracksViewChanges={false}`:** After custom marker view hierarchy settles on mount or state change, `tracksViewChanges` is disabled. This prevents Android from recapturing and rasterizing the marker bitmap on every frame, eliminating a major source of GPU lag on Android.

### Tracking State Machine:
- The telemetry provider emits updates every ~2.5 seconds.
- Redux updates **only on the 2.5s tick**, never on every animation frame.
- Smooth marker motion between the 2.5s ticks is handled purely via coordinate interpolation.

---

## 8. Image Optimization

1. **Thumbnail Prioritization:**
   - Catalog list and cart views use the backend `thumbnail` field (compact dimensions) rather than downloading full-resolution uncompressed gallery images.
2. **Predictable Bounding Boxes:**
   - Every `Image` component defines explicit width, height, and border radius in styles. This eliminates cumulative layout shift (CLS) as images download.
3. **Graceful Fallbacks & Error Boundaries:**
   - `ProductCard` and `CartItem` check for empty or broken image URLs, falling back to a structured placeholder view.

---

## 9. Resolution-Independent Vector Icons (`AppIcon.tsx`)

- Replaced heavy PNG icon assets with lightweight, scalable vector glyphs via `AppIcon.tsx`.
- Supports `'search' | 'cart' | 'back' | 'plus' | 'minus' | 'delete' | 'location' | 'retry' | 'offline' | 'success' | 'error'`.
- Eliminates multi-density PNG assets (`@2x`, `@3x`), reducing the final APK size while ensuring crisp rendering on high-DPI displays.

---

## 10. Code Splitting & Lazy Loading

- **Heavy Native Map UI (`OrderTrackingMap.tsx`):**
  - Wrapped in `React.lazy` and `React.Suspense` with a lightweight `MapSkeleton` fallback in `TrackingScreen.tsx`.
  - When the user transitions from Checkout to Order Tracking, the navigation screen transition renders immediately without being blocked by native Google Map OpenGL shader initialization and tile loading.
- **Deliberately NOT Lazy-Loaded:**
  - Common micro-components (`AppButton`, `AppIcon`, `ProductCard`, `QuantityStepper`) are bundled statically. In React Native Metro bundler, lazy-loading tiny components introduces promise-resolution latency and fragmentation without any memory benefits.

---

## 11. What Was Deliberately NOT Prematurely Optimized & Why

1. **No External Reanimated Native Library Additions:**
   - React Native 0.87.1 / React 19.2 environment relies on React Native's built-in `Animated` with `useNativeDriver: true`. Adding `react-native-reanimated` without native C++ compilation on this specific toolchain would risk ABI mismatches without providing measurable advantages over built-in native driver animations for banners and transitions.
2. **No Blind Global Component Memoization:**
   - Simple presentational components (`AppButton`, `ErrorView`, `EmptyView`) were left unmemoized. The shallow prop comparison overhead of `React.memo` exceeds the negligible render cost of these leaf nodes.
3. **No Moving Server State to Redux:**
   - Catalog queries remain exclusively inside TanStack React Query. Storing server state in Redux duplicates memory, requires manual invalidation plumbing, and breaks automatic garbage collection.

---

## 12. Quality Verification Summary

- **TypeScript (`npx tsc --noEmit`):** 0 errors.
- **ESLint (`npm run lint`):** 0 errors, 0 warnings.
- **Jest (`npm test`):** 4 test suites, 22 tests passing:
  - `__tests__/App.test.tsx`
  - `__tests__/trackingStateMachine.test.ts`
  - `__tests__/utils.test.ts` (pricing, currency, validation, tracking formatters)
  - `__tests__/network.test.ts` (NetworkService, offline error differentiation)
- **Live Device Verification:** Verified on Android `emulator-5554` (Pixel 9a):
  - Catalog browsing & infinite pagination
  - Product details navigation
  - Add to cart & quantity stepper
  - Airplane mode offline banner transition & cached catalog browsing
  - Reconnection recovery & auto-dismissal
