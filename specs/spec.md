# Interview Buddy - Feature Specification

## 1. Overview

**Feature Name:** Interview Buddy - AI-Powered Interview Recording Analysis Platform

**Description:** A microservices-based platform that allows users to secretly record job interviews, upload the recordings, and receive AI-powered insights on their performance. The platform analyzes speech patterns, content quality, and compares actual interview responses against pre-interview preparation done with AI coaching.

**Business Context:** Job seekers need objective feedback on interview performance but traditional mock interviews are expensive and time-consuming. By allowing users to record real interviews (audio/video) and get AI analysis, they can improve faster with real-world data. The unique value is comparing actual performance against AI-generated prep work to identify gaps.

**Target Completion:** MVP Phase 1 - 2-3 weeks

## 2. Goals and Non-Goals

### Goals
- ✅ Allow users to upload interview recordings (video/audio) up to 2GB with resumable uploads
- ✅ Process recordings through Azure Media Services for transcription and conversion
- ✅ Provide AI-powered analysis of interview performance (speech patterns, content quality, sentiment)
- ✅ Enable pre-interview preparation with AI coaching and compare prep vs. actual performance
- ✅ Store structured metadata about interviews (job, company, questions) without exposing raw video/audio to users
- ✅ Build event-driven microservices architecture with NestJS
- ✅ Deploy to AKS with Istio service mesh for observability and resilience
- ✅ Showcase service-to-service communication patterns (upload → processor → AI analyzer)

### Non-Goals
- ❌ Live interview recording during video calls (MVP focuses on post-upload analysis)
- ❌ Video playback interface (users never see/hear their recordings, only insights)
- ❌ Social features (sharing results, leaderboards, etc.)
- ❌ Mobile apps (web-only for MVP)
- ❌ Multi-language support (English only for MVP)
- ❌ Real-time analysis (async processing is acceptable for MVP)

## 3. User Stories

### P1 (Must Have) - Core Upload & Analysis Flow

**P1.1: As a job seeker, I want to upload my interview recording so that I can get AI feedback on my performance**

Acceptance Criteria:
- [ ] User can select video/audio file from device (MP4, MOV, WebM formats)
- [ ] Upload supports files up to 2GB with chunked/resumable upload
- [ ] User sees real-time upload progress with percentage and estimated time
- [ ] Upload automatically resumes if connection drops
- [ ] User receives confirmation when upload completes with tracking ID
- [ ] Invalid file types/sizes show clear error messages

**P1.2: As a job seeker, I want to provide context about my interview so that the AI analysis is relevant**

Acceptance Criteria:
- [ ] User can input: company name, job title, interview type (behavioral, technical, phone screen)
- [ ] User can add custom notes about interview focus areas
- [ ] User can optionally paste job description for context
- [ ] Metadata is saved immediately (before upload completes)
- [ ] User can edit metadata after upload

**P1.3: As a job seeker, I want to see when my recording is being processed so that I know when to expect results**

Acceptance Criteria:
- [ ] User sees processing status: Uploaded → Transcribing → Analyzing → Complete
- [ ] Each status shows estimated time remaining
- [ ] User receives notification (email/in-app) when analysis is ready
- [ ] User can view all their uploads with current status on dashboard

**P1.4: As a job seeker, I want to view AI insights about my interview performance so that I can improve**

Acceptance Criteria:
- [ ] User sees transcription with timestamps (searchable, downloadable)
- [ ] Speech analysis shows: filler words count, speaking pace (WPM), clarity score
- [ ] Content analysis highlights: answer structure (STAR method usage), relevance to questions
- [ ] Sentiment analysis shows: confidence level, enthusiasm, tone variations over time
- [ ] Overall performance score with breakdown by category
- [ ] Actionable recommendations for improvement

### P2 (Should Have) - Pre-Interview Preparation

**P2.1: As a job seeker, I want to prepare for my interview with AI coaching so that I can practice beforehand**

Acceptance Criteria:
- [ ] User can create "Interview Prep" session with job details
- [ ] AI generates common interview questions based on job type/description
- [ ] User can practice answering questions via text chat with AI
- [ ] AI provides real-time feedback on practice answers
- [ ] User can save prep session for later review

**P2.2: As a job seeker, I want to compare my actual interview performance against my prep work so that I see where I deviated**

