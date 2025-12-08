# Data Model: Interview Buddy

**Status**: Draft - expect changes as we implement
**Last Updated**: 2025-12-08

This is a lightweight schema to get started. Add fields as needed during implementation.

## Core Entities

### Interview
Main entity tracking uploads and processing status.

```prisma
model Interview {
  id              String   @id @default(cuid())
  userId          String

  // Metadata (can expand later)
  company         String
  jobTitle        String
  interviewType   String
  notes           String?

  // Processing
  status          String   // uploading | uploaded | transcribing | analyzing | completed | failed
  videoIndexerUrl String

  // Relationships
  transcription   Transcription?
  analysis        Analysis?
  prepSessionId   String?
  prepSession     PrepSession? @relation(fields: [prepSessionId], references: [id])

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}
```

### Transcription
Owned by processor-service.

```prisma
model Transcription {
  id              String   @id @default(cuid())
  interviewId     String   @unique
  interview       Interview @relation(fields: [interviewId], references: [id])

  text            String   @db.Text
  timestamps      Json     // Flexible - store whatever Video Indexer gives us
  speakers        Json?    // Speaker diarization data

  createdAt       DateTime @default(now())
}
```

### Analysis
Owned by ai-analyzer-service. Keep it flexible with Json fields.

```prisma
model Analysis {
  id              String   @id @default(cuid())
  interviewId     String   @unique
  interview       Interview @relation(fields: [interviewId], references: [id])

  // Store results as JSON - schema can evolve without migrations
  speechMetrics   Json     // { fillerWords, speakingPace, etc. }
  contentAnalysis Json     // { starMethod, relevance, etc. }
  sentiment       Json     // { overall, confidence, timeline, etc. }

  overallScore    Float
  recommendations Json     // string[]

  modelUsed       String   // Track which AI model was used
  createdAt       DateTime @default(now())
}
```

### PrepSession
Owned by web (Next.js). Also kept flexible.

```prisma
model PrepSession {
  id              String   @id @default(cuid())
  userId          String

  company         String
  jobTitle        String

  questions       Json     // Array of questions
  practiceAnswers Json     // Array of practice answers with AI feedback

  interviews      Interview[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}
```

## Notes

- **Json fields**: Used heavily to avoid constant migrations as we iterate
- **Minimal indexes**: Only userId for now, add more as we see performance needs
- **No over-engineering**: We can add fields/tables as we discover what we actually need
- **Service ownership**: See research.md R6 for which service owns which table

## Schema Location

Place this in: `packages/prisma-client/prisma/schema.prisma`

Don't forget to add the generator and datasource blocks:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Migration Strategy

Start simple:
1. Create initial migration with these 4 tables
2. Add fields as needed during development
3. Don't prematurely optimize - we can refactor later
