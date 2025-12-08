/**
 * Unit tests for validation utilities
 */

import {
  IsValidFileSize,
  IsValidMimeType,
  IsUUID,
  IsConfidenceScore,
  IsScore,
  validateObject,
  sanitizeFileName,
  isValidFirebaseUID,
  getFileExtension,
  isValidEmail,
  IsInterviewTypeConstraint,
  IsInterviewStatusConstraint
} from '../index';
import { validate } from 'class-validator';

class TestFileSizeDto {
  @IsValidFileSize()
  fileSize!: number;
}

class TestMimeTypeDto {
  @IsValidMimeType()
  mimeType!: string;
}

class TestUUIDDto {
  @IsUUID()
  id!: string;
}

class TestConfidenceScoreDto {
  @IsConfidenceScore()
  score!: number;
}

class TestScoreDto {
  @IsScore()
  score!: number;
}

describe('Validation Utilities', () => {
  describe('IsValidFileSize', () => {
    it('should accept valid file sizes', async () => {
      const dto = new TestFileSizeDto();
      dto.fileSize = 1024 * 1024; // 1MB
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject file size of 0', async () => {
      const dto = new TestFileSizeDto();
      dto.fileSize = 0;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject negative file sizes', async () => {
      const dto = new TestFileSizeDto();
      dto.fileSize = -1;
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should reject file sizes exceeding 2GB', async () => {
      const dto = new TestFileSizeDto();
      dto.fileSize = 3 * 1024 * 1024 * 1024; // 3GB
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should accept file size exactly at 2GB limit', async () => {
      const dto = new TestFileSizeDto();
      dto.fileSize = 2 * 1024 * 1024 * 1024; // 2GB
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('IsValidMimeType', () => {
    it('should accept valid video MIME types', async () => {
      const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
      
      for (const mimeType of validTypes) {
        const dto = new TestMimeTypeDto();
        dto.mimeType = mimeType;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should accept valid audio MIME types', async () => {
      const validTypes = ['audio/mp4', 'audio/x-m4a', 'audio/wav', 'audio/wave', 'audio/x-wav'];
      
      for (const mimeType of validTypes) {
        const dto = new TestMimeTypeDto();
        dto.mimeType = mimeType;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject invalid MIME types', async () => {
      const invalidTypes = ['video/avi', 'audio/mp3', 'application/pdf', 'text/plain'];
      
      for (const mimeType of invalidTypes) {
        const dto = new TestMimeTypeDto();
        dto.mimeType = mimeType;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });

    it('should be case insensitive', async () => {
      const dto = new TestMimeTypeDto();
      dto.mimeType = 'VIDEO/MP4';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });
  });

  describe('IsUUID', () => {
    it('should accept valid UUID v4', async () => {
      const dto = new TestUUIDDto();
      dto.id = '550e8400-e29b-41d4-a716-446655440000';
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should reject invalid UUID format', async () => {
      const invalidIds = [
        '123',
        'not-a-uuid',
        '550e8400-e29b-41d4-a716',
        '550e8400-e29b-51d4-a716-446655440000' // v5, not v4
      ];

      for (const id of invalidIds) {
        const dto = new TestUUIDDto();
        dto.id = id;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('IsConfidenceScore', () => {
    it('should accept scores between 0 and 1', async () => {
      const validScores = [0, 0.5, 0.75, 1];
      
      for (const score of validScores) {
        const dto = new TestConfidenceScoreDto();
        dto.score = score;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject scores outside 0-1 range', async () => {
      const invalidScores = [-0.1, 1.1, 100];
      
      for (const score of invalidScores) {
        const dto = new TestConfidenceScoreDto();
        dto.score = score;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('IsScore', () => {
    it('should accept scores between 0 and 100', async () => {
      const validScores = [0, 50, 75, 100];
      
      for (const score of validScores) {
        const dto = new TestScoreDto();
        dto.score = score;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
      }
    });

    it('should reject scores outside 0-100 range', async () => {
      const invalidScores = [-1, 101, 200];
      
      for (const score of invalidScores) {
        const dto = new TestScoreDto();
        dto.score = score;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
      }
    });
  });

  describe('IsInterviewTypeConstraint', () => {
    it('should accept valid interview types', () => {
      const constraint = new IsInterviewTypeConstraint();
      const validTypes = ['behavioral', 'technical', 'phone', 'panel'];
      
      for (const type of validTypes) {
        expect(constraint.validate(type, {} as any)).toBe(true);
      }
    });

    it('should reject invalid interview types', () => {
      const constraint = new IsInterviewTypeConstraint();
      const invalidTypes = ['coding', 'screening', 'invalid', ''];
      
      for (const type of invalidTypes) {
        expect(constraint.validate(type, {} as any)).toBe(false);
      }
    });
  });

  describe('IsInterviewStatusConstraint', () => {
    it('should accept valid interview statuses', () => {
      const constraint = new IsInterviewStatusConstraint();
      const validStatuses = ['uploading', 'uploaded', 'transcribing', 'analyzing', 'completed', 'failed'];
      
      for (const status of validStatuses) {
        expect(constraint.validate(status, {} as any)).toBe(true);
      }
    });

    it('should reject invalid interview statuses', () => {
      const constraint = new IsInterviewStatusConstraint();
      const invalidStatuses = ['pending', 'processing', 'invalid', ''];
      
      for (const status of invalidStatuses) {
        expect(constraint.validate(status, {} as any)).toBe(false);
      }
    });
  });

  describe('validateObject', () => {
    it('should return valid result for valid object', async () => {
      const dto = new TestFileSizeDto();
      dto.fileSize = 1024;
      const result = await validateObject(dto);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return invalid result with formatted errors', async () => {
      const dto = new TestFileSizeDto();
      dto.fileSize = -1;
      const result = await validateObject(dto);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toHaveProperty('property');
      expect(result.errors[0]).toHaveProperty('constraints');
    });
  });

  describe('sanitizeFileName', () => {
    it('should remove special characters', () => {
      expect(sanitizeFileName('test@file#name.txt')).toBe('test_file_name.txt');
      expect(sanitizeFileName('file with spaces.mp4')).toBe('file_with_spaces.mp4');
    });

    it('should preserve dots, hyphens, and underscores', () => {
      expect(sanitizeFileName('test-file_name.v2.txt')).toBe('test-file_name.v2.txt');
    });

    it('should truncate long filenames', () => {
      const longName = 'a'.repeat(300) + '.txt';
      const result = sanitizeFileName(longName);
      expect(result.length).toBeLessThanOrEqual(255);
      expect(result.endsWith('.txt')).toBe(true);
    });

    it('should handle filenames without extensions', () => {
      expect(sanitizeFileName('test@file#name')).toBe('test_file_name');
    });
  });

  describe('isValidFirebaseUID', () => {
    it('should accept valid Firebase UIDs', () => {
      expect(isValidFirebaseUID('abc123XYZ')).toBe(true);
      expect(isValidFirebaseUID('1234567890123456789012345678')).toBe(true);
    });

    it('should reject empty strings', () => {
      expect(isValidFirebaseUID('')).toBe(false);
    });

    it('should reject UIDs with special characters', () => {
      expect(isValidFirebaseUID('abc-123')).toBe(false);
      expect(isValidFirebaseUID('abc@123')).toBe(false);
      expect(isValidFirebaseUID('abc 123')).toBe(false);
    });

    it('should reject UIDs longer than 128 characters', () => {
      const longUid = 'a'.repeat(129);
      expect(isValidFirebaseUID(longUid)).toBe(false);
    });
  });

  describe('getFileExtension', () => {
    it('should extract file extension', () => {
      expect(getFileExtension('file.txt')).toBe('txt');
      expect(getFileExtension('video.mp4')).toBe('mp4');
      expect(getFileExtension('archive.tar.gz')).toBe('gz');
    });

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('README')).toBe('');
      expect(getFileExtension('file')).toBe('');
    });

    it('should be case insensitive', () => {
      expect(getFileExtension('FILE.TXT')).toBe('txt');
      expect(getFileExtension('Video.MP4')).toBe('mp4');
    });
  });

  describe('isValidEmail', () => {
    it('should accept valid email addresses', () => {
      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com'
      ];

      for (const email of validEmails) {
        expect(isValidEmail(email)).toBe(true);
      }
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
        ''
      ];

      for (const email of invalidEmails) {
        expect(isValidEmail(email)).toBe(false);
      }
    });
  });
});
