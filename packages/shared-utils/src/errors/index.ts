/**
 * Error Handling Utilities for Interview Buddy
 * 
 * Provides custom error classes, error formatters, and HTTP exception helpers
 * for consistent error handling across all microservices.
 */

/**
 * Base application error class
 */
export class ApplicationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error - for invalid input data
 */
export class ValidationError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
  }
}

/**
 * Authentication error - for authentication failures
 */
export class AuthenticationError extends ApplicationError {
  constructor(message: string = 'Authentication failed', context?: Record<string, any>) {
    super(message, 'AUTHENTICATION_ERROR', 401, true, context);
  }
}

/**
 * Authorization error - for insufficient permissions
 */
export class AuthorizationError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, 'AUTHORIZATION_ERROR', 403, true, context);
  }
}

/**
 * Not found error - for missing resources
 */
export class NotFoundError extends ApplicationError {
  constructor(resource: string, identifier?: string, context?: Record<string, any>) {
    const message = identifier 
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, true, context);
  }
}

/**
 * Conflict error - for resource conflicts
 */
export class ConflictError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'CONFLICT', 409, true, context);
  }
}

/**
 * Rate limit error - for too many requests
 */
export class RateLimitError extends ApplicationError {
  constructor(message: string = 'Too many requests', context?: Record<string, any>) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, true, context);
  }
}

/**
 * Internal server error - for unexpected errors
 */
export class InternalServerError extends ApplicationError {
  constructor(message: string = 'An unexpected error occurred', context?: Record<string, any>) {
    super(message, 'INTERNAL_SERVER_ERROR', 500, false, context);
  }
}

/**
 * Service unavailable error - for service dependencies
 */
export class ServiceUnavailableError extends ApplicationError {
  constructor(service: string, context?: Record<string, any>) {
    super(`Service '${service}' is unavailable`, 'SERVICE_UNAVAILABLE', 503, true, context);
  }
}

/**
 * External service error - for third-party API failures
 */
export class ExternalServiceError extends ApplicationError {
  constructor(service: string, originalError?: Error, context?: Record<string, any>) {
    const message = `External service '${service}' error: ${originalError?.message || 'Unknown error'}`;
    super(message, 'EXTERNAL_SERVICE_ERROR', 502, true, {
      ...context,
      service,
      originalError: originalError?.message
    });
  }
}

/**
 * File upload error - for file upload failures
 */
export class FileUploadError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'FILE_UPLOAD_ERROR', 400, true, context);
  }
}

/**
 * File processing error - for file processing failures
 */
export class FileProcessingError extends ApplicationError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'FILE_PROCESSING_ERROR', 500, true, context);
  }
}

/**
 * Timeout error - for operation timeouts
 */
export class TimeoutError extends ApplicationError {
  constructor(operation: string, timeout: number, context?: Record<string, any>) {
    super(
      `Operation '${operation}' timed out after ${timeout}ms`,
      'TIMEOUT_ERROR',
      504,
      true,
      { ...context, operation, timeout }
    );
  }
}

/**
 * Error response format for API responses
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  path?: string;
  correlationId?: string;
  details?: Record<string, any>;
}

/**
 * Format an error for API response
 */
export function formatErrorResponse(
  error: Error | ApplicationError,
  path?: string,
  correlationId?: string
): ErrorResponse {
  const isApplicationError = error instanceof ApplicationError;
  
  return {
    error: isApplicationError ? error.code : 'INTERNAL_SERVER_ERROR',
    message: error.message,
    statusCode: isApplicationError ? error.statusCode : 500,
    timestamp: new Date().toISOString(),
    ...(path && { path }),
    ...(correlationId && { correlationId }),
    ...(isApplicationError && error.context && { details: error.context })
  };
}

/**
 * Check if error is operational (expected) or programming error
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof ApplicationError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Extract status code from error
 */
export function getStatusCode(error: Error | ApplicationError): number {
  if (error instanceof ApplicationError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * Wrap unknown errors into ApplicationError
 */
export function wrapError(error: unknown, defaultMessage: string = 'An error occurred'): ApplicationError {
  if (error instanceof ApplicationError) {
    return error;
  }
  
  if (error instanceof Error) {
    return new InternalServerError(error.message || defaultMessage, {
      originalError: error.name,
      stack: error.stack
    });
  }
  
  return new InternalServerError(defaultMessage, {
    originalError: String(error)
  });
}

/**
 * Error handler for async functions
 * Catches errors and converts them to ApplicationError
 */
export function asyncErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      throw wrapError(error);
    }
  };
}

/**
 * Retry helper for operations that might fail temporarily
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delayMs?: number;
    backoff?: 'linear' | 'exponential';
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoff = 'exponential',
    onRetry
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        break;
      }

      if (onRetry) {
        onRetry(attempt, lastError);
      }

      const delay = backoff === 'exponential' 
        ? delayMs * Math.pow(2, attempt - 1)
        : delayMs * attempt;

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Circuit breaker state
 */
enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

/**
 * Simple circuit breaker implementation
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,
    private resetTimeout: number = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new ServiceUnavailableError('Circuit breaker is OPEN');
      }
      this.state = CircuitState.HALF_OPEN;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= 2) {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
      }
    }
  }

  private onFailure(): void {
    this.failureCount++;
    this.successCount = 0;

    if (this.failureCount >= this.threshold) {
      this.state = CircuitState.OPEN;
      this.nextAttempt = Date.now() + this.timeout;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
  }
}
