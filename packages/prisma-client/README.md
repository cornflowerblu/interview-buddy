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

## Consuming the Client

### Installation in Services

The package is automatically available to all workspace members via the monorepo structure. No additional installation needed.

### In NestJS Services

#### 1. Create a Prisma Module

```typescript
// src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

#### 2. Create a Prisma Service

```typescript
// src/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@interview-buddy/prisma-client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

#### 3. Use in Services

```typescript
// src/interview/interview.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InterviewService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, data: CreateInterviewDto) {
    return this.prisma.interview.create({
      data: {
        userId,
        company: data.company,
        jobTitle: data.jobTitle,
        interviewType: data.interviewType,
        status: 'uploading',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.interview.update({
      where: { id },
      data: { status },
    });
  }
}
```

### In Next.js (Web App)

#### 1. Create a Singleton Instance

```typescript
// lib/prisma.ts
import { PrismaClient } from '@interview-buddy/prisma-client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

#### 2. Use in API Routes

```typescript
// app/api/interviews/route.ts
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const userId = 'user-123'; // From session

  const interviews = await prisma.interview.findMany({
    where: { userId },
    include: {
      transcription: true,
      analysis: true,
      prepSession: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json({ interviews });
}
```

## Usage Examples

### Create an Interview

```typescript
const interview = await prisma.interview.create({
  data: {
    userId: 'user-123',
    company: 'TechCorp',
    jobTitle: 'Senior Engineer',
    interviewType: 'behavioral',
    status: 'uploading',
  },
});
```

### Create a Transcription

```typescript
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
    language: 'en-US',
    confidence: 0.95,
  },
});
```

### Query with Relations

```typescript
const interview = await prisma.interview.findUnique({
  where: { id: 'interview-id' },
  include: {
    transcription: true,
    analysis: true,
    prepSession: true,
  },
});
```

## Development

### Initial Setup

After cloning the repository, set up the Prisma client:

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run generate

# Build TypeScript exports
npm run build
```

### Database Operations

#### Generate Prisma Client

Regenerates the Prisma Client based on the schema:

```bash
npm run generate
```

Run this after any schema changes.

#### Create and Apply Migration (Development)

Creates a new migration and applies it to the database:

```bash
npm run migrate:dev -- --name migration_name
```

This command:
1. Creates a new migration file in `prisma/migrations/`
2. Applies the migration to your development database
3. Regenerates the Prisma Client

**Example:**
```bash
npm run migrate:dev -- --name add_prep_session_notes
```

#### Apply Migrations (Production)

Applies pending migrations to the database without creating new ones:

```bash
npm run migrate:deploy
```

Use this in CI/CD pipelines and production environments.

#### Push Schema Changes (Prototyping)

Pushes schema changes directly to the database without creating migrations:

```bash
npm run db:push
```

**Warning:** Use only during early prototyping. Prefer migrations for production-ready features.

#### Open Prisma Studio

Opens a visual database browser:

```bash
npm run studio
```

Access at `http://localhost:5555`

### Building the Package

Compile TypeScript to JavaScript for consumption by services:

```bash
npm run build
```

This creates `dist/index.js` and `dist/index.d.ts`.

## Environment Variables

Set `DATABASE_URL` in your environment:

```bash
# Development (local PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/interview_buddy?schema=public"

# Development (Docker Compose)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/interview_buddy?schema=public"

# Production (Azure PostgreSQL with SSL)
DATABASE_URL="postgresql://user:password@prod-host:5432/interview_buddy?schema=public&sslmode=require"

# Production (Neon Serverless)
DATABASE_URL="postgresql://user:password@ep-xxx.neon.tech/interview_buddy?sslmode=require"
```

### Azure Key Vault Integration (Production)

In production, services fetch `DATABASE_URL` from Azure Key Vault at runtime using Managed Identity. Never commit connection strings to `.env` files.

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