Acceptance Criteria:
- [ ] User can link uploaded recording to existing prep session
- [ ] Analysis shows side-by-side comparison: prep answers vs. actual answers
- [ ] System identifies questions that were practiced vs. unexpected questions
- [ ] Highlights where actual answers diverged from prep (better or worse)
- [ ] Shows improvement score (how much better/worse than prep)

### P3 (Nice to Have) - Enhanced Features

**P3.1: As a job seeker, I want to track my interview performance over time so that I can measure improvement**

Acceptance Criteria:
- [ ] Dashboard shows performance trends across multiple interviews
- [ ] Charts for key metrics (confidence, filler words, STAR usage) over time
- [ ] Comparison between different companies/interview types
- [ ] Export performance history as PDF report

**P3.2: As a job seeker, I want to practice specific interview skills so that I can target weak areas**

Acceptance Criteria:
- [ ] AI generates targeted practice questions for weak areas (e.g., behavioral questions)
- [ ] User can drill down on specific skills (storytelling, technical depth, etc.)
- [ ] Practice sessions track skill-specific improvement

## 4. Functional Requirements

### Upload Service
- **FR1:** Accept file uploads via multipart/form-data with support for chunked uploads (tus protocol)
- **FR2:** Validate file type (video/audio only: MP4, MOV, WebM, M4A, WAV) and size (max 2GB)
- **FR3:** Generate unique upload ID and store metadata in Postgres
- **FR4:** Upload files to Azure Blob Storage in `uploads/{userId}/{uploadId}/` structure
- **FR5:** Emit `interview.uploaded` event to Redis Streams with upload metadata
- **FR6:** Track upload progress and allow resumption from last successful chunk
- **FR7:** Generate secure temporary URLs for uploaded files (SAS tokens, 24-hour expiry)

### Processor Service
- **FR8:** Listen to `interview.uploaded` events from Redis
- **FR9:** Submit video to Azure Media Services for transcription and format conversion
- **FR10:** Poll Azure Media Services job status and update Postgres with progress
- **FR11:** Extract audio track if video file submitted
- **FR12:** Store processed transcription in Postgres with timestamps
- **FR13:** Emit `interview.transcribed` event when transcription completes
- **FR14:** Handle processing failures with retries (3 attempts) and dead-letter queue

### AI Analyzer Service
- **FR15:** Listen to `interview.transcribed` events
- **FR16:** Send transcription to OpenAI/Claude for analysis with structured prompts
- **FR17:** Calculate speech metrics: filler words (um, uh, like), speaking pace (WPM), pauses
- **FR18:** Analyze answer structure (STAR method detection, clarity, relevance)
- **FR19:** Perform sentiment analysis on tone and confidence
- **FR20:** If prep session linked, compare actual answers vs. prep answers
- **FR21:** Generate actionable recommendations based on analysis
- **FR22:** Store analysis results in Postgres with scores and insights
- **FR23:** Emit `analysis.completed` event

### Notification Service
- **FR24:** Listen to `analysis.completed` events
- **FR25:** Send email notification to user with analysis summary and dashboard link
- **FR26:** Support in-app notifications via WebSocket for real-time updates
- **FR27:** Track notification delivery status

### API/Frontend Integration
- **FR28:** Next.js API routes handle authentication (Firebase) and proxy to microservices
- **FR29:** Dashboard displays all user interviews with status and quick actions
- **FR30:** Interview detail page shows full analysis with charts and recommendations
- **FR31:** Prep session interface with AI chat for practice questions
- **FR32:** Comparison view showing prep vs. actual performance

## 5. Non-Functional Requirements

### Performance
- **NFR1:** File upload supports minimum 1 Mbps upload speed with chunking for reliability
- **NFR2:** Upload progress updates at least every 2 seconds
- **NFR3:** Transcription completes within 1.5x recording duration (30min video → 45min processing)
- **NFR4:** AI analysis completes within 2 minutes after transcription
- **NFR5:** Dashboard loads in <2 seconds with pagination for large interview lists
- **NFR6:** API response times <500ms for metadata operations (P95)

### Security
- **NFR7:** All service-to-service communication uses Istio mTLS
- **NFR8:** Firebase JWT tokens validated on every API request
- **NFR9:** Azure Blob Storage uses SAS tokens with 24-hour expiry (no permanent public access)
- **NFR10:** User data isolated by userId (no cross-user data access)
- **NFR11:** Uploaded files encrypted at rest in Azure Blob Storage
- **NFR12:** Database credentials stored in Azure Key Vault
- **NFR13:** No PII logged in application logs or traces

