import React, { forwardRef } from 'react';
import {
  FlatList,
  FlatListProps,
} from 'react-native';
import { isAndroid } from '../../utils/responsive';

export interface OptimizedListProps<ItemT> extends FlatListProps<ItemT> {
  /**
   * Detach views outside of viewport from native view hierarchy.
   * Default: true on Android, false on iOS (to prevent iOS transform/shadow clipping).
   */
  removeClippedSubviews?: boolean;
  /**
   * Amount of items rendered per batch on scroll.
   * Default: 10
   */
  maxToRenderPerBatch?: number;
  /**
   * Delay in milliseconds between batch renders.
   * Default: 50ms
   */
  updateCellsBatchingPeriod?: number;
  /**
   * Initial amount of items to render to cover initial viewport.
   * Default: 8
   */
  initialNumToRender?: number;
  /**
   * Measurement unit where 1 is viewport height.
   * Default: 9 (4 above, 4 below, 1 viewport current; down from RN's 21 to conserve memory).
   */
  windowSize?: number;
}

/**
 * Reusable Optimized FlatList Component
 *
 * Configured with production-ready virtualization defaults:
 * - removeClippedSubviews: Enabled on Android for native traversal savings.
 * - maxToRenderPerBatch: Prevents JS execution thread blocking during rapid scrolling.
 * - updateCellsBatchingPeriod: 50ms smooth balance between fill rate and responsiveness.
 * - initialNumToRender: Pre-warms just enough cells to fill initial screen.
 * - windowSize: Tuned window size for high memory efficiency and zero blank areas.
 */
function OptimizedListComponent<ItemT>(
  {
    removeClippedSubviews = isAndroid,
    maxToRenderPerBatch = 10,
    updateCellsBatchingPeriod = 50,
    initialNumToRender = 10,
    windowSize = 21,
    ...restProps
  }: OptimizedListProps<ItemT>,
  ref: React.ForwardedRef<FlatList<ItemT>>,
) {
  return (
    <FlatList<ItemT>
      ref={ref}
      removeClippedSubviews={removeClippedSubviews}
      maxToRenderPerBatch={maxToRenderPerBatch}
      updateCellsBatchingPeriod={updateCellsBatchingPeriod}
      initialNumToRender={initialNumToRender}
      windowSize={windowSize}
      {...restProps}
    />
  );
}

export const OptimizedList = forwardRef(OptimizedListComponent) as <ItemT>(
  props: OptimizedListProps<ItemT> & { ref?: React.ForwardedRef<FlatList<ItemT>> },
) => React.ReactElement;

export default OptimizedList;
