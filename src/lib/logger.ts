/**
 * Production-safe logging utility.
 * Debug logs are only output in development environments.
 * Errors are always logged (and could be sent to an error tracking service in the future).
 */

const isProduction = import.meta.env.PROD;

export const logger = {
  /**
   * General logging - only outputs in development
   */
  log: (...args: unknown[]) => {
    if (!isProduction) {
      console.log(...args);
    }
  },

  /**
   * Warning logging - only outputs in development
   */
  warn: (...args: unknown[]) => {
    if (!isProduction) {
      console.warn(...args);
    }
  },

  /**
   * Error logging - always outputs (errors should be visible for debugging)
   * In the future, this could also send to an error tracking service
   */
  error: (...args: unknown[]) => {
    // Errors are always logged as they indicate real issues
    // In production, you might want to send these to Sentry/LogRocket/etc.
    console.error(...args);
  },

  /**
   * Debug logging - only outputs in development
   */
  debug: (...args: unknown[]) => {
    if (!isProduction) {
      console.debug(...args);
    }
  },
};
