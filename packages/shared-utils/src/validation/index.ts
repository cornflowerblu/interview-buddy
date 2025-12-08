/**
 * Validation Utilities for Interview Buddy
 * 
 * Provides reusable validation decorators, helpers, and constraints
 * for use with class-validator in NestJS services.
 */

import { 
  registerDecorator, 
  ValidationOptions, 
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validate,
  ValidationError
} from 'class-validator';

/**
 * Validates that a file size is within acceptable limits
 * Default max: 2GB (as per spec)
 */
export function IsValidFileSize(maxSizeInBytes: number = 2 * 1024 * 1024 * 1024, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidFileSize',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [maxSizeInBytes],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [maxSize] = args.constraints;
          return typeof value === 'number' && value > 0 && value <= maxSize;
        },
        defaultMessage(args: ValidationArguments) {
          const [maxSize] = args.constraints;
          return `File size must be between 1 byte and ${Math.round(maxSize / (1024 * 1024 * 1024))}GB`;
        }
      }
    });
  };
}

/**
 * Validates that a file MIME type is supported
 * Supported formats: MP4, MOV, WebM (video), M4A, WAV (audio)
 */
export function IsValidMimeType(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidMimeType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const supportedMimeTypes = [
            'video/mp4',
            'video/quicktime',
            'video/webm',
            'audio/mp4',
            'audio/x-m4a',
            'audio/wav',
            'audio/wave',
            'audio/x-wav'
          ];
          return typeof value === 'string' && supportedMimeTypes.includes(value.toLowerCase());
        },
        defaultMessage() {
          return 'File type must be MP4, MOV, WebM, M4A, or WAV';
        }
      }
    });
  };
}

/**
 * Validates that a string is a valid UUID v4
 */
export function IsUUID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isUUID',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return typeof value === 'string' && uuidRegex.test(value);
        },
        defaultMessage() {
          return 'Value must be a valid UUID v4';
        }
      }
    });
  };
}

/**
 * Validates interview type enum
 */
@ValidatorConstraint({ name: 'isInterviewType', async: false })
export class IsInterviewTypeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const validTypes = ['behavioral', 'technical', 'phone', 'panel'];
    return typeof value === 'string' && validTypes.includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Interview type must be one of: behavioral, technical, phone, panel';
  }
}

/**
 * Validates interview status enum
 */
@ValidatorConstraint({ name: 'isInterviewStatus', async: false })
export class IsInterviewStatusConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const validStatuses = ['uploading', 'uploaded', 'transcribing', 'analyzing', 'completed', 'failed'];
    return typeof value === 'string' && validStatuses.includes(value);
  }

  defaultMessage(args: ValidationArguments) {
    return 'Interview status must be one of: uploading, uploaded, transcribing, analyzing, completed, failed';
  }
}

/**
 * Validates that a confidence score is between 0 and 1
 */
export function IsConfidenceScore(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isConfidenceScore',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'number' && value >= 0 && value <= 1;
        },
        defaultMessage() {
          return 'Confidence score must be between 0 and 1';
        }
      }
    });
  };
}

/**
 * Validates that a score is between 0 and 100
 */
export function IsScore(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isScore',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'number' && value >= 0 && value <= 100;
        },
        defaultMessage() {
          return 'Score must be between 0 and 100';
        }
      }
    });
  };
}

/**
 * Validation helper to validate any class instance
 * Returns formatted error messages
 */
export async function validateObject<T extends object>(obj: T): Promise<ValidationResult> {
  const errors = await validate(obj);
  
  if (errors.length === 0) {
    return { valid: true, errors: [] };
  }

  return {
    valid: false,
    errors: errors.map(error => formatValidationError(error))
  };
}

/**
 * Format validation error for API response
 */
export function formatValidationError(error: ValidationError): FormattedValidationError {
  return {
    property: error.property,
    value: error.value,
    constraints: error.constraints || {},
    children: error.children?.map(child => formatValidationError(child)) || []
  };
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: FormattedValidationError[];
}

/**
 * Formatted validation error interface
 */
export interface FormattedValidationError {
  property: string;
  value: any;
  constraints: { [type: string]: string };
  children: FormattedValidationError[];
}

/**
 * Helper to check if a value is a valid Firebase UID format
 */
export function isValidFirebaseUID(uid: string): boolean {
  // Firebase UIDs are typically 28 characters long and alphanumeric
  return typeof uid === 'string' && uid.length <= 128 && uid.length > 0 && /^[a-zA-Z0-9]+$/.test(uid);
}

/**
 * Helper to sanitize file names (remove special characters, limit length)
 */
export function sanitizeFileName(fileName: string): string {
  // Remove special characters except dots, hyphens, and underscores
  const sanitized = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit to 255 characters (filesystem limit)
  const maxLength = 255;
  if (sanitized.length > maxLength) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    const name = sanitized.substring(0, maxLength - ext.length);
    return name + ext;
  }
  
  return sanitized;
}

/**
 * Helper to extract file extension from filename
 */
export function getFileExtension(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.substring(lastDot + 1).toLowerCase();
}

/**
 * Helper to validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
