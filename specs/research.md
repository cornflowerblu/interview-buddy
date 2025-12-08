# Research Findings: Interview Buddy MVP

**Date**: 2025-12-08
**Purpose**: Resolve Phase 0 research tasks from plan.md before Phase 1 implementation

This document captures decisions made during research phase to guide implementation.

---

## R1: Azure Video Indexer vs. Azure Media Services

### Decision: **Azure Video Indexer** ✅

### Rationale

**Azure Video Indexer provides**:
- **Built-in AI models** accessible directly from the service (summaries, insights, sentiment)
- **Transcription + AI analysis** in one service (reduces integration complexity)
- **Speaker diarization** built-in (critical for separating user from interviewer)
- **Face detection and emotions** (potential future features)
- **Content moderation** (useful for filtering inappropriate content)
- **Unified API** for both transcription and AI insights

**Why not Azure Media Services**:
- Media Services is primarily for encoding/streaming (overkill for our use case)
- AI features require separate services (more integration points)
- No built-in speaker separation (would need custom implementation)
- Less suitable for AI-focused analysis workflows

### Alternatives Considered

| Service | Pros | Cons | Decision |
|---------|------|------|----------|
| **Azure Video Indexer** | Built-in AI models, speaker diarization, unified API | Higher cost (~$0.05/min vs $0.015/min) | ✅ **CHOSEN** |
| Azure Media Services | Lower cost, simple transcription | No AI features, requires separate services for analysis | ❌ Rejected |
| Self-hosted Whisper | Full control, potentially cheaper at scale | Complex infrastructure, scaling challenges, maintenance burden | ❌ Rejected |

### Cost Analysis (30-minute interview)

- **Video Indexer**: ~$1.50 per interview (30min × $0.05/min)
- **Media Services + OpenAI**: ~$0.45 transcription + ~$0.50 GPT-4o analysis = ~$0.95 per interview
- **Trade-off**: Paying ~$0.55/interview premium for built-in speaker diarization and simplified architecture

**For MVP scale (1000 interviews)**: $1,500 vs $950 = $550 difference
**Conclusion**: Premium is acceptable for MVP given reduced development complexity and built-in features

### Implementation Notes

#### Direct Upload Architecture (Simplified)

```
User → Next.js → Video Indexer API (direct upload)
                      ↓
                Video Indexer (transcription + AI)
                      ↓
                Webhook callback → processor-service
                      ↓
                Store results in Postgres → emit event
```

**Key changes from original plan**:
- **Eliminate Azure Blob Storage** for initial upload (Video Indexer handles storage)
- **Use Video Indexer's upload API** with SAS URL for direct browser uploads
- **Webhook-based processing** instead of polling (more efficient)
- **Keep Blob Storage** only for long-term archival (optional Phase 2 feature)

#### Video Indexer SDK Integration

```typescript
// apps/processor-service/src/modules/video-indexer/client.ts
import { VideoIndexerClient } from '@azure/video-indexer';

// Get upload SAS URL
const uploadUrl = await client.videos.getUploadSasUrl({
  accountId: process.env.VIDEO_INDEXER_ACCOUNT_ID,
  location: 'eastus',
});

// Upload from browser using SAS URL (resumable via fetch API with retry)
// OR upload via Next.js proxy if we want upload tracking

// Submit for indexing
await client.videos.index({
  videoUrl: uploadUrl,
  language: 'en-US',
  privacy: 'Private',
  streamingPreset: 'NoStreaming', // We don't need playback
  indexingPreset: 'AdvancedAudio', // Focus on audio analysis
});

// Register webhook for completion
await client.webhooks.create({
  url: 'https://interviewbuddy.com/api/webhooks/video-indexer',
  events: ['VideoIndexCompleted', 'VideoIndexFailed'],
});
```

#### Resumable Upload Strategy

**Option A: Direct browser upload to Video Indexer**
- Use Video Indexer's SAS URL for browser upload
- Implement retry logic in Next.js frontend using `fetch` with `Range` headers
- Pros: Simple, less server load
- Cons: Need to implement chunking ourselves

**Option B: Upload via Next.js proxy with tus protocol**
- Upload to Next.js using `@tus/server`
- Next.js forwards completed upload to Video Indexer
- Pros: Standard protocol, better progress tracking
- Cons: Double upload (browser → Next.js → Video Indexer)