### Scalability
- **NFR14:** Upload service handles 100 concurrent uploads
- **NFR15:** Processor service processes up to 50 videos simultaneously
- **NFR16:** Redis Streams supports 1000 events/second throughput
- **NFR17:** Horizontal pod autoscaling based on CPU (scale 1-5 replicas per service)
- **NFR18:** Database supports 10,000 users with 10 interviews each (100k total interviews)

### Reliability
- **NFR19:** Upload service has 99.5% uptime
- **NFR20:** Failed uploads automatically retry from last successful chunk
- **NFR21:** Processing failures send jobs to dead-letter queue after 3 retries
- **NFR22:** Graceful degradation: AI analysis failure still shows transcription
- **NFR23:** Database backups every 24 hours with 7-day retention

### Observability
- **NFR24:** All services emit OpenTelemetry traces to Jaeger via Istio
- **NFR25:** Distributed tracing shows full request flow: upload → process → analyze → notify
- **NFR26:** Prometheus metrics for service health (request rate, latency, error rate)
- **NFR27:** Grafana dashboards for key business metrics (uploads/day, processing time, success rate)
- **NFR28:** Logs aggregated in Azure Application Insights with structured logging

### Maintainability
- **NFR29:** TypeScript strict mode enabled across all services
- **NFR30:** Shared types package for API contracts between services
- **NFR31:** API documentation via OpenAPI/Swagger for all NestJS services
- **NFR32:** Unit test coverage >70% for business logic
- **NFR33:** E2E tests for critical paths (upload → analysis flow)

## 6. Technical Constraints

### Technology Stack
- **Frontend:** Next.js 16.x (existing portfolio analyzer can be cloned/adapted)
- **Backend Services:** NestJS 10.x with TypeScript
- **Event Bus:** Redis Streams for async messaging
- **Database:** PostgreSQL 16 with Prisma ORM
- **Storage:** Azure Blob Storage for uploaded files
- **Video Processing:** Azure Media Services (or Azure Video Indexer as alternative)
- **AI:** OpenAI GPT-4o or Anthropic Claude 3.5 Sonnet
- **Container Runtime:** Docker
- **Orchestration:** Kubernetes (AKS) with Istio service mesh
- **CI/CD:** Azure Pipelines (existing)

### Third-Party Dependencies
- **Firebase Authentication:** User auth and session management
- **Azure Media Services:** Video transcription and processing
- **OpenAI/Anthropic API:** AI analysis and chat
- **Azure Blob Storage:** File storage
- **Azure Cache for Redis:** Event streaming and caching
- **Azure Database for PostgreSQL:** Structured data

### Integration Requirements
- **Istio VirtualServices:** Route traffic to each microservice
- **Sealed Secrets:** Encrypt API keys for Git storage
- **Flux CD:** GitOps deployment of all services
- **Azure Key Vault:** Secret management for database/API credentials

### Platform Requirements
- **AKS Cluster:** Minimum 2 nodes (Standard_B2ms or better)
- **Virtual Nodes (ACI):** For dev/preview environments
- **Istio:** Already deployed with Envoy ingress gateway
- **Node.js:** v20+ for NestJS compatibility
- **PostgreSQL:** Flexible Server (Burstable tier acceptable for MVP)
- **Redis:** Basic tier (6GB cache)

### Compliance Requirements
- **Data Retention:** Interview recordings deleted after 90 days (configurable per user)
- **GDPR:** Users can request data deletion (soft delete from Postgres, hard delete from Blob)
- **No Video Playback:** Users cannot view/download original recordings (privacy by design)

## 7. Edge Cases and Error Handling

### Upload Edge Cases
- **EC1:** User uploads corrupted/unplayable video
  - **Handling:** Azure Media Services validation fails → show user-friendly error with suggestions
- **EC2:** Upload interrupted mid-way
  - **Handling:** Tus protocol resumes from last chunk, no data loss
- **EC3:** User uploads non-interview content (music video, movie)
  - **Handling:** AI detects no speech or irrelevant content → flag for manual review or refund
- **EC4:** Duplicate uploads (same file uploaded twice)
  - **Handling:** Hash-based deduplication, link to existing analysis
- **EC5:** User exceeds storage quota (free tier limit)
  - **Handling:** Reject upload with clear message about upgrade to paid tier

### Processing Edge Cases
- **EC6:** Azure Media Services job fails
  - **Handling:** Retry 3 times with exponential backoff → dead-letter queue → notify support
