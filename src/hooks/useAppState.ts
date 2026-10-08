import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { logger } from '../services/logger';

export interface UseAppStateOptions {
  onForeground?: () => void;
  onBackground?: () => void;
}

/**
 * Hook to monitor application lifecycle state changes (active, background, inactive).
 * Enables seamless resynchronization of time-based simulation states.
 */
export function useAppState(options?: UseAppStateOptions): AppStateStatus {
  const initialStatus: AppStateStatus =
    (AppState.currentState ?? 'active') as AppStateStatus;
  const [appState, setAppState] = useState<AppStateStatus>(initialStatus);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const prevStateRef = useRef<AppStateStatus>(initialStatus);

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        const prevState = prevStateRef.current;

        if (
          prevState.match(/inactive|background/) &&
          nextState === 'active'
        ) {
          logger.info('useAppState: App entered foreground (active)');
          optionsRef.current?.onForeground?.();
        } else if (
          prevState === 'active' &&
          nextState.match(/inactive|background/)
        ) {
          logger.info('useAppState: App entered background/inactive');
          optionsRef.current?.onBackground?.();
        }

        prevStateRef.current = nextState;
        setAppState(nextState);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return appState;
}

export default useAppState;
