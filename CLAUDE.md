# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Interview Buddy** is an AI-powered interview recording analysis platform built as a microservices architecture on AKS with Istio. Users upload interview recordings (video/audio), and the platform provides structured AI insights on speech patterns, content quality, and performance comparison against pre-interview preparation.

**Key Design Principle:** Users never see/hear their original recordings - only structured data and AI insights. This enables private interview recording without exposing raw media.

## Development Standards & Decision-Making

### 1. Always Verify Current Information

**ALWAYS consult context7 (an MCP server) or perform a web search before selecting version numbers or presenting information that could have changed since training data.**

- Package versions (NestJS, Next.js, Prisma, Azure SDKs, etc.)
- API capabilities and breaking changes
- Cloud service pricing and limits
- Best practices and patterns that may have evolved

Example: Before suggesting `@nestjs/microservices: ^10.x`, search for the latest stable version and any known issues.

### 2. Always Consult Documentation

**ALWAYS consult official documentation and best practices before committing to an implementation path.**

Available documentation sources:

- **NestJS Docs:** https://docs.nestjs.com/ (no MCP server, use WebFetch)
- **Microsoft Azure Docs:** Available via MCP server for Azure-specific services
- **Package README files:** Check npm package documentation for latest usage patterns
- **Official GitHub repos:** For example code and issue tracking

When in doubt:

1. Search for the official docs
2. Review relevant sections (architecture, best practices, troubleshooting)
3. Cross-reference with recent Stack Overflow/GitHub issues if needed
4. Present findings before implementing

Example workflow:

```
User: "Set up Redis Streams for NestJS"
Claude:
1. Fetch NestJS microservices docs via WebFetch
2. Review Redis transport configuration options
3. Check @nestjs/microservices npm page for version compatibility
4. Present recommended approach with documentation references
```

### 3. Prefer "Two-Way Doors" (Reversible Decisions)

**When facing a technical crossroads, always ask: "How hard is it to walk back through this door?"**

#### Decision Categories

**One-Way Doors (Irreversible):**

- Changing database engine (Postgres → MongoDB)
- Switching cloud providers (Azure → AWS)
- Adopting a monorepo vs. polyrepo structure
- Choosing synchronous vs. event-driven architecture
- Selecting a service mesh (Istio vs. Linkerd)

**Action Required:** Evaluate all options carefully, measure tradeoffs, discuss with team before proceeding.

**Two-Way Doors (Easily Reversible):**

- Choosing between Redis libraries (`ioredis` vs `redis`)
- File upload library (Multer vs Busboy)
- Testing framework (Jest vs Vitest)
- Code formatting rules (Prettier config)
- CI/CD pipeline details

**Action Required:** Pick the most practical option and move forward quickly. Can be changed later with minimal cost.

#### Evaluation Framework for One-Way Doors

When facing an irreversible decision, document:

1. **What changes if we go down this path?**

   - Dependencies introduced
   - Team knowledge required
   - Integration complexity

2. **What would it take to reverse this decision?**

   - Time estimate (days/weeks/months)
   - Data migration requirements
   - Breaking changes to APIs or user experience

3. **What are the alternatives?**

   - List at least 2-3 options
   - Pros/cons for each
   - Evidence from documentation/community

4. **What's the recommendation?**
   - Clear choice with rationale
   - Acceptable tradeoffs
   - Migration path if we need to reverse later

#### Example: One-Way Door Decision

**Question:** Should we use Azure Media Services or Azure Video Indexer for transcription?

**Analysis:**

- **One-way door?** Yes - switching later means rewriting processor-service and changing storage format
- **Azure Media Services:**
  - Pro: Lower cost (~$0.015/min), simple transcription
  - Con: No built-in sentiment analysis, requires separate AI service
- **Azure Video Indexer:**
  - Pro: Built-in AI features (face detection, sentiment, topics)
  - Con: Higher cost (~$0.05/min), more complex API
- **Recommendation:** Start with Media Services (cost-effective for MVP), keep processor-service abstracted so we can switch to Video Indexer in Phase 2 if needed

**Acceptance Criteria:** Processor-service uses an interface for transcription provider, making the future swap a two-way door.

## Architecture

### Microservices Structure

This is a **monorepo** project with multiple NestJS microservices and a Next.js frontend:

```
apps/
├── web/                    # Next.js frontend (acts as API gateway)
├── upload-service/         # File upload handling, Azure Blob storage
├── processor-service/      # Azure Media Services integration, transcription
├── ai-analyzer-service/    # OpenAI/Claude analysis, speech metrics
└── notification-service/   # Email/push notifications

packages/
├── shared-types/          # Shared TypeScript interfaces across all services
├── shared-utils/          # Common utilities
└── prisma-client/         # Shared Prisma database client
```