- **EC7:** Video has no audio track
  - **Handling:** Detect during processing → return error to user before AI analysis
- **EC8:** Audio quality too poor for transcription
  - **Handling:** Azure Media Services confidence score <50% → warn user, offer manual review option
- **EC9:** Extremely long recording (>2 hours)
  - **Handling:** Split into chunks for processing, combine results

### AI Analysis Edge Cases
- **EC10:** OpenAI/Claude API rate limit hit
  - **Handling:** Queue job for retry with backoff, show user "High demand, analysis delayed"
- **EC11:** AI returns low-confidence analysis
  - **Handling:** Flag results as "preliminary", offer re-analysis or human review
- **EC12:** No questions detected in transcript (user talked continuously)
  - **Handling:** Skip STAR analysis, focus on speech patterns only
- **EC13:** Multiple speakers detected (group interview)
  - **Handling:** Attempt speaker diarization, warn user if confidence low

### Data Consistency Edge Cases
- **EC14:** User deletes interview while processing
  - **Handling:** Cancel Azure job, cleanup Blob storage, mark record as deleted
- **EC15:** Redis event lost (network partition)
  - **Handling:** Postgres tracks processing state, cron job re-emits stuck events
- **EC16:** Race condition: user edits metadata while processing
  - **Handling:** Optimistic locking with version field, last-write-wins

### Network/Infrastructure Edge Cases
- **EC17:** Azure Blob Storage temporary outage
  - **Handling:** Uploads queue locally, retry every 30s, timeout after 5 minutes
- **EC18:** Database connection pool exhausted
  - **Handling:** Graceful degradation, queue writes, serve stale reads from cache
- **EC19:** Istio sidecar injection fails
  - **Handling:** Service still works but loses tracing/mTLS, alert monitoring

## 8. Open Questions

### Business Questions
- **Q1:** What is the pricing model? (free tier limits, paid tier pricing)
  - **Context:** Determines storage quotas, API rate limits, feature gating
- **Q2:** Should users be able to share analysis results publicly? (e.g., LinkedIn, portfolio)
  - **Context:** Requires public/private toggle, URL generation, potential social features
- **Q3:** What is acceptable processing SLA? (same-day, <24 hours, <1 hour?)
  - **Context:** Impacts infrastructure costs and user expectations

### Technical Questions
- **Q4:** Should we use Azure Video Indexer instead of Azure Media Services?
  - **Context:** Video Indexer includes AI features (face detection, sentiment) but more expensive
  - **Decision needed by:** Phase 1 architecture design
- **Q5:** How to handle speaker diarization for panel interviews?
  - **Context:** Multiple interviewers, need to separate user's voice from others
  - **Decision needed by:** AI analyzer implementation
- **Q6:** Should prep sessions support voice input (practice speaking aloud)?
  - **Context:** More realistic practice but adds complexity
  - **Decision needed by:** Phase 2 prep feature design

### UX Questions
- **Q7:** How much detail to show during processing? (detailed logs vs. simple progress bar)
  - **Context:** Balance transparency with information overload
- **Q8:** Should users manually map questions in transcript or rely on AI detection?
  - **Context:** AI might miss questions, manual mapping more accurate but tedious
- **Q9:** What's the best way to visualize sentiment over time? (chart type, granularity)
  - **Context:** Needs user testing to validate effectiveness

### Operational Questions
- **Q10:** What monitoring alerts are critical for on-call? (thresholds for failures, latency)
  - **Context:** Defines runbook for production support
- **Q11:** How to handle GDPR deletion requests efficiently?
  - **Context:** Need to cascade delete across Postgres, Blob Storage, Redis, backups
  - **Decision needed by:** Before production launch

## 9. Success Criteria

### MVP Success (Phase 1 - 2-3 weeks)
- [ ] User can upload 1GB video and receive full analysis within 1 hour
- [ ] Speech analysis shows accurate filler word count (±5% manual count)
- [ ] Transcription accuracy >90% for clear audio
- [ ] End-to-end tracing visible in Jaeger for upload → analysis flow
- [ ] All microservices deployed to AKS with Istio mTLS enabled
- [ ] 10 beta users successfully analyze real interviews

### Phase 2 Success (Prep & Comparison - 1-2 weeks)
- [ ] Users can create prep sessions and practice with AI
- [ ] Comparison view shows meaningful differences between prep and actual
- [ ] 80% of beta users report prep feature is "very useful" or "useful"

