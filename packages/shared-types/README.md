# @interview-buddy/shared-types

Shared TypeScript type definitions for Interview Buddy microservices.

## Installation

This is a workspace package. Install dependencies from the root:

```bash
# From repository root
npm install
```

## Features

This package provides type-safe interfaces for:

1. **Event Payloads** - Event types for Redis Streams communication between microservices
2. **API Contracts** - Request/response types for REST APIs
3. **Domain Entities** - Core business entities (Interview, Transcription, Analysis, PrepSession, User)

All types are aligned with the Prisma schema and follow the event-driven architecture patterns.

## Usage

### Importing Types

You can import from the main entry point or specific sub-modules:

```typescript
// Import everything
import { Interview, InterviewType, CreateUploadRequest } from '@interview-buddy/shared-types';

// Import only events
import { InterviewUploadedEvent, EventNames } from '@interview-buddy/shared-types/events';

// Import only API types
import { CreateUploadRequest, ErrorResponse } from '@interview-buddy/shared-types/api';
```

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
  videoIndexerUrl: 'https://vi.azure.com/video/xyz',
  metadata: {
    company: 'Acme Corp',
    jobTitle: 'Software Engineer',
    interviewType: 'technical'
  },
  timestamp: new Date()
};

await eventEmitter.emit(EventNames.INTERVIEW_UPLOADED, event);

// Consuming an event
@EventPattern(EventNames.INTERVIEW_UPLOADED)
async handleUpload(data: InterviewUploadedEvent) {
  // Type-safe event handling
  console.log(`Processing interview ${data.interviewId} for ${data.metadata.company}`);
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

Use these types for database entities and business logic. These align with the Prisma schema:

```typescript
import {
  Interview,
  Transcription,
  Analysis,
  PrepSession,
  User,
  InterviewType,
  InterviewUploadStatus
} from '@interview-buddy/shared-types';

// Interview entity (aligned with Prisma schema)
const interview: Interview = {
  id: 'cuid123',
  userId: 'firebase-uid-456',
  company: 'Acme Corp',
  jobTitle: 'Software Engineer',
  interviewType: 'technical',
  notes: 'Focused on system design',
  status: 'uploaded',
  videoIndexerUrl: 'https://vi.azure.com/video/xyz',
  prepSessionId: 'prep-789',
  createdAt: new Date(),
  updatedAt: new Date()
};

// Transcription with speaker diarization
const transcription: Transcription = {
  id: 'trans-123',
  interviewId: 'cuid123',
  text: 'Full interview transcript...',
  timestamps: [
    { text: 'Hello', start: '00:00:01', end: '00:00:02', confidence: 0.95 }
  ],
  speakers: [
    {
      id: 'speaker-1',
      name: 'Interviewer',
      instances: [{ start: '00:00:01', end: '00:00:05' }]
    }
  ],
  language: 'en-US',
  confidence: 0.92,
  createdAt: new Date()
};

// Analysis with structured metrics
const analysis: Analysis = {
  id: 'analysis-456',
  interviewId: 'cuid123',
  speechMetrics: {
    fillerWords: 15,
    fillerWordsList: ['um', 'uh', 'like'],
    speakingPace: 145,
    pauseCount: 8,
    clarity: 85
  },
  contentAnalysis: {
    starMethod: true,
    relevance: 92,
    structureScore: 88,
    keyPoints: ['Scaled system to 1M users', 'Led team of 5 engineers']
  },
  sentiment: {
    overall: 'positive',
    confidence: 0.85,
    enthusiasm: 78,
    timeline: [
      { time: '00:05:00', sentiment: 'positive' }
    ]
  },
  overallScore: 87,
  recommendations: [
    'Reduce filler words by 30%',
    'Add more specific metrics to answers'
  ],
  modelUsed: 'gpt-4o',
  createdAt: new Date()
};
```

## Type Categories

### Events (`/events`)

Event types for Redis Streams communication:

- `InterviewUploadedEvent` - Emitted when upload completes to Azure Video Indexer
- `InterviewTranscribedEvent` - Emitted when Video Indexer completes transcription
- `AnalysisCompletedEvent` - Emitted when AI analysis completes
- `ProcessingFailedEvent` - Emitted when processing fails at any stage
- `EventNames` - Constant object with event name strings (e.g., 'interview.uploaded')
- `EventName` - Union type of all event name strings

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

Core entities aligned with Prisma schema:

- `Interview` - Main interview entity with processing status
- `Transcription` - Interview transcription with timestamps and speaker diarization
- `Analysis` - AI analysis results with structured metrics (speech, content, sentiment)
- `PrepSession` - Pre-interview preparation session
- `User` - User entity (auth handled by Firebase)

**Supporting Types:**
- `InterviewType` - Union: 'behavioral' | 'technical' | 'phone' | 'panel'
- `InterviewUploadStatus` - Union: 'uploading' | 'uploaded' | 'transcribing' | 'analyzing' | 'completed' | 'failed'
- `TranscriptSegment` - Individual transcript segment with timing
- `SpeakerDiarization` - Speaker identification data
- `SpeechMetrics` - Speech pattern analysis (filler words, pace, clarity)
- `ContentAnalysis` - Content quality metrics (STAR method, relevance, structure)
- `SentimentAnalysis` - Emotional tone analysis (confidence, enthusiasm, timeline)
- `PrepQuestion` - AI-generated prep question
- `PracticeAnswer` - Practice answer with AI feedback

## Building

Build this package before using it in other services:

```bash
# From this directory
npm run build

# Watch mode for development
npm run dev

# Clean build artifacts
npm run clean
```

## Alignment with Prisma Schema

This package maintains type definitions that align with the Prisma schema in `packages/prisma-client/prisma/schema.prisma`:

- **Interview**: Matches Prisma model with `videoIndexerUrl` for Azure Video Indexer integration
- **Transcription**: Matches Prisma model with JSON fields for `timestamps` and `speakers`
- **Analysis**: Matches Prisma model with JSON fields for `speechMetrics`, `contentAnalysis`, and `sentiment`
- **PrepSession**: Matches Prisma model with JSON fields for `questions` and `practiceAnswers`

When updating the Prisma schema, ensure corresponding types in this package are updated to maintain consistency.

## Error Handling

All error responses include a `correlationId` field for distributed tracing:

```typescript
import { ErrorResponse } from '@interview-buddy/shared-types';

const error: ErrorResponse = {
  error: 'VALIDATION_ERROR',
  message: 'Invalid interview type',
  statusCode: 400,
  timestamp: new Date().toISOString(),
  path: '/api/interviews',
  correlationId: 'req-123-abc',
  details: {
    field: 'interviewType',
    provided: 'invalid-type'
  }
};
```

## Contributing

When adding new types:

1. Add the type definition to the appropriate file (`index.ts`, `api/index.ts`, or `events/index.ts`)
2. Add JSDoc comments explaining the purpose
3. Update this README with usage examples
4. Run `npm run build` to verify TypeScript compilation
5. Ensure alignment with Prisma schema if applicable

## License

UNLICENSED
