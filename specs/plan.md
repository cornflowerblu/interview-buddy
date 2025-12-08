# Implementation Plan: Interview Buddy MVP

**Branch**: `main` | **Date**: 2025-12-08 | **Spec**: [spec.md](./spec.md)

## Summary

Interview Buddy is an AI-powered interview recording analysis platform built as a microservices architecture. Users upload interview recordings (video/audio up to 2GB), and the system provides structured AI insights on speech patterns, content quality, and performance. The platform uses an event-driven architecture with NestJS microservices, deployed to AKS with Istio service mesh, using Azure Media Services for transcription and OpenAI/Claude for analysis.

**Key Technical Approach**: Event-driven microservices (upload → processor → AI analyzer) communicating via Redis Streams, with Next.js frontend as API gateway, deployed via Flux GitOps to AKS with Istio.

## Technical Context

**Language/Version**: TypeScript with Node.js v20+
**Primary Dependencies**:
- Backend: NestJS 11.x, Prisma ORM, @nestjs/microservices (Redis transport)
- Frontend: Next.js 16.x (standalone output mode)
- Event Bus: Redis Streams via @nestjs/microservices
- Storage: @azure/storage-blob SDK
- Video Processing: Azure Media Services REST API
- AI: OpenAI SDK (gpt-4o) or Anthropic SDK (claude-3-5-sonnet)

