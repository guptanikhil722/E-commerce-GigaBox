import { logger as createRNLogger, consoleTransport } from 'react-native-logs';

/**
 * Centralized Application Logger
 * Uses react-native-logs to provide structured logging with log levels:
 * debug, info, warn, error.
 *
 * In production (__DEV__ === false), debug and info levels can be suppressed
 * to minimize runtime overhead and prevent log pollution.
 */

const isDevelopment = __DEV__;

const config = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  },
  severity: isDevelopment ? 'debug' : 'warn',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      debug: 'blueBright',
      info: 'greenBright',
      warn: 'yellowBright',
      error: 'redBright',
    } as const,
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: isDevelopment,
  enabled: true,
};

const rnLogger = createRNLogger.createLogger(config);

/**
 * Filter sensitive properties before logging
 */
const sanitizeData = (data: unknown): unknown => {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  const SENSITIVE_KEYS = [
    'password',
    'token',
    'authorization',
    'auth',
    'secret',
    'creditcard',
    'cardNumber',
    'cvv',
  ];

  try {
    const copy = Array.isArray(data) ? [...data] : { ...(data as Record<string, unknown>) };
    for (const key of Object.keys(copy)) {
      if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive))) {
        (copy as Record<string, unknown>)[key] = '[REDACTED]';
      } else if (typeof (copy as Record<string, unknown>)[key] === 'object') {
        (copy as Record<string, unknown>)[key] = sanitizeData(
          (copy as Record<string, unknown>)[key],
        );
      }
    }
    return copy;
  } catch {
    return '[Unserializable Data]';
  }
};

export const logger = {
  debug: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      rnLogger.debug(message, ...args.map(sanitizeData));
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      rnLogger.info(message, ...args.map(sanitizeData));
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    rnLogger.warn(message, ...args.map(sanitizeData));
  },
  error: (message: string, error?: unknown, ...args: unknown[]) => {
    rnLogger.error(message, sanitizeData(error), ...args.map(sanitizeData));
  },
};

export default logger;
