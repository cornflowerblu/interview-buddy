# @interview-buddy/shared-types

Shared TypeScript type definitions for Interview Buddy microservices.

## Installation

```bash
npm install @interview-buddy/shared-types
```

## Features

This package provides type-safe interfaces for:

1. **Event Payloads** - Event types for Redis Streams communication between microservices
2. **API Contracts** - Request/response types for REST APIs
3. **Domain Entities** - Core business entities (Interview, Transcription, Analysis, PrepSession)

## Usage

### Event Types

Use these types when publishing or consuming events via Redis Streams:

```typescript
import { 
  InterviewUploadedEvent, 
  InterviewTranscribedEvent,
  AnalysisCompletedEvent,
  EventNames 
} from '@interview-buddy/shared-types';

// Publishing an event
const event: InterviewUploadedEvent = {
  interviewId: '123',
  userId: 'user-456',
  blobUrl: 'https://...',
  fileName: 'interview.mp4',
  fileSize: 1024000,
  uploadedAt: new Date()
};

await eventEmitter.emit(EventNames.INTERVIEW_UPLOADED, event);

// Consuming an event
@EventPattern(EventNames.INTERVIEW_UPLOADED)
async handleUpload(data: InterviewUploadedEvent) {
  // Type-safe event handling
  console.log(`Processing interview ${data.interviewId}`);
}
```

### API Contract Types

Use these types for REST API requests and responses:

```typescript
import {
  CreateUploadRequest,
  CreateUploadResponse,
  InterviewDetailsResponse,
  ListInterviewsRequest
} from '@interview-buddy/shared-types';

// In NestJS controller
@Post('/uploads')
async createUpload(@Body() request: CreateUploadRequest): Promise<CreateUploadResponse> {
  return {
    interviewId: '123',
    uploadId: 'upload-456',
    uploadUrl: 'https://...',
    expiresAt: new Date().toISOString()
  };
}

@Get('/interviews')
async listInterviews(@Query() query: ListInterviewsRequest): Promise<ListInterviewsResponse> {
  // Type-safe query parameters
  const { page = 1, limit = 20, status } = query;
  // ...
}
```

### Domain Entity Types

Use these types for database entities and business logic:

```typescript
import {
  Interview,
  Transcription,
  Analysis,
  InterviewType,
  InterviewUploadStatus
} from '@interview-buddy/shared-types';

const interview: Interview = {
  id: '123',
  userId: 'user-456',
  uploadId: 'upload-789',
  company: 'Acme Corp',
  jobTitle: 'Software Engineer',
  interviewType: 'technical' as InterviewType,
  status: 'uploaded' as InterviewUploadStatus,
  blobUrl: 'https://...',
  fileSize: 1024000,
  createdAt: new Date(),
  updatedAt: new Date()
};
```

## Type Categories

### Events (`/events`)

- `InterviewUploadedEvent` - Emitted when upload completes
- `InterviewTranscribedEvent` - Emitted when transcription completes
- `AnalysisCompletedEvent` - Emitted when AI analysis completes
- `ProcessingFailedEvent` - Emitted when processing fails
- `EventNames` - Constant object with event name strings

### API Contracts (`/api`)

**Request Types:**
- `CreateUploadRequest`
- `UpdateUploadProgressRequest`
- `UpdateInterviewRequest`
- `ListInterviewsRequest`

**Response Types:**
- `CreateUploadResponse`
- `InterviewStatusResponse`
- `InterviewDetailsResponse`
- `TranscriptionResponse`
- `AnalysisResponse`
- `ListInterviewsResponse`
- `ErrorResponse`
- `HealthCheckResponse`

### Domain Entities (root)

- `Interview` - Main interview entity
- `Transcription` - Interview transcription
- `Analysis` - AI analysis results
- `PrepSession` - Pre-interview preparation
- Type unions: `InterviewType`, `InterviewUploadStatus`

## License

UNLICENSED
