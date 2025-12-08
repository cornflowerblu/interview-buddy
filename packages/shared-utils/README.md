# @interview-buddy/shared-utils

Shared utilities package for Interview Buddy microservices.

## Installation

```bash
npm install @interview-buddy/shared-utils
```

## Features

### Validation Utilities

Custom validation decorators and helpers for use with `class-validator`:

```typescript
import { IsValidFileSize, IsValidMimeType, validateObject } from '@interview-buddy/shared-utils';

class UploadDto {
  @IsValidFileSize(2 * 1024 * 1024 * 1024) // 2GB max
  fileSize: number;

  @IsValidMimeType()
  mimeType: string;
}

// Validate object
const result = await validateObject(uploadDto);
if (!result.valid) {
  console.error(result.errors);
}
```

### Logging Utilities

Structured logging with context, correlation IDs, and distributed tracing support:

```typescript
import { createLogger, LogLevel } from '@interview-buddy/shared-utils';

const logger = createLogger({
  serviceName: 'upload-service',
  environment: 'production',
  minLevel: LogLevel.INFO
});

logger.info('File uploaded successfully', {
  userId: '123',
  interviewId: '456',
  fileSize: 1024000
});

// Create child logger with persistent context
const childLogger = logger.child({ userId: '123' });
childLogger.info('Processing started'); // userId automatically included
```

### Error Handling Utilities

Custom error classes and error handling helpers:

```typescript
import {
  ValidationError,
  NotFoundError,
  formatErrorResponse,
  retry,
  CircuitBreaker
} from '@interview-buddy/shared-utils';

// Throw custom errors
throw new ValidationError('Invalid file format', { fileName: 'test.txt' });
throw new NotFoundError('Interview', interviewId);

// Retry failed operations
const result = await retry(
  () => uploadToAzure(file),
  {
    maxAttempts: 3,
    delayMs: 1000,
    backoff: 'exponential',
    onRetry: (attempt, error) => {
      logger.warn(`Retry attempt ${attempt}`, { error: error.message });
    }
  }
);

// Circuit breaker for external services
const breaker = new CircuitBreaker(5, 60000);
const data = await breaker.execute(() => callExternalApi());
```

## API Reference

### Validation

- `IsValidFileSize(maxSizeInBytes)` - Validates file size
- `IsValidMimeType()` - Validates MIME type for supported formats
- `IsUUID()` - Validates UUID v4 format
- `IsConfidenceScore()` - Validates score between 0 and 1
- `IsScore()` - Validates score between 0 and 100
- `validateObject(obj)` - Validates class-validator decorated objects
- `sanitizeFileName(fileName)` - Sanitizes file names
- `isValidFirebaseUID(uid)` - Validates Firebase UID format

### Logging

- `createLogger(config)` - Creates a logger instance
- `Logger.debug/info/warn/error/fatal()` - Log methods
- `Logger.child(context)` - Create child logger with context
- `generateCorrelationId()` - Generate correlation ID
- `extractCorrelationId(headers)` - Extract correlation ID from headers

### Error Handling

Error classes:
- `ValidationError` - 400
- `AuthenticationError` - 401
- `AuthorizationError` - 403
- `NotFoundError` - 404
- `ConflictError` - 409
- `RateLimitError` - 429
- `InternalServerError` - 500
- `ServiceUnavailableError` - 503
- `ExternalServiceError` - 502
- `FileUploadError` - 400
- `FileProcessingError` - 500
- `TimeoutError` - 504

Utilities:
- `formatErrorResponse(error, path, correlationId)` - Format error for API
- `isOperationalError(error)` - Check if error is operational
- `retry(fn, options)` - Retry failed operations
- `CircuitBreaker` - Circuit breaker pattern implementation

## License

UNLICENSED