**Recommendation**: Test both approaches in Phase 1
- Start with **Option A** (direct upload) for simplicity
- Fall back to **Option B** if resume reliability is poor

### Speaker Diarization Integration

Video Indexer provides speaker separation automatically:

```json
{
  "insights": {
    "speakers": [
      {
        "id": 1,
        "name": "Speaker 1",
        "instances": [
          { "start": "00:00:05", "end": "00:00:15" }
        ]
      },
      {
        "id": 2,
        "name": "Speaker 2",
        "instances": [
          { "start": "00:00:16", "end": "00:00:30" }
        ]
      }
    ]
  }
}
```

**Implementation**:
- Ask user to identify which speaker is them during metadata input
- Filter transcription to only analyze user's speech
- Flag interviews with >3 speakers as "panel interview" (may need manual review)

---

## R2: Multi-Model AI Strategy via Azure AI Foundry

### Decision: **Azure AI Foundry with User-Selectable Models** ✅

### Rationale

**Azure AI Foundry provides**:
- **Unified API** for multiple models (GPT-4o, Claude 3.5 Sonnet, Amazon Nova, Mistral, etc.)
- **Built-in integration** with Azure services (Video Indexer, PostgreSQL, etc.)
- **MCP (Model Context Protocol)** for agentic workflows (conversational AI coach)
- **Cost optimization** through model routing (cheap models for simple tasks, expensive for complex)
- **Consistency** - all models accessed via same SDK pattern

**Unlike AWS Bedrock**: Foundry is deeply integrated into Microsoft ecosystem (seamless with Azure PostgreSQL, Video Indexer, etc.)

### Multi-Model Routing Strategy

#### Model Tier Selection

| Model | Use Case | Cost (per 1M tokens) | Quality Score |
|-------|----------|---------------------|---------------|
| **Amazon Nova Micro** | Simple tasks (filler word counting, basic sentiment) | ~$0.10 input / $0.30 output | 6/10 |
| **GPT-4o Mini** | Moderate tasks (STAR detection, answer relevance) | ~$0.15 input / $0.60 output | 7/10 |
| **GPT-4o** | Complex analysis (deep content analysis, recommendations) | ~$2.50 input / $10 output | 9/10 |
| **Claude 3.5 Sonnet** | High-quality analysis (comprehensive feedback, coaching) | ~$3.00 input / $15 output | 10/10 |

#### Auto-Routing Logic

```typescript
// apps/ai-analyzer-service/src/modules/ai/model-router.service.ts

interface AnalysisTask {
  type: 'speech_metrics' | 'star_detection' | 'sentiment' | 'recommendations' | 'coaching';
  complexity: 'simple' | 'moderate' | 'complex';
}

function routeToModel(task: AnalysisTask, userPreference?: string): string {
  // User override always wins
  if (userPreference) return userPreference;

  // Auto-routing based on task complexity
  const routingMap = {
    speech_metrics: 'nova-micro',      // Simple counting/calculation
    star_detection: 'gpt-4o-mini',     // Pattern matching
    sentiment: 'gpt-4o-mini',          // Moderate analysis
    recommendations: 'gpt-4o',         // Complex reasoning
    coaching: 'claude-3.5-sonnet',     // Conversational + high quality
  };

  return routingMap[task.type];
}
```

#### User Model Selection UI

```typescript
// User settings in apps/web/src/app/settings/page.tsx

interface ModelPreference {
  mode: 'auto' | 'manual';
  manualModel?: 'nova' | 'gpt-4o-mini' | 'gpt-4o' | 'claude';
}

// UI shows cost/quality trade-offs:
// - Auto: "Optimized for cost/quality balance (~$0.15/interview)"
// - Nova: "Budget option (~$0.05/interview) - Good for basic feedback"
// - GPT-4o Mini: "Balanced (~$0.10/interview) - Recommended for most users"
// - GPT-4o: "High quality (~$0.30/interview) - Detailed analysis"
// - Claude: "Premium (~$0.50/interview) - Best for coaching"
```

### Cost Optimization Example (30-minute interview)

**Typical interview transcription**: ~5,000 tokens

**Auto-routing breakdown**:
- Speech metrics (Nova): 5K tokens input → $0.0005
- STAR detection (GPT-4o Mini): 5K tokens input + 2K output → $0.0019
- Sentiment (GPT-4o Mini): 5K tokens input + 1K output → $0.0014
- Recommendations (GPT-4o): 5K tokens input + 3K output → $0.0425
- **Total: ~$0.046 per interview** (vs. ~$0.50 if using Claude for everything)

