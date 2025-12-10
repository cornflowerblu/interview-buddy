/**
 * Unit tests for error handling utilities
 */

import {
  ApplicationError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
  ExternalServiceError,
  FileUploadError,
  FileProcessingError,
  TimeoutError,
  formatErrorResponse,
  isOperationalError,
  getStatusCode,
  wrapError,
  asyncErrorHandler,
  retry,
  CircuitBreaker,
} from '../index';

describe('Error Handling Utilities', () => {
  describe('ApplicationError', () => {
    it('should create error with all properties', () => {
      const error = new ApplicationError(
        'Test error',
        'TEST_ERROR',
        500,
        true,
        { detail: 'test' },
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(true);
      expect(error.context).toEqual({ detail: 'test' });
      expect(error.name).toBe('ApplicationError');
    });

    it('should have proper stack trace', () => {
      const error = new ApplicationError('Test error', 'TEST_ERROR');
      expect(error.stack).toBeDefined();
    });
  });

  describe('ValidationError', () => {
    it('should have correct status code and properties', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.isOperational).toBe(true);
      expect(error.context).toEqual({ field: 'email' });
    });
  });

  describe('AuthenticationError', () => {
    it('should have correct status code', () => {
      const error = new AuthenticationError();
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Authentication failed');
    });

    it('should accept custom message', () => {
      const error = new AuthenticationError('Invalid token');
      expect(error.message).toBe('Invalid token');
    });
  });

  describe('AuthorizationError', () => {
    it('should have correct status code', () => {
      const error = new AuthorizationError();
      expect(error.statusCode).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.message).toBe('Insufficient permissions');
    });
  });

  describe('NotFoundError', () => {
    it('should format message with resource and identifier', () => {
      const error = new NotFoundError('Interview', '123');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
      expect(error.message).toBe("Interview with identifier '123' not found");
    });

    it('should format message with resource only', () => {
      const error = new NotFoundError('Interview');
      expect(error.message).toBe('Interview not found');
    });
  });

  describe('ConflictError', () => {
    it('should have correct status code', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('RateLimitError', () => {
    it('should have correct status code', () => {
      const error = new RateLimitError();
      expect(error.statusCode).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(error.message).toBe('Too many requests');
    });
  });

  describe('InternalServerError', () => {
    it('should have correct status code and be non-operational', () => {
      const error = new InternalServerError();
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(error.isOperational).toBe(false);
      expect(error.message).toBe('An unexpected error occurred');
    });
  });

  describe('ServiceUnavailableError', () => {
    it('should format message with service name', () => {
      const error = new ServiceUnavailableError('transcription-service');
      expect(error.statusCode).toBe(503);
      expect(error.code).toBe('SERVICE_UNAVAILABLE');
      expect(error.message).toBe(
        "Service 'transcription-service' is unavailable",
      );
    });
  });

  describe('ExternalServiceError', () => {
    it('should format message with service and original error', () => {
      const originalError = new Error('Connection timeout');
      const error = new ExternalServiceError('Azure', originalError);
      expect(error.statusCode).toBe(502);
      expect(error.code).toBe('EXTERNAL_SERVICE_ERROR');
      expect(error.message).toContain('Azure');
      expect(error.message).toContain('Connection timeout');
      expect(error.context?.service).toBe('Azure');
    });

    it('should handle missing original error', () => {
      const error = new ExternalServiceError('Azure');
      expect(error.message).toContain('Unknown error');
    });
  });

  describe('FileUploadError', () => {
    it('should have correct status code', () => {
      const error = new FileUploadError('File too large');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('FILE_UPLOAD_ERROR');
    });
  });

  describe('FileProcessingError', () => {
    it('should have correct status code', () => {
      const error = new FileProcessingError('Failed to process video');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBe('FILE_PROCESSING_ERROR');
    });
  });

  describe('TimeoutError', () => {
    it('should format message with operation and timeout', () => {
      const error = new TimeoutError('upload', 30000);
      expect(error.statusCode).toBe(504);
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.message).toContain('upload');
      expect(error.message).toContain('30000');
      expect(error.context?.operation).toBe('upload');
      expect(error.context?.timeout).toBe(30000);
    });
  });

  describe('formatErrorResponse', () => {
    it('should format ApplicationError', () => {
      const error = new ValidationError('Invalid input', { field: 'email' });
      const response = formatErrorResponse(error, '/api/users', 'corr-123');

      expect(response.error).toBe('VALIDATION_ERROR');
      expect(response.message).toBe('Invalid input');
      expect(response.statusCode).toBe(400);
      expect(response.path).toBe('/api/users');
      expect(response.correlationId).toBe('corr-123');
      expect(response.details).toEqual({ field: 'email' });
      expect(response.timestamp).toBeDefined();
    });

    it('should format regular Error', () => {
      const error = new Error('Something went wrong');
      const response = formatErrorResponse(error);

      expect(response.error).toBe('INTERNAL_SERVER_ERROR');
      expect(response.message).toBe('Something went wrong');
      expect(response.statusCode).toBe(500);
    });

    it('should not include path or correlationId if not provided', () => {
      const error = new ValidationError('Invalid input');
      const response = formatErrorResponse(error);

      expect(response.path).toBeUndefined();
      expect(response.correlationId).toBeUndefined();
    });
  });

  describe('isOperationalError', () => {
    it('should return true for operational errors', () => {
      const error = new ValidationError('Invalid input');
      expect(isOperationalError(error)).toBe(true);
    });

    it('should return false for non-operational errors', () => {
      const error = new InternalServerError();
      expect(isOperationalError(error)).toBe(false);
    });

    it('should return false for regular errors', () => {
      const error = new Error('Something went wrong');
      expect(isOperationalError(error)).toBe(false);
    });
  });

  describe('getStatusCode', () => {
    it('should return status code from ApplicationError', () => {
      const error = new ValidationError('Invalid input');
      expect(getStatusCode(error)).toBe(400);
    });

    it('should return 500 for regular errors', () => {
      const error = new Error('Something went wrong');
      expect(getStatusCode(error)).toBe(500);
    });
  });

  describe('wrapError', () => {
    it('should return ApplicationError as-is', () => {
      const error = new ValidationError('Invalid input');
      const wrapped = wrapError(error);
      expect(wrapped).toBe(error);
    });

    it('should wrap regular Error', () => {
      const error = new Error('Something went wrong');
      const wrapped = wrapError(error);
      expect(wrapped).toBeInstanceOf(InternalServerError);
      expect(wrapped.message).toBe('Something went wrong');
    });

    it('should wrap unknown error types', () => {
      const wrapped = wrapError('string error');
      expect(wrapped).toBeInstanceOf(InternalServerError);
      expect(wrapped.message).toBe('An error occurred');
    });

    it('should use default message when wrapping unknown types', () => {
      const wrapped = wrapError(null, 'Custom default');
      expect(wrapped.message).toBe('Custom default');
    });
  });

  describe('asyncErrorHandler', () => {
    it('should pass through successful results', async () => {
      const fn = async (x: number) => x * 2;
      const wrapped = asyncErrorHandler(fn);
      const result = await wrapped(5);
      expect(result).toBe(10);
    });

    it('should wrap errors', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };
      const wrapped = asyncErrorHandler(fn);
      await expect(wrapped()).rejects.toThrow(InternalServerError);
    });

    it('should preserve ApplicationError', async () => {
      const fn = async () => {
        throw new ValidationError('Invalid input');
      };
      const wrapped = asyncErrorHandler(fn);
      await expect(wrapped()).rejects.toThrow(ValidationError);
    });
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await retry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const result = await retry(fn, { maxAttempts: 3, delayMs: 10 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));
      await expect(retry(fn, { maxAttempts: 3, delayMs: 10 })).rejects.toThrow(
        'Failed',
      );
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should call onRetry callback', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockResolvedValue('success');

      const onRetry = jest.fn();
      await retry(fn, { maxAttempts: 3, delayMs: 10, onRetry });

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onRetry).toHaveBeenCalledWith(1, expect.any(Error));
    });

    it('should use exponential backoff', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      await retry(fn, { maxAttempts: 3, delayMs: 100, backoff: 'exponential' });
      const endTime = Date.now();

      // Exponential: 100ms + 200ms = 300ms minimum
      expect(endTime - startTime).toBeGreaterThanOrEqual(290);
    });

    it('should use linear backoff', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Attempt 1'))
        .mockRejectedValueOnce(new Error('Attempt 2'))
        .mockResolvedValue('success');

      const startTime = Date.now();
      await retry(fn, { maxAttempts: 3, delayMs: 100, backoff: 'linear' });
      const endTime = Date.now();

      // Linear: 100ms + 200ms = 300ms minimum
      expect(endTime - startTime).toBeGreaterThanOrEqual(290);
    });
  });

  describe('CircuitBreaker', () => {
    it('should allow requests when closed', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const fn = jest.fn().mockResolvedValue('success');
      const result = await breaker.execute(fn);
      expect(result).toBe('success');
    });

    it('should open after threshold failures', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      for (let i = 0; i < 3; i++) {
        await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      }

      expect(breaker.getState()).toBe('OPEN');
      await expect(breaker.execute(fn)).rejects.toThrow(
        'Circuit breaker is OPEN',
      );
    });

    it('should transition to half-open after timeout', async () => {
      const breaker = new CircuitBreaker(2, 100);
      let callCount = 0;
      const fn = jest.fn().mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error('Failed'));
        }
        return Promise.resolve('success');
      });

      // Trigger failures to open circuit
      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      expect(breaker.getState()).toBe('OPEN');

      // Wait for timeout
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Next request should succeed and close circuit
      const result = await breaker.execute(fn);
      expect(result).toBe('success');
    });

    it('should reset failure count on success', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValue('success');

      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      await breaker.execute(fn);

      expect(breaker.getState()).toBe('CLOSED');
    });

    it('should allow manual reset', async () => {
      const breaker = new CircuitBreaker(2, 1000);
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));

      // Open the circuit
      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      await expect(breaker.execute(fn)).rejects.toThrow('Failed');
      expect(breaker.getState()).toBe('OPEN');

      // Reset manually
      breaker.reset();
      expect(breaker.getState()).toBe('CLOSED');
    });
  });
});
