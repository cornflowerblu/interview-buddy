/**
 * Logging Utilities for Interview Buddy
 * 
 * Provides structured logging with context, correlation IDs, and distributed tracing support.
 * Designed for use across all microservices with consistent log format.
 */

/**
 * Log levels following standard severity levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Log context interface for structured logging
 */
export interface LogContext {
  service: string;
  correlationId?: string;
  userId?: string;
  interviewId?: string;
  traceId?: string;
  spanId?: string;
  [key: string]: any;
}

/**
 * Log entry interface
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context: LogContext;
  error?: ErrorDetails;
}

/**
 * Error details for structured error logging
 */
export interface ErrorDetails {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  [key: string]: any;
}

/**
 * Logger configuration
 */
export interface LoggerConfig {
  serviceName: string;
  environment?: string;
  minLevel?: LogLevel;
  prettyPrint?: boolean;
}

/**
 * Structured logger class
 */
export class Logger {
  private serviceName: string;
  private environment: string;
  private minLevel: LogLevel;
  private prettyPrint: boolean;
  private context: Partial<LogContext>;

  constructor(config: LoggerConfig) {
    this.serviceName = config.serviceName;
    this.environment = config.environment || process.env.NODE_ENV || 'development';
    this.minLevel = config.minLevel || LogLevel.INFO;
    this.prettyPrint = config.prettyPrint ?? (this.environment === 'development');
    this.context = {};
  }

  /**
   * Set persistent context for all log entries
   */
  setContext(context: Partial<LogContext>): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear persistent context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Create a child logger with additional context
   */
  child(context: Partial<LogContext>): Logger {
    const childLogger = new Logger({
      serviceName: this.serviceName,
      environment: this.environment,
      minLevel: this.minLevel,
      prettyPrint: this.prettyPrint
    });
    childLogger.setContext({ ...this.context, ...context });
    return childLogger;
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Partial<LogContext>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Log info message
   */
  info(message: string, context?: Partial<LogContext>): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Partial<LogContext>): void {
    this.log(LogLevel.WARN, message, context);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Partial<LogContext>): void {
    const errorDetails = error ? this.formatError(error) : undefined;
    this.log(LogLevel.ERROR, message, context, errorDetails);
  }

  /**
   * Log fatal error message (system crash)
   */
  fatal(message: string, error?: Error, context?: Partial<LogContext>): void {
    const errorDetails = error ? this.formatError(error) : undefined;
    this.log(LogLevel.FATAL, message, context, errorDetails);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    additionalContext?: Partial<LogContext>,
    error?: ErrorDetails
  ): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: {
        service: this.serviceName,
        environment: this.environment,
        ...this.context,
        ...additionalContext
      },
      ...(error && { error })
    };

    if (this.prettyPrint) {
      this.prettyPrintLog(logEntry);
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  /**
   * Check if log level should be logged based on min level
   */
  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const currentLevelIndex = levels.indexOf(level);
    const minLevelIndex = levels.indexOf(this.minLevel);
    return currentLevelIndex >= minLevelIndex;
  }

  /**
   * Format error for logging
   */
  private formatError(error: Error): ErrorDetails {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...(error as any).code && { code: (error as any).code }
    };
  }

  /**
   * Pretty print log entry for development
   */
  private prettyPrintLog(entry: LogEntry): void {
    const levelColors: Record<LogLevel, string> = {
      [LogLevel.DEBUG]: '\x1b[36m',   // Cyan
      [LogLevel.INFO]: '\x1b[32m',    // Green
      [LogLevel.WARN]: '\x1b[33m',    // Yellow
      [LogLevel.ERROR]: '\x1b[31m',   // Red
      [LogLevel.FATAL]: '\x1b[35m'    // Magenta
    };
    const reset = '\x1b[0m';
    const color = levelColors[entry.level];

    console.log(
      `${color}[${entry.timestamp}] [${entry.level.toUpperCase()}] [${entry.context.service}]${reset}`,
      entry.message
    );

    if (Object.keys(entry.context).length > 2) {
      console.log('  Context:', JSON.stringify(entry.context, null, 2));
    }

    if (entry.error) {
      console.log('  Error:', JSON.stringify(entry.error, null, 2));
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(config: LoggerConfig): Logger {
  return new Logger(config);
}

/**
 * Generate a correlation ID for request tracing
 */
export function generateCorrelationId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Extract correlation ID from request headers
 */
export function extractCorrelationId(headers: Record<string, string | string[] | undefined>): string | undefined {
  const correlationId = headers['x-correlation-id'] || headers['X-Correlation-ID'];
  if (Array.isArray(correlationId)) {
    return correlationId[0];
  }
  return correlationId;
}

/**
 * Default logger instance for simple use cases
 * Should be configured at application startup
 */
let defaultLoggerInstance: Logger | null = null;

/**
 * Configure and set the default logger
 */
export function configureDefaultLogger(config: LoggerConfig): void {
  defaultLoggerInstance = createLogger(config);
}

/**
 * Get the default logger instance
 */
export function getDefaultLogger(): Logger {
  if (!defaultLoggerInstance) {
    throw new Error('Default logger not configured. Call configureDefaultLogger() first.');
  }
  return defaultLoggerInstance;
}

/**
 * Convenience functions using default logger
 */
export const log = {
  debug: (message: string, context?: Partial<LogContext>) => 
    getDefaultLogger().debug(message, context),
  info: (message: string, context?: Partial<LogContext>) => 
    getDefaultLogger().info(message, context),
  warn: (message: string, context?: Partial<LogContext>) => 
    getDefaultLogger().warn(message, context),
  error: (message: string, error?: Error, context?: Partial<LogContext>) => 
    getDefaultLogger().error(message, error, context),
  fatal: (message: string, error?: Error, context?: Partial<LogContext>) => 
    getDefaultLogger().fatal(message, error, context)
};