### Service Communication

- **Ingress:** Istio Gateway routes traffic to Next.js app
- **Gateway:** Next.js API routes orchestrate calls to microservices
- **Events:** Redis Streams for async event-driven communication between services
- **Service Mesh:** Istio handles mTLS, distributed tracing, circuit breaking, traffic splitting

### Event Flow

```
1. User uploads → Next.js → upload-service
2. upload-service → Azure Blob + emit interview.uploaded event
3. processor-service (consumes event) → Azure Media Services → transcription
4. processor-service → emit interview.transcribed event
5. ai-analyzer-service (consumes event) → OpenAI/Claude → analysis results
6. ai-analyzer-service → emit analysis.completed event
7. notification-service (consumes event) → send email/push
```

## Technology Stack

- **Frontend:** Next.js 16.x with TypeScript
- **Backend:** NestJS 10.x microservices with TypeScript
- **Event Bus:** Redis Streams (`@nestjs/microservices` with Redis transport)
- **Database:** PostgreSQL 16 with Prisma ORM
- **Storage:** Azure Blob Storage (via `@azure/storage-blob`)
- **Video Processing:** Azure Media Services (transcription + format conversion)
- **AI:** OpenAI GPT-4o or Anthropic Claude 3.5 Sonnet
- **Auth:** Firebase Authentication (existing)
- **Deployment:** Kubernetes (AKS) + Istio service mesh + Flux CD (GitOps)
- **Observability:** Istio + Jaeger (tracing), Prometheus + Grafana (metrics)

## Development Commands

_Note: This project is in initial setup phase. Commands will be added as monorepo structure is scaffolded._

### Monorepo Management

```bash
# Install dependencies for all workspaces
npm install

# Build all services
npm run build

# Run tests across all services
npm test

# Lint all services
npm run lint
```

### Running Services Locally

```bash
# Start Next.js frontend (dev mode)
cd apps/web && npm run dev

# Start upload service
cd apps/upload-service && npm run start:dev

# Start processor service
cd apps/processor-service && npm run start:dev

# Start AI analyzer service
cd apps/ai-analyzer-service && npm run start:dev
```

### Database Operations

```bash
# Generate Prisma client
cd packages/prisma-client && npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio (database GUI)
npx prisma studio
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -k manifests/dev/

# Reconcile with Flux (GitOps)
flux reconcile kustomization apps-dev

# Check pod status
kubectl get pods -n default

# View logs for a service
kubectl logs -n default -l app=upload-service --tail=50

# Port-forward for local testing
kubectl port-forward svc/upload-service 3001:3001
```

### Docker Build

```bash
# Build upload service Docker image
docker build -t interviewbuddy.azurecr.io/upload-service:latest -f apps/upload-service/Dockerfile .

# Push to ACR
docker push interviewbuddy.azurecr.io/upload-service:latest
```

## Key Architectural Concepts

### Event-Driven Communication

Services communicate asynchronously via Redis Streams using NestJS microservices:

```typescript
// Emit event
this.eventEmitter.emit('interview.uploaded', {
  interviewId: '123',
  userId: 'user-456',
  blobUrl: 'https://...',
});

// Consume event
@EventPattern('interview.uploaded')
async handleUpload(data: InterviewUploadedEvent) {
  // Process event
}
```

### Istio Service Mesh

- **mTLS:** All service-to-service communication is encrypted automatically by Istio
- **Traffic Management:** Use VirtualServices for canary deployments (test new AI models on 10% of traffic)
- **Observability:** Distributed tracing via Jaeger shows full request path across services
- **Resilience:** Circuit breakers, retries, and timeouts configured via DestinationRules

### File Upload Strategy

- **Chunked Uploads:** Use tus protocol for resumable uploads (files up to 2GB)
- **Storage:** Files uploaded to Azure Blob Storage in structure: `uploads/{userId}/{uploadId}/`
- **Security:** SAS tokens with 24-hour expiry for temporary access
- **Privacy:** Users cannot view/download original recordings - only structured analysis results

### AI Analysis Pipeline

1. Extract transcription from Azure Media Services (with timestamps)
2. Calculate speech metrics: filler words (um, uh, like), WPM, pauses
3. Analyze answer structure: STAR method detection, relevance scoring
4. Sentiment analysis: confidence, enthusiasm, tone over time
5. If prep session exists: compare actual vs. prepared answers
6. Generate actionable recommendations