**Savings at 1000 interviews**: $460 vs $500 = ~$40 saved, plus faster processing for simple tasks

### Implementation Notes

```typescript
// apps/ai-analyzer-service/src/modules/ai/foundry.client.ts
import { OpenAI } from 'openai'; // Azure AI Foundry uses OpenAI SDK format

const foundry = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.AZURE_AI_FOUNDRY_KEY,
});

async function analyze(task: AnalysisTask, transcript: string) {
  const model = routeToModel(task);

  const response = await foundry.chat.completions.create({
    model: model,
    messages: [
      { role: 'system', content: getPromptForTask(task.type) },
      { role: 'user', content: transcript },
    ],
    temperature: 0.3, // Lower for consistent analysis
  });

  return response.choices[0].message.content;
}
```

### MCP (Model Context Protocol) Integration

**Future Phase 2 feature**: Conversational AI coach

```typescript
// Agent can query PostgreSQL directly via MCP
const agent = await foundry.agents.create({
  model: 'claude-3.5-sonnet',
  tools: [
    {
      type: 'mcp',
      server: 'azure-postgresql',
      connection: process.env.POSTGRES_MCP_CONNECTION,
    },
  ],
});

// User asks: "How did I perform on behavioral questions?"
// Agent queries: SELECT * FROM analyses WHERE userId = ? AND starMethodUsage IS NOT NULL
// Agent responds with natural language summary + specific examples
```

---

## R3: File Upload Strategy (tus Protocol)

### Decision: **Test Video Indexer Direct Upload, Fallback to tus Protocol** ✅

### Rationale

**Primary approach**: Upload directly to Video Indexer using SAS URLs
- Simpler architecture (no intermediate storage)
- Video Indexer handles storage and processing
- One less service to manage (no Azure Blob initially)

**Fallback approach**: Use tus protocol if direct upload proves unreliable
- Industry-standard resumable upload protocol
- Better control over chunking and retry logic
- Can still forward to Video Indexer after upload completes

### Implementation Plan

#### Phase 1: Test Direct Upload to Video Indexer

```typescript
// apps/web/src/lib/video-indexer-upload.ts

async function uploadToVideoIndexer(file: File, onProgress: (percent: number) => void) {
  // 1. Get SAS URL from Video Indexer API (via Next.js backend)
  const { sasUrl } = await fetch('/api/upload/get-sas-url', {
    method: 'POST',
    body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
  }).then(r => r.json());

  // 2. Upload file in chunks using Fetch API with Range headers
  const chunkSize = 5 * 1024 * 1024; // 5MB chunks
  let uploadedBytes = 0;

  while (uploadedBytes < file.size) {
    const chunk = file.slice(uploadedBytes, uploadedBytes + chunkSize);

    const response = await fetch(sasUrl, {
      method: 'PUT',
      headers: {
        'Content-Range': `bytes ${uploadedBytes}-${uploadedBytes + chunk.size - 1}/${file.size}`,
        'Content-Type': 'application/octet-stream',
      },
      body: chunk,
    });

    if (!response.ok) {
      // Retry logic with exponential backoff
      await retryChunk(chunk, uploadedBytes);
    }

    uploadedBytes += chunk.size;
    onProgress((uploadedBytes / file.size) * 100);
  }

  // 3. Notify backend that upload is complete
  await fetch('/api/upload/complete', {
    method: 'POST',
    body: JSON.stringify({ sasUrl, fileName: file.name }),
  });
}
```

#### Phase 1 Alternative: tus Protocol (if direct upload is unreliable)

**Recommended libraries**:
- **Frontend**: `tus-js-client` (battle-tested, widely used)
- **Backend**: `@tus/server` + `@tus/file-store` (official tus implementation for Node.js)

```typescript
// apps/web/src/lib/tus-upload.ts
import * as tus from 'tus-js-client';

function uploadWithTus(file: File, onProgress: (percent: number) => void) {
  const upload = new tus.Upload(file, {
    endpoint: '/api/upload',
    retryDelays: [0, 1000, 3000, 5000], // Retry with backoff
    chunkSize: 5 * 1024 * 1024, // 5MB chunks
    metadata: {
      filename: file.name,
      filetype: file.type,
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      onProgress((bytesUploaded / bytesTotal) * 100);
    },
    onSuccess: () => {
      console.log('Upload complete!');
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
  });

  upload.start();
  return upload; // Can call upload.abort() to cancel
}
```

