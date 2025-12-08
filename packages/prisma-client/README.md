# @interview-buddy/prisma-client

Shared Prisma Client for Interview Buddy microservices.

## Overview

This package provides a centralized database schema and Prisma Client that is shared across all microservices in the Interview Buddy platform.

## Data Models

### Interview

Main entity tracking uploads and processing status.

- **Status Flow**: `uploading` → `uploaded` → `transcribing` → `analyzing` → `completed` | `failed`
- **Relationships**: One-to-one with Transcription and Analysis, many-to-one with PrepSession
- **Indexes**: userId, status, createdAt

### Transcription

Stores transcription results from Azure Video Indexer.

- **Owner**: processor-service
- **Relationship**: One-to-one with Interview (cascade delete)
- **JSON Fields**: 
  - `timestamps`: Array of transcription segments with timing
  - `speakers`: Speaker diarization data

### Analysis

Stores AI-powered analysis results from OpenAI/Claude.

- **Owner**: ai-analyzer-service
- **Relationship**: One-to-one with Interview (cascade delete)
- **JSON Fields**:
  - `speechMetrics`: Filler words, speaking pace, pauses, clarity
  - `contentAnalysis`: STAR method, relevance, structure, key points
  - `sentiment`: Overall sentiment, confidence, enthusiasm, timeline

### PrepSession

Stores pre-interview preparation sessions with AI coaching.

- **Owner**: web (Next.js)
- **Relationship**: One-to-many with Interview
- **JSON Fields**:
  - `questions`: AI-generated questions with metadata
  - `practiceAnswers`: User answers with AI feedback

## Usage

### In NestJS Services

```typescript
import { PrismaClient } from '@interview-buddy/prisma-client';

const prisma = new PrismaClient();

// Create an interview
const interview = await prisma.interview.create({
  data: {
    userId: 'user-123',
    company: 'TechCorp',
    jobTitle: 'Senior Engineer',
    interviewType: 'behavioral',
    status: 'uploading',
  },
});

// Update interview status
await prisma.interview.update({
  where: { id: interview.id },
  data: { status: 'transcribing' },
});

// Create transcription
await prisma.transcription.create({
  data: {
    interviewId: interview.id,
    text: 'Full transcription text...',
    timestamps: [
      { text: 'Hello', start: '00:00:00', end: '00:00:01', confidence: 0.95 }
    ],
    speakers: [
      { id: 1, name: 'Candidate', instances: [{ start: '00:00:00', end: '00:00:05' }] }
    ],
  },
});
```

### In Next.js (Web App)

```typescript
import { PrismaClient } from '@interview-buddy/prisma-client';

const prisma = new PrismaClient();

// Get user's interviews
const interviews = await prisma.interview.findMany({
  where: { userId: session.userId },
  include: {
    transcription: true,
    analysis: true,
    prepSession: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

## Development

### Generate Prisma Client

```bash
npm run generate
```

### Create Migration

```bash
npm run migrate:dev -- --name migration_name
```

### Apply Migrations (Production)

```bash
npm run migrate:deploy
```

### Open Prisma Studio

```bash
npm run studio
```

## Environment Variables

Set `DATABASE_URL` in your environment:

```bash
# Development
DATABASE_URL="postgresql://user:password@localhost:5432/interview_buddy?schema=public"

# Production (Neon/Azure)
DATABASE_URL="postgresql://user:password@prod-host:5432/interview_buddy?schema=public&sslmode=require"
```

## Design Principles

1. **JSON Flexibility**: Use JSON fields for data that evolves frequently (speech metrics, analysis results)
2. **Minimal Indexes**: Start with essential indexes (userId, status, createdAt), add more as needed
3. **Cascade Deletes**: Transcription and Analysis cascade delete with Interview
4. **Service Ownership**: Clear ownership documented in comments
5. **Privacy First**: No raw media URLs stored, only metadata and structured analysis

## See Also

- [Data Model Specification](../../specs/data-model.md)
- [Service Contracts](../../specs/contracts/README.md)
- [Prisma Documentation](https://www.prisma.io/docs)