**Storage**:
- **Database**: Azure Database for PostgreSQL 16 Flexible Server
  - Standard managed PostgreSQL (not Cosmos DB for PostgreSQL - that's distributed/Citus, overkill for MVP scale)
  - Burstable tier for dev, scale vertically as needed
  - Prisma ORM with full relational support (JOINs, foreign keys, transactions)
  - JSON columns available for flexible analysis results if needed
- Azure Blob Storage - uploaded video/audio files
- Redis - event streaming and caching
  - **Dev/Local**: Redis deployed in Kubernetes (Minikube/AKS dev namespace) - cost-effective, fast iteration
  - **Production**: Migrate to Azure Cache for Redis when ready - easily reversible decision (just connection string change)

**Testing**: Jest (unit + integration), Playwright (E2E for Next.js)
**Target Platform**: Kubernetes (AKS) with Istio service mesh, containerized with Docker
**Project Type**: Monorepo with multiple NestJS microservices + Next.js frontend
**Performance Goals**:
- Upload: Support 100 concurrent uploads, chunked resumable protocol
- Transcription: <1.5x recording duration (30min video → 45min max)
- AI Analysis: <2 minutes after transcription completes
- API: P95 latency <500ms for metadata operations

**Constraints**:
- Max file size: 2GB per upload
- Service-to-service communication must use Istio mTLS
- No raw video/audio playback in UI (privacy by design)
- User data isolation enforced by Firebase JWT userId

**Scale/Scope**:
- MVP: 100 beta users, ~1000 total interviews
- Production target: 10,000 users, 100,000 interviews
- 4 microservices + 1 Next.js app + shared packages

## Constitution Check

Since there is no project-specific constitution defined, applying general best practices:

**✅ Microservices Pattern**: Justified for this project
- **Why needed**: Different scaling requirements (upload vs. processing), technology isolation (Azure SDK vs. OpenAI), independent deployment
- **Complexity acknowledged**: Requires event bus, distributed tracing, service mesh

**✅ Event-Driven Architecture**: Redis Streams for async communication
- **Why needed**: Long-running processing (transcription takes minutes), loose coupling, resilience to service failures
- **Simpler alternative rejected**: Synchronous HTTP would block uploads waiting for analysis, poor UX

**✅ Service Mesh (Istio)**: Required for production
- **Why needed**: mTLS between services, distributed tracing, observability, traffic management
- **Complexity acknowledged**: Additional infrastructure overhead, learning curve

**⚠️ Multiple Storage Systems** (Postgres + Blob + Redis):
- **Why needed**: Each optimized for use case (structured metadata, large files, event streaming)
- **Complexity acknowledged**: Consistency challenges, multiple SDKs to manage

**Post-Phase 1 Re-evaluation**: Will verify chosen libraries and infrastructure patterns align with actual implementation constraints.

## Project Structure

### Documentation (existing)

```text
specs/
├── plan.md              # This file
├── spec.md              # Feature specification (existing)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
└── tasks.md             # Created by /speckit.tasks command
```

### Source Code (monorepo structure - ALREADY EXISTS)

```text
apps/
├── web/                          # Next.js frontend + API gateway
│   ├── src/
│   │   ├── app/                 # App router pages
│   │   ├── components/          # React components
│   │   └── lib/                 # Client utilities, API clients
│   ├── public/
│   └── tests/
│
├── upload-service/              # File upload handling
│   ├── src/
│   │   ├── modules/
│   │   │   ├── upload/          # Upload controller, service
│   │   │   └── storage/         # Azure Blob integration
│   │   ├── events/              # Redis event emitters
│   │   └── main.ts
│   └── test/
│
├── processor-service/           # Azure Media Services integration
│   ├── src/
│   │   ├── modules/
│   │   │   ├── transcription/   # Media Services client
│   │   │   └── jobs/            # Job polling, status tracking
│   │   ├── events/              # Redis consumers/emitters
│   │   └── main.ts
│   └── test/
│
├── ai-analyzer-service/         # OpenAI/Claude analysis
│   ├── src/
│   │   ├── modules/
│   │   │   ├── analysis/        # Speech metrics, STAR detection
│   │   │   ├── ai/              # OpenAI/Claude client
│   │   │   └── comparison/      # Prep vs. actual comparison
│   │   ├── events/              # Redis consumers/emitters
│   │   └── main.ts
│   └── test/
│
└── notification-service/        # Email + in-app notifications
    ├── src/
    │   ├── modules/
    │   │   ├── email/           # Email templates, sender
    │   │   └── websocket/       # Real-time notifications
    │   ├── events/              # Redis consumers
    │   └── main.ts
    └── test/

packages/
├── shared-types/                # Shared TypeScript interfaces
│   └── src/
│       ├── events/              # Event payloads
│       ├── models/              # Domain entities
│       └── api/                 # API contracts
│
├── shared-utils/                # Common utilities
│   └── src/
│       ├── validation/
│       ├── logging/
│       └── errors/
│
└── prisma-client/               # Shared Prisma schema + client
    ├── prisma/
    │   └── schema.prisma
    └── src/
        └── index.ts

manifests/                       # Kubernetes manifests (ALREADY EXISTS)
├── dev/                         # Dev environment
│   ├── namespace.yaml
│   ├── *-deployment.yaml
│   └── kustomization.yaml
└── local/                       # Minikube overlay
    └── kustomization.yaml

flux/                            # Flux GitOps (ALREADY EXISTS)
├── gitrepository.yaml
└── kustomization.yaml
```

**Structure Decision**: Monorepo with multiple apps (microservices) + shared packages. This aligns with the existing project structure already scaffolded. Each NestJS service is independently deployable with shared type safety via packages.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 4 NestJS services + 1 Next.js app | Different scaling/tech requirements | Monolith would couple upload (I/O bound) with AI analysis (CPU bound), poor resource utilization |
| Multiple storage backends | Each optimized for use case | Single Postgres DB can't handle 2GB file uploads efficiently; Redis needed for event streaming |
| Istio service mesh | Production requirement for mTLS + observability | Manual TLS cert management error-prone; distributed tracing critical for debugging async flows |
| Azure Media Services | Only viable option for video transcription at scale | Open-source alternatives (Whisper self-hosted) too expensive/complex to scale |

---

## Phase 0: Research (NEEDS CLARIFICATION items)

The following unknowns must be researched before Phase 1:

### R1: Azure Media Services vs. Azure Video Indexer

**Decision needed**: Which Azure service for video transcription?

**Research tasks**:
1. Compare pricing: Media Services vs. Video Indexer for 30min video
2. Evaluate Video Indexer AI features (face detection, sentiment) - are they useful?
3. Check transcription accuracy benchmarks for interview audio
4. Assess API complexity and NestJS integration patterns

**Output**: Decision documented in research.md with cost/benefit analysis

### R2: Multi-Model AI Strategy via Azure AI Foundry

**Decision needed**: How to implement user-selectable or auto-routed model selection?

**Research tasks**:
1. Evaluate Azure AI Foundry model catalog (GPT-4o, Claude, Nova, Mistral, etc.)
2. Test prompt effectiveness across models for STAR method detection, sentiment analysis
3. Build cost/quality matrix: Nova (cheap) → GPT-4o (expensive) with quality scores
4. Design "Auto" routing logic: simple queries → cheap model, complex analysis → premium model
5. Implement model selection API: user preference override or auto-route
6. Check rate limits and fallback strategies per model

**Output**: Multi-model architecture with routing logic, cost calculator, example prompts per model

### R3: File Upload Strategy (tus protocol)

**Decision needed**: Best library for resumable uploads in Next.js + NestJS

**Research tasks**:
1. Evaluate `tus-js-client` (frontend) + `@tus/server` (backend)
2. Alternative: Uppy.js with tus plugin
3. Check Azure Blob SDK compatibility with chunked uploads
4. Validate resume-from-failure scenarios

**Output**: Chosen library with integration guide

### R4: Redis Streams NestJS Integration

**Decision needed**: Best practices for @nestjs/microservices with Redis transport

**Research tasks**:
1. Review NestJS docs for Redis Streams microservice setup
2. Find consumer group patterns (multiple instances, load balancing)
3. Error handling and dead-letter queue strategies
4. Event schema versioning approaches

**Output**: Architecture decision for event-driven communication

### R5: Azure Database Selection

**Decision needed**: Which Azure database product for structured + JSON data?

**Research tasks**:
1. Compare Azure Database for PostgreSQL vs. Cosmos DB for PostgreSQL vs. Cosmos DB (SQL API)
2. Evaluate Prisma ORM support for each option
3. Check pricing: compute + storage costs for MVP scale (100 users, 1000 interviews)
4. Assess JSON field support (Analysis results have flexible structure)
5. Test NestJS integration patterns for chosen database

**Output**: Selected database with cost analysis and Prisma compatibility confirmed

### R6: Prisma Schema Design for Microservices

**Decision needed**: Shared schema vs. per-service schemas (depends on R5 database choice)

**Research tasks**:
1. Evaluate monorepo patterns: single Prisma schema vs. multiple
2. Check migration strategy for shared database
3. Service data ownership boundaries (who writes Interview vs. Transcription?)
4. Foreign key constraints across service boundaries

**Output**: Data ownership matrix, migration strategy

### R7: Speaker Diarization Requirements

**Decision needed**: How to separate user voice from interviewer(s)?

**Research tasks**:
1. Check if Azure Media Services supports speaker separation
2. Evaluate accuracy for multi-speaker scenarios
3. Fallback: Assume single speaker for MVP, flag multi-speaker recordings
4. UX implications (how to show multi-speaker analysis)

**Output**: Technical approach or MVP scope limitation

---

## Phase 1: Design & Contracts

**Prerequisites**: All Phase 0 research tasks completed

### Outputs:

1. **data-model.md**: Prisma schema with all entities from spec.md Appendix
   - Interview, Transcription, Analysis, PrepSession models
   - Relationships and foreign keys
   - Indexes for query performance
   - Data ownership per service

2. **contracts/** directory:
   - `upload-service.openapi.yaml`: POST /upload, GET /upload/:id, PATCH /upload/:id/metadata
   - `processor-service.openapi.yaml`: Internal event handlers (no HTTP API)
   - `ai-analyzer-service.openapi.yaml`: GET /analysis/:interviewId, POST /analysis/compare
   - `web-api.openapi.yaml`: Next.js API routes (aggregates all services)
   - Event schemas: `events.schema.json` for Redis Stream payloads

3. **quickstart.md**: Developer setup guide
   - Local development with Minikube + Istio + Flux
   - Environment variables and secrets setup
   - Database migrations and seeding
   - Running services individually vs. full stack
   - Testing strategies (unit, integration, E2E)

4. **Agent context update**: Run `.specify/scripts/bash/update-agent-context.sh claude`
   - Updates CLAUDE.md with chosen technologies from research
   - Preserves existing manual content

---

## Next Steps

1. **Execute Phase 0**: Create `research.md` by resolving all NEEDS CLARIFICATION items (R1-R6)
2. **Execute Phase 1**: Generate data-model.md, contracts/, quickstart.md
3. **Run `/speckit.tasks`**: Generate actionable tasks.md based on completed plan
4. **Begin implementation**: Start with Setup phase tasks from tasks.md