```typescript
// apps/web/src/app/api/upload/route.ts (Next.js API route with tus server)
import { Server } from '@tus/server';
import { FileStore } from '@tus/file-store';

const tusServer = new Server({
  path: '/api/upload',
  datastore: new FileStore({ directory: '/tmp/uploads' }),
  onUploadFinish: async (req, res, upload) => {
    // Forward completed file to Video Indexer
    const filePath = upload.storage.path;
    await submitToVideoIndexer(filePath, upload.metadata);
  },
});

export async function POST(req: Request) {
  return tusServer.handle(req);
}

export async function PATCH(req: Request) {
  return tusServer.handle(req);
}

export async function HEAD(req: Request) {
  return tusServer.handle(req);
}
```

### Testing Strategy

1. **Week 1**: Implement direct Video Indexer upload
   - Test with 100MB, 500MB, 1GB, 2GB files
   - Test network interruption scenarios (pause WiFi mid-upload)
   - Measure resume reliability

2. **Week 2**: If direct upload reliability <95%, implement tus fallback
   - Add `@tus/server` to Next.js API routes
   - Add `tus-js-client` to frontend
   - Migrate upload flow

3. **Success criteria**: 98% upload success rate for 1GB files with network interruptions

---

## R4: Redis Streams NestJS Integration

### Decision: **@nestjs/microservices with Redis Transport and Consumer Groups** ✅

### Rationale

**NestJS provides built-in Redis Streams support**:
- First-class integration via `@nestjs/microservices`
- Handles consumer groups automatically
- Built-in retry logic and error handling
- Type-safe event patterns using decorators