### Technical Success
- [ ] Zero data loss during upload failures (resumable uploads work)
- [ ] P95 upload-to-analysis latency <1 hour
- [ ] No security incidents (leaked recordings, unauthorized access)
- [ ] Distributed tracing shows <1% failed requests
- [ ] All services auto-scale during load testing (50 concurrent uploads)

### Business Success (Post-MVP)
- [ ] 100 active users within first month
- [ ] 80% of users complete at least 2 interview analyses
- [ ] NPS score >40 among active users
- [ ] <10% processing failure rate

---

## Appendix: System Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│         Istio Ingress Gateway (Envoy)                   │
│       interviewbuddy.slingshotgrp.com                   │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │     Next.js App      │
          │  (Frontend + API)    │
          │  - Auth (Firebase)   │
          │  - Dashboard         │
          │  - Analysis View     │
          └──────────┬───────────┘
                     │
        ┌────────────┼────────────────────┐
        │            │                    │
        ▼            ▼                    ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Upload     │ │  Processor   │ │ AI Analyzer  │
│   Service    │ │   Service    │ │   Service    │
│  (NestJS)    │ │  (NestJS)    │ │  (NestJS)    │
│              │ │              │ │              │
│ - Chunked    │ │ - Azure      │ │ - OpenAI/    │
│   uploads    │ │   Media      │ │   Claude     │
│ - Validation │ │   Services   │ │ - Speech     │
│ - Metadata   │ │ - Job mgmt   │ │   analysis   │
│ - Events     │ │ - Status     │ │ - STAR       │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       │     ┌──────────┴────────┐       │
       │     ▼                   ▼       │
       │ ┌──────────┐      ┌──────────┐ │
       └─│  Azure   │      │  Redis   │─┘
         │  Blob    │      │ Streams  │
         │ Storage  │      │  (Events)│
         └────┬─────┘      └────┬─────┘
              │                 │
              │        ┌────────┴────────┐
              │        ▼                 ▼
              │   ┌──────────┐    ┌──────────────┐
              └───│PostgreSQL│    │ Notification │
                  │ (Metadata│    │   Service    │
                  │  & Results)   │  (NestJS)    │
                  └──────────┘    └──────────────┘

Event Flow:
1. interview.uploaded → Processor
2. interview.transcribed → AI Analyzer
3. analysis.completed → Notification Service
```

## Appendix: Data Model (Simplified)

```typescript
// User (Firebase Auth manages this, we just store userId)

interface Interview {
  id: string;
  userId: string;
  uploadId: string;
  company: string;
  jobTitle: string;
  interviewType: 'behavioral' | 'technical' | 'phone' | 'panel';
  jobDescription?: string;
  notes?: string;
  status: 'uploading' | 'uploaded' | 'transcribing' | 'analyzing' | 'completed' | 'failed';
  blobUrl: string;
  fileSize: number;
  duration?: number; // seconds
  createdAt: Date;
  updatedAt: Date;
}

interface Transcription {
  id: string;
  interviewId: string;
  text: string;
  timestamps: { start: number; end: number; text: string }[];
  confidence: number;
  language: string;
  createdAt: Date;
}

interface Analysis {
  id: string;
  interviewId: string;
  transcriptionId: string;

  // Speech metrics
  fillerWords: { word: string; count: number }[];
  speakingPace: number; // WPM
  pauseCount: number;
  clarityScore: number; // 0-100

  // Content metrics
  starMethodUsage: { question: string; hasSTAR: boolean; score: number }[];
  answerRelevance: number; // 0-100

  // Sentiment
  overallSentiment: 'positive' | 'neutral' | 'negative';
  confidenceLevel: number; // 0-100
  enthusiasmScore: number; // 0-100
  sentimentTimeline: { timestamp: number; sentiment: number }[];

  // Overall
  overallScore: number; // 0-100
  recommendations: string[];

  // Comparison (if linked to prep)
  prepSessionId?: string;
  comparisonMetrics?: {
    questionsMatched: number;
    questionsUnexpected: number;
    improvementScore: number; // -100 to +100
    deviations: { question: string; prepAnswer: string; actualAnswer: string; delta: number }[];
  };

  createdAt: Date;
}

interface PrepSession {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  jobDescription?: string;

  questions: { id: string; question: string; aiGenerated: boolean }[];
  practiceAnswers: { questionId: string; answer: string; aiFeedback: string }[];

  createdAt: Date;
  updatedAt: Date;
}
```