## Data Model Patterns

### Core Entities

- **Interview:** Main entity tracking upload status, metadata (company, job title, type), links to transcription and analysis
- **Transcription:** Full text with timestamps, confidence score, language
- **Analysis:** Speech metrics, content analysis, sentiment, overall score, recommendations
- **PrepSession:** Pre-interview practice with AI-generated questions and practice answers
- **Comparison:** Links prep session to actual interview, shows deviations and improvement score

### Status State Machine

```
Interview Status Flow:
uploading → uploaded → transcribing → analyzing → completed
                                   ↓
                                 failed (with retry mechanism)
```

### Data Isolation

- All user data filtered by `userId` (Firebase JWT provides this)
- No cross-user data access
- Soft delete strategy: mark as deleted in Postgres, schedule Blob cleanup

## Testing Strategy

### Unit Tests

- Focus on business logic in NestJS services
- Mock external dependencies (Azure services, OpenAI/Claude, Redis)
- Target >70% coverage for core logic

### Integration Tests

- Test Redis event flows between services
- Test Prisma database operations
- Mock only external Azure/AI APIs

### E2E Tests

- Critical path: upload → transcription → analysis flow
- Run against dev environment in AKS
- Use test fixtures for sample videos

## Deployment Strategy

### Environments

- **Dev:** Auto-deploy from feature branches, runs on Virtual Nodes (ACI) for cost savings
- **Staging:** Deploy from `main` branch, full replica of production
- **Production:** Manual promotion from staging, runs on dedicated node pool

### GitOps with Flux

- All infrastructure defined in `manifests/` directory
- Flux watches Git repo and auto-applies changes
- Sealed Secrets for encrypted credentials in Git
- Azure Key Vault for runtime secret injection

### Istio Configuration

Each service requires:

- **Deployment:** Pod spec with resource limits
- **Service:** ClusterIP service for internal communication
- **VirtualService:** Routing rules (e.g., canary deployments)
- **DestinationRule:** Circuit breakers, load balancing, mTLS settings

## Important Constraints

### File Processing Limits

- Max file size: 2GB
- Supported formats: MP4, MOV, WebM (video), M4A, WAV (audio)
- Transcription SLA: 1.5x recording duration (30min video → 45min processing)
- AI analysis SLA: <2 minutes after transcription

### Cost Optimization

- Dev/preview environments run on Virtual Nodes (pay-per-second)
- Production uses autoscaling node pools (1-5 replicas per service)
- Videos auto-deleted after 90 days to save storage costs

### Security Requirements

- All API requests require valid Firebase JWT
- Service-to-service communication uses Istio mTLS
- No PII in logs or distributed traces
- Azure Blob Storage encrypted at rest
- Database credentials stored in Azure Key Vault

## Common Pitfalls

### Istio-Specific Issues

- **Problem:** Pods fail with "connection refused" between services

  - **Solution:** Ensure Istio sidecar injection enabled (`istio-injection=enabled` namespace label)

- **Problem:** Distributed tracing not showing up in Jaeger
  - **Solution:** Services must propagate trace headers (NestJS does this automatically with OpenTelemetry)

### Redis Streams

- **Problem:** Events getting lost during deployment
  - **Solution:** Use consumer groups with acknowledgment, implement dead-letter queue for failed processing

### Azure Media Services

- **Problem:** Transcription job stuck in "queued" state
  - **Solution:** Poll job status with exponential backoff, set max timeout (2x file duration), send to DLQ if exceeds

### Large File Uploads

- **Problem:** Upload fails at 99% or timeouts
  - **Solution:** Use tus protocol for chunking, set nginx/ingress timeout to 30min, enable client-side retry

## MVP Scope

### Phase 1 (Current - 2-3 weeks)

Focus on core upload → process → analyze flow:

1. Scaffold monorepo with NestJS services
2. Implement upload-service with Azure Blob integration
3. Implement processor-service with Azure Media Services
4. Implement ai-analyzer-service with OpenAI/Claude
5. Wire Redis events between services
6. Basic Next.js dashboard showing upload status
7. Deploy to AKS with Istio

### Phase 2 (Future)

- Pre-interview prep sessions with AI coaching
- Comparison view (prep vs. actual performance)
- Performance tracking over time
- Enhanced UX (charts, recommendations)

## Reference Documentation

- Specification: `specs/spec.md` (comprehensive feature requirements)
- Architecture decisions documented in code comments
- API contracts defined via OpenAPI/Swagger in each NestJS service