**Redis Streams advantages over alternatives**:
- Message persistence (won't lose events during restarts)
- Consumer groups for load balancing (multiple processor instances can consume same stream)
- Acknowledgment-based processing (message not removed until acknowledged)
- Built-in retry via consumer group XPENDING

### Implementation Pattern

#### Producer (Emit Events)

```typescript
// apps/upload-service/src/events/upload.emitter.ts
import { Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UploadEventEmitter {
  constructor(
    @Inject('REDIS_CLIENT') private client: ClientProxy,
  ) {}

  async emitInterviewUploaded(payload: InterviewUploadedEvent) {
    await this.client.emit('interview.uploaded', payload);
  }
}
```

#### Consumer (Listen to Events)

```typescript
// apps/processor-service/src/events/upload.consumer.ts
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class UploadEventConsumer {
  constructor(private readonly processorService: ProcessorService) {}

  @EventPattern('interview.uploaded')
  async handleInterviewUploaded(@Payload() data: InterviewUploadedEvent) {
    try {
      await this.processorService.processInterview(data);
      // Auto-acknowledged on success
    } catch (error) {
      // Auto-retry via consumer group XPENDING
      throw error; // Will retry up to max attempts
    }
  }
}
```

#### Redis Configuration

```typescript
// apps/processor-service/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
        // Consumer group config
        retryAttempts: 3,
        retryDelay: 1000, // 1 second
      },
    },
  );

  await app.listen();
}
```

### Event Schema Design

```typescript
// packages/shared-types/src/events/index.ts

export interface InterviewUploadedEvent {
  interviewId: string;
  userId: string;
  videoIndexerUrl: string; // SAS URL or Video Indexer video ID
  metadata: {
    company: string;
    jobTitle: string;
    interviewType: string;
  };
  timestamp: Date;
}

export interface InterviewTranscribedEvent {
  interviewId: string;
  userId: string;
  transcriptionId: string;
  videoIndexerInsights: {
    speakers: Speaker[];
    sentiments: Sentiment[];
    keywords: string[];
  };
  timestamp: Date;
}

export interface AnalysisCompletedEvent {
  interviewId: string;
  userId: string;
  analysisId: string;
  overallScore: number;
  timestamp: Date;
}
```

### Error Handling Strategy

#### Dead Letter Queue (DLQ)

```typescript
// apps/processor-service/src/events/dlq.service.ts
@Injectable()
export class DeadLetterQueueService {
  async handleFailedEvent(event: any, error: Error, attempts: number) {
    // After 3 failed attempts, send to DLQ
    if (attempts >= 3) {
      await this.prisma.failedEvent.create({
        data: {
          eventType: event.pattern,
          payload: event.data,
          error: error.message,
          attempts,
          timestamp: new Date(),
        },
      });

      // Alert support team
      await this.notificationService.alertSupport({
        type: 'event_processing_failed',
        interviewId: event.data.interviewId,
        error: error.message,
      });
    }
  }
}
```

### Consumer Group Load Balancing

With consumer groups, multiple instances share the workload:

```
Redis Stream: interview.uploaded
├─ Consumer Group: processor-group
   ├─ processor-service-pod-1 (processes 1/3 of events)
   ├─ processor-service-pod-2 (processes 1/3 of events)
   └─ processor-service-pod-3 (processes 1/3 of events)
```

**Auto-scaling**: As load increases, Kubernetes scales processor-service pods, and Redis automatically distributes events across new consumers.

---

## R6: Prisma Schema Design for Microservices

### Decision: **Shared Prisma Schema with Service Data Ownership** ✅

### Rationale

**Shared schema approach**:
- Single source of truth for data model
- Easier to maintain relationships and foreign keys
- Type safety across all services
- Simpler migrations (one migration runner)

**Service data ownership**:
- Each service owns specific tables (clear boundaries)
- Services can only write to their owned tables
- Services can read from shared tables (queries only)

**Why not per-service schemas**:
- Complexity: Managing foreign keys across databases is hard
- Transactions: Can't do atomic operations across services
- Migrations: Coordinating schema changes across services is error-prone

### Data Ownership Matrix

| Service | Owns (Write) | Reads (Query) |
|---------|--------------|---------------|
| **upload-service** | Interview (status, metadata) | None |
| **processor-service** | Transcription | Interview |
| **ai-analyzer-service** | Analysis | Interview, Transcription, PrepSession |
| **notification-service** | None (event-driven only) | Interview, Analysis |
| **web (Next.js)** | PrepSession | Interview, Transcription, Analysis |

### Prisma Schema Structure

```prisma
// packages/prisma-client/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Owned by: upload-service
model Interview {
  id              String   @id @default(cuid())
  userId          String
  uploadId        String   @unique

  // Metadata
  company         String
  jobTitle        String
  interviewType   String   // 'behavioral' | 'technical' | 'phone' | 'panel'
  jobDescription  String?
  notes           String?

  // Processing state
  status          String   // 'uploading' | 'uploaded' | 'transcribing' | 'analyzing' | 'completed' | 'failed'
  videoIndexerUrl String   // Video Indexer video ID or URL
  fileSize        BigInt
  duration        Int?     // seconds

  // Relationships
  transcription   Transcription?
  analysis        Analysis?
  prepSession     PrepSession?   @relation(fields: [prepSessionId], references: [id])
  prepSessionId   String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([status])
}

// Owned by: processor-service
model Transcription {
  id              String   @id @default(cuid())
  interviewId     String   @unique
  interview       Interview @relation(fields: [interviewId], references: [id])

  // Transcription data
  text            String   @db.Text
  timestamps      Json     // { start: number, end: number, text: string }[]
  confidence      Float
  language        String   @default("en-US")

  // Video Indexer insights
  speakers        Json     // Speaker diarization data
  keywords        Json     // Extracted keywords
  sentiments      Json     // Sentiment timeline from Video Indexer

  createdAt       DateTime @default(now())

  @@index([interviewId])
}

// Owned by: ai-analyzer-service
model Analysis {
  id                String   @id @default(cuid())
  interviewId       String   @unique
  interview         Interview @relation(fields: [interviewId], references: [id])
  transcriptionId   String

  // Speech metrics (calculated in ai-analyzer)
  fillerWords       Json     // { word: string, count: number }[]
  speakingPace      Float    // WPM
  pauseCount        Int
  clarityScore      Float    // 0-100

  // Content analysis (from AI model)
  starMethodUsage   Json     // { question: string, hasSTAR: boolean, score: number }[]
  answerRelevance   Float    // 0-100

  // Sentiment (combined Video Indexer + AI model)
  overallSentiment  String   // 'positive' | 'neutral' | 'negative'
  confidenceLevel   Float    // 0-100
  enthusiasmScore   Float    // 0-100
  sentimentTimeline Json     // { timestamp: number, sentiment: number }[]

  // Overall
  overallScore      Float    // 0-100
  recommendations   Json     // string[]

  // Comparison (if linked to prep)
  comparisonMetrics Json?    // { questionsMatched: number, improvementScore: number, deviations: [...] }

  // Model tracking
  modelUsed         String   // 'nova-micro' | 'gpt-4o-mini' | 'gpt-4o' | 'claude-3.5-sonnet'

  createdAt         DateTime @default(now())

  @@index([interviewId])
}

// Owned by: web (Next.js)
model PrepSession {
  id              String   @id @default(cuid())
  userId          String

  // Context
  company         String
  jobTitle        String
  jobDescription  String?

  // Questions and answers
  questions       Json     // { id: string, question: string, aiGenerated: boolean }[]
  practiceAnswers Json     // { questionId: string, answer: string, aiFeedback: string }[]

  // Relationships
  interviews      Interview[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
}

// For DLQ tracking
model FailedEvent {
  id          String   @id @default(cuid())
  eventType   String
  payload     Json
  error       String   @db.Text
  attempts    Int
  resolved    Boolean  @default(false)
  createdAt   DateTime @default(now())

  @@index([resolved])
}
```

### Migration Strategy

```bash
# packages/prisma-client/package.json
{
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:studio": "prisma studio"
  }
}
```

**Development workflow**:
1. Edit `schema.prisma`
2. Run `npm run db:generate` to generate Prisma client
3. Run `npm run db:migrate:dev` to create migration and apply to dev database
4. Commit migration files to Git

**Production deployment**:
1. CI/CD runs `npm run db:migrate:deploy` before deploying services
2. All services restart and use new schema

### Shared Package Usage

```typescript
// In any service
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Service respects data ownership:
// ✅ upload-service can update Interview.status
await prisma.interview.update({
  where: { id: interviewId },
  data: { status: 'uploaded' },
});

// ❌ processor-service should NOT update Interview.status directly
// Instead: processor-service emits event, upload-service updates status
```

---

## R7: Speaker Diarization Approach

### Decision: **Use Video Indexer Built-in Speaker Diarization** ✅

### Rationale

**Video Indexer provides automatic speaker separation**:
- No additional implementation needed (included in Video Indexer API)
- Confidence scores for speaker identification
- Timestamps for each speaker segment
- Works for 2-6 speakers (covers most interview scenarios)

### Implementation Approach

#### Phase 1: Two-Speaker Interview (MVP)

**Assumption**: Most interviews have 2 speakers (user + 1 interviewer)

```typescript
// apps/processor-service/src/modules/transcription/speaker-identifier.service.ts

async function identifyUserSpeaker(
  videoIndexerInsights: VideoIndexerInsights,
  interviewId: string,
): Promise<number> {
  const speakers = videoIndexerInsights.speakers;

  // Strategy 1: Ask user to identify themselves (manual selection)
  // Show first 30 seconds of each speaker's speech in UI
  // User clicks: "This is me"

  // For MVP, store user selection in Interview.metadata
  const userSelection = await prisma.interview.findUnique({
    where: { id: interviewId },
    select: { metadata: true },
  });

  return userSelection.metadata.userSpeakerId || 1; // Default to speaker 1
}

async function filterTranscriptByUser(
  transcript: Transcript[],
  userSpeakerId: number,
): Promise<Transcript[]> {
  return transcript.filter(segment => segment.speakerId === userSpeakerId);
}
```

#### Phase 2: Multi-Speaker Panel Interviews

**For 3+ speakers** (panel interviews):

```typescript
async function handlePanelInterview(speakers: Speaker[]): Promise<void> {
  // Heuristic 1: User typically speaks the most in their own interview
  const sortedBySpeakingTime = speakers.sort((a, b) =>
    b.totalSpeakingTime - a.totalSpeakingTime
  );

  const likelyUser = sortedBySpeakingTime[0];

  // Heuristic 2: If confidence is low, flag for manual review
  if (likelyUser.confidence < 0.7) {
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'needs_review',
        metadata: {
          reviewReason: 'Low confidence in speaker identification - please verify which speaker is you'
        },
      },
    });
  }
}
```

### UI for Speaker Identification

```typescript
// apps/web/src/components/SpeakerIdentification.tsx

export function SpeakerIdentification({ speakers, transcriptPreview }) {
  const [selectedSpeaker, setSelectedSpeaker] = useState<number | null>(null);

  return (
    <div>
      <h3>Which speaker is you?</h3>
      <p>Listen to a preview of each speaker to identify yourself:</p>

      {speakers.map(speaker => (
        <div key={speaker.id}>
          <h4>Speaker {speaker.id}</h4>
          <p>Speaking time: {formatDuration(speaker.totalSpeakingTime)}</p>
          <p>Preview: "{transcriptPreview[speaker.id].slice(0, 200)}..."</p>
          <button onClick={() => setSelectedSpeaker(speaker.id)}>
            This is me
          </button>
        </div>
      ))}

      <button onClick={() => saveSpeakerSelection(selectedSpeaker)}>
        Confirm
      </button>
    </div>
  );
}
```

### Edge Cases

| Scenario | Handling |
|----------|----------|
| **Single speaker** (user practiced alone) | Skip speaker identification, analyze full transcript |
| **Two speakers** (standard interview) | User selects which speaker is them |
| **3-5 speakers** (panel interview) | Use heuristic + manual verification |
| **6+ speakers** (group interview) | Flag as unsupported, suggest re-recording |
| **Poor audio quality** (low diarization confidence) | Flag for manual review, still show full transcript |

### Future Enhancement Ideas (Phase 3+)

1. **Voice recognition**: User records 10-second voice sample during onboarding, match against speakers
2. **Multi-interview learning**: After user identifies themselves once, use ML to auto-identify in future interviews
3. **Interviewer tracking**: Track which company/interviewer patterns (helpful for company-specific interview prep)

---

## Summary of Decisions

| Research Item | Decision | Key Impact |
|---------------|----------|------------|
| **R1: Video Indexer vs Media Services** | ✅ Video Indexer | Built-in AI models, speaker diarization, simplified architecture |
| **R2: Multi-Model AI Strategy** | ✅ Azure AI Foundry with routing | Cost optimization (~$0.05/interview), user choice, MCP for future |
| **R3: File Upload Strategy** | ✅ Test direct upload, fallback to tus | Simplified initially, robust fallback available |
| **R4: Redis Streams NestJS** | ✅ @nestjs/microservices with consumer groups | First-class integration, auto-retry, load balancing |
| **R6: Prisma Schema Design** | ✅ Shared schema with ownership boundaries | Single source of truth, easier migrations, type safety |
| **R7: Speaker Diarization** | ✅ Video Indexer built-in + manual verification | No custom implementation needed, user confirms identity |

## Architectural Changes from Original Plan

### Simplified Architecture (Thanks to Video Indexer)

**Before (plan.md)**:
```
User → Next.js → upload-service → Azure Blob → processor-service → Azure Media Services
                                                                  ↓
                                                      Extract transcription
                                                                  ↓
                                              ai-analyzer-service → OpenAI/Claude
```

**After (research.md)**:
```
User → Next.js → Video Indexer API (direct upload)
                        ↓
            Video Indexer (transcription + AI insights)
                        ↓
          Webhook → processor-service (store results)
                        ↓
            ai-analyzer-service → Azure AI Foundry (enhanced analysis)
```

**Services eliminated/simplified**:
- ❌ Azure Blob Storage for initial upload (Video Indexer handles it)
- ✅ Simplified upload-service (just manages metadata + SAS URLs)
- ✅ Simplified processor-service (webhook handler instead of polling)
- ✅ ai-analyzer-service focuses on enhanced analysis beyond Video Indexer basics

## Next Steps

1. ✅ **Phase 0 complete**: All research decisions documented
2. 🔄 **Phase 1**: Create design documents
   - data-model.md (Prisma schema from R6)
   - contracts/ directory (API contracts for each service)
   - quickstart.md (developer setup guide with Video Indexer integration)
3. 🔄 **Phase 2**: Run `/speckit.tasks` to update tasks.md with research findings
4. 🚀 **Phase 3**: Begin implementation (start with Setup phase from tasks.md)

## Open Questions for Implementation

1. **Video Indexer webhook reliability**: Need to test webhook delivery during service restarts
   - Fallback: Periodic polling if webhook fails
2. **Speaker identification UX**: Should we ask user before or after transcription completes?
   - Recommendation: After (so we can show preview of each speaker's speech)
3. **Cost monitoring**: How to alert when AI costs exceed budget?
   - Add cost tracking to Analysis model, dashboard showing per-interview cost
4. **Multi-model testing**: Which prompts work better on Nova vs GPT-4o?
   - Create test suite with sample interviews, compare output quality

---

**Document Status**: ✅ Complete - Ready for Phase 1 implementation
