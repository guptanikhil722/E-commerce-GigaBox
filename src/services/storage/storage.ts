import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../logger';

/**
 * Storage Abstraction Layer
 * Wraps AsyncStorage with type-safe operations, JSON serialization,
 * defensive error handling, and in-memory fallback.
 */

class StorageService {
  private memoryFallback = new Map<string, string>();

  /**
   * Retrieve and deserialize a stored JSON value.
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      let raw: string | null = null;
      try {
        raw = await AsyncStorage.getItem(key);
      } catch (nativeErr) {
        logger.warn(`StorageService: AsyncStorage.getItem failed for "${key}", falling back to memory`, {
          error: nativeErr instanceof Error ? nativeErr.message : String(nativeErr),
        });
        raw = this.memoryFallback.get(key) || null;
      }

      if (!raw) {
        return null;
      }

      try {
        return JSON.parse(raw) as T;
      } catch (parseErr) {
        logger.error(`StorageService: Failed to parse stored JSON for "${key}"`, {
          error: parseErr instanceof Error ? parseErr.message : String(parseErr),
        });
        return null;
      }
    } catch (err) {
      logger.error(`StorageService: Unexpected error reading key "${key}"`, {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  /**
   * Serialize and persist a value.
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      this.memoryFallback.set(key, serialized);

      try {
        await AsyncStorage.setItem(key, serialized);
      } catch (nativeErr) {
        logger.warn(`StorageService: AsyncStorage.setItem failed for "${key}", saved in memory fallback`, {
          error: nativeErr instanceof Error ? nativeErr.message : String(nativeErr),
        });
      }
    } catch (err) {
      logger.error(`StorageService: Failed to persist key "${key}"`, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Remove a specific key.
   */
  async removeItem(key: string): Promise<void> {
    try {
      this.memoryFallback.delete(key);
      try {
        await AsyncStorage.removeItem(key);
      } catch (nativeErr) {
        logger.warn(`StorageService: AsyncStorage.removeItem failed for "${key}"`, {
          error: nativeErr instanceof Error ? nativeErr.message : String(nativeErr),
        });
      }
    } catch (err) {
      logger.error(`StorageService: Error removing key "${key}"`, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Clear all stored storage entries.
   */
  async clear(): Promise<void> {
    try {
      this.memoryFallback.clear();
      try {
        await AsyncStorage.clear();
      } catch (nativeErr) {
        logger.warn('StorageService: AsyncStorage.clear failed', {
          error: nativeErr instanceof Error ? nativeErr.message : String(nativeErr),
        });
      }
    } catch (err) {
      logger.error('StorageService: Error clearing storage', {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}

export const storage = new StorageService();
export default storage;
