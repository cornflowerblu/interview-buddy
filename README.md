# Interview Buddy - AI-Powered Interview Analysis Platform

**Status**: 🚧 Active Development - MVP Phase
**Architecture**: Event-Driven Microservices on Azure Kubernetes (AKS) with Istio
**Target**: Help job seekers improve interview skills with AI-powered feedback

---

## 📋 Table of Contents

- [Overview](#overview)
- [Quick Links](#quick-links)
- [Architecture](#architecture)
- [Team Member Guide](#team-member-guide)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Technology Stack](#technology-stack)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)

---

## Overview

Interview Buddy allows users to upload interview recordings (video/audio) and receive comprehensive AI-powered analysis of their performance. The platform analyzes speech patterns, content quality, sentiment, and provides actionable recommendations for improvement.

### Key Features (MVP)

✅ **Upload & Process** - Resumable uploads up to 2GB, automatic transcription via Azure Video Indexer
✅ **AI Analysis** - Multi-model AI strategy (GPT-4o, Claude, Amazon Nova) for cost-optimized analysis
✅ **Speech Metrics** - Filler word detection, speaking pace (WPM), pause analysis
✅ **Content Analysis** - STAR method detection, answer relevance scoring
✅ **Sentiment Analysis** - Confidence level, enthusiasm tracking over time
✅ **Recommendations** - Actionable feedback for improvement
🔄 **Prep Sessions** - Practice with AI coaching before interviews (Phase 2)
🔄 **Comparison** - Compare actual performance vs. prep work (Phase 2)

### Privacy by Design

Users **never see or download** their original recordings - only structured analysis and insights. All recordings stored securely in Azure with automatic deletion after 90 days.

---

## Quick Links

### 📚 Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| **[CLAUDE.md](./CLAUDE.md)** | Project standards, decision-making framework, architecture context | All team members |
| **[LINTING_AND_FORMATTING.md](./LINTING_AND_FORMATTING.md)** | ESLint and Prettier configuration, code quality standards | All developers |
| **[specs/spec.md](./specs/spec.md)** | Complete feature specification with user stories (P1, P2, P3) | Product, Backend, Frontend |
| **[specs/plan.md](./specs/plan.md)** | Implementation plan, technical approach, architecture decisions | Backend, DevOps, Orchestrator |
| **[specs/research.md](./specs/research.md)** | Research findings and technology decisions | Backend, DevOps |
| **[specs/data-model.md](./specs/data-model.md)** | Prisma database schema | Backend, Data |
| **[specs/contracts/](./specs/contracts/)** | API contracts and event schemas | Backend, Frontend |
| **[specs/tasks.md](./specs/tasks.md)** | 180 actionable tasks organized by user story | All team members |
| **[specs/quickstart.md](./specs/quickstart.md)** | Developer setup guide | All developers |

### 🎯 Getting Started Checklist

- [ ] Read [CLAUDE.md](./CLAUDE.md) for project standards
- [ ] Review [specs/plan.md](./specs/plan.md) for architecture overview
- [ ] Check [specs/tasks.md](./specs/tasks.md) for your role's tasks
- [ ] Follow [specs/quickstart.md](./specs/quickstart.md) to set up local environment
- [ ] Review your role-specific guide below

---

## Architecture

### System Overview

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
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       │     ┌──────────┴────────┐       │
       │     ▼                   ▼       │
       │ ┌──────────┐      ┌──────────┐ │
       └─│  Video   │      │  Redis   │─┘
         │ Indexer  │      │ Streams  │
         │  (Azure) │      │  (Events)│
         └────┬─────┘      └────┬─────┘
              │                 │
              │        ┌────────┴────────┐
              │        ▼                 ▼
              │   ┌──────────┐    ┌──────────────┐
              └───│PostgreSQL│    │ Notification │
                  │ (Metadata│    │   Service    │
                  │  + Results)   │  (NestJS)    │
                  └──────────┘    └──────────────┘
```

### Event Flow

```
1. User uploads → Next.js → Video Indexer (direct upload)
2. Video Indexer → webhook → processor-service → store transcription
3. processor-service → emit interview.transcribed event → Redis
4. ai-analyzer-service → consume event → Azure AI Foundry → analysis
5. ai-analyzer-service → emit analysis.completed event → Redis
6. notification-service → consume event → send email notification
```

### Key Architectural Decisions

| Decision | Rationale | Document |
|----------|-----------|----------|
| **Azure Video Indexer** (not Media Services) | Built-in speaker diarization, AI insights, simplified architecture | [research.md R1](./specs/research.md#r1-azure-video-indexer-vs-azure-media-services) |
| **Multi-Model AI via Foundry** | Cost optimization (~$0.05/interview), user choice, unified API | [research.md R2](./specs/research.md#r2-multi-model-ai-strategy-via-azure-ai-foundry) |
| **Redis Streams** (not HTTP) | Event-driven, resilient, load balancing via consumer groups | [research.md R4](./specs/research.md#r4-redis-streams-nestjs-integration) |
| **Shared Prisma Schema** | Single source of truth, easier migrations, type safety | [research.md R6](./specs/research.md#r6-prisma-schema-design-for-microservices) |
| **Direct Video Indexer Upload** | Simpler architecture, no Azure Blob initially | [research.md R3](./specs/research.md#r3-file-upload-strategy-tus-protocol) |

---

## Team Member Guide

### 🎨 Frontend Developer

**Your Focus**: Next.js 16 frontend + API gateway

**Key Files**:
- `apps/web/` - Next.js application
- [specs/spec.md](./specs/spec.md) - User stories and acceptance criteria
- [specs/contracts/README.md](./specs/contracts/README.md) - API endpoints

**Your Tasks** (from [tasks.md](./specs/tasks.md)):
- T027-T033: Next.js setup and Firebase auth
- T050-T053: Upload UI with resumable uploads (tus-js-client)
- T059-T062: Metadata forms
- T078-T081: Dashboard with status polling
- T113-T119: Analysis results visualization

**Key Technologies**:
- Next.js 16 (App Router, standalone output mode)
- Firebase Authentication (JWT validation)
- tus-js-client (resumable uploads)
- SWR or React Query (data fetching)
- Tailwind CSS (styling - assumed)

**Getting Started**:
1. Read [specs/spec.md](./specs/spec.md) user stories P1.1-P1.4
2. Review [specs/contracts/README.md](./specs/contracts/README.md) for API routes
3. Start with T027: Initialize Next.js app

---

### ⚙️ Backend Developer

**Your Focus**: NestJS microservices (upload, processor, ai-analyzer, notification)

**Key Files**:
- `apps/upload-service/` - File upload handling
- `apps/processor-service/` - Video Indexer integration
- `apps/ai-analyzer-service/` - AI analysis orchestration
- `apps/notification-service/` - Email notifications
- `packages/` - Shared types, utils, Prisma client

**Your Tasks** (from [tasks.md](./specs/tasks.md)):
- T034-T049: Upload service with Video Indexer integration
- T063-T077: Processor service with webhook handling
- T091-T112: AI analyzer service with multi-model routing
- T082-T090: Notification service

**Key Technologies**:
- NestJS 11.x with TypeScript
- @nestjs/microservices (Redis transport)
- Prisma ORM
- Azure Video Indexer SDK
- OpenAI SDK (for Azure AI Foundry)

**Key Patterns**:
- Event-driven communication (Redis Streams)
- Service data ownership (see [research.md R6](./specs/research.md#r6-prisma-schema-design-for-microservices))
- Dead-letter queue for failed events
- Webhook-based processing (not polling)

**Getting Started**:
1. Read [research.md](./specs/research.md) for all architectural decisions
2. Review [specs/data-model.md](./specs/data-model.md) for Prisma schema
3. Check [specs/contracts/events.md](./specs/contracts/events.md) for event schemas
4. Start with T034: Initialize upload-service

---

### 🗄️ Data Engineer

**Your Focus**: Database schema, migrations, data ownership

**Key Files**:
- `packages/prisma-client/prisma/schema.prisma` - Database schema
- [specs/data-model.md](./specs/data-model.md) - Schema design

**Your Tasks** (from [tasks.md](./specs/tasks.md)):
- T010-T014: Define Prisma models and create migrations
- T054-T055: Add metadata fields and migrations
- T120-T121, T131-T132, T135-T136, T149-T150: Schema evolution for Phase 2/3

**Key Decisions**:
- **Shared schema** across all services (not per-service databases)
- **Service ownership** - each service owns specific tables (write access)
- **Json columns** for flexibility (avoids constant migrations)
- See [research.md R6](./specs/research.md#r6-prisma-schema-design-for-microservices) for data ownership matrix

**Schema Overview** (from [data-model.md](./specs/data-model.md)):
- **Interview** - Owned by upload-service
- **Transcription** - Owned by processor-service
- **Analysis** - Owned by ai-analyzer-service
- **PrepSession** - Owned by web (Next.js)

**Getting Started**:
1. Review [specs/data-model.md](./specs/data-model.md)
2. Understand service ownership boundaries in [research.md R6](./specs/research.md#r6-prisma-schema-design-for-microservices)
3. Start with T010: Define Interview model

---

### 🚀 DevOps Engineer

**Your Focus**: Kubernetes, Istio, CI/CD, infrastructure

**Key Files**:
- `manifests/local/` - Minikube/dev environment manifests
- `manifests/dev/` - AKS dev environment (to be created)
- `flux/` - Flux GitOps configuration
- [specs/plan.md](./specs/plan.md) - Infrastructure architecture

**Your Tasks** (from [tasks.md](./specs/tasks.md)):
- T020-T026: Redis, PostgreSQL Kubernetes deployments
- T047-T049: Upload service K8s deployment + Istio VirtualService
- T076-T077: Processor service K8s deployment
- T111-T112: AI analyzer service K8s deployment
- T090: Notification service K8s deployment
- T159-T162: Observability (Jaeger, Grafana, Prometheus)
- T176-T180: Production deployment setup

**Key Technologies**:
- Kubernetes (Minikube local, AKS production)
- Istio service mesh (mTLS, distributed tracing, traffic management)
- Flux CD (GitOps)
- Docker (containerization)
- Azure Container Registry (ACR)

**Infrastructure Services**:
- **Dev/Local**: Redis + PostgreSQL deployed in Kubernetes
- **Production**: Migrate to Azure Cache for Redis, Azure Database for PostgreSQL
- See [plan.md](./specs/plan.md#technical-context) for reasoning

**Getting Started**:
1. Review [specs/plan.md](./specs/plan.md) infrastructure section
2. Check existing manifests in `manifests/local/`
3. Read [research.md R4](./specs/research.md#r4-redis-streams-nestjs-integration) for Redis Streams architecture
4. Start with T020: Create Redis deployment manifest

---

### 🔒 Security Engineer

**Your Focus**: Authentication, authorization, secrets management, security best practices

**Key Files**:
- [specs/spec.md](./specs/spec.md) - Security requirements (NFR7-NFR13)
- [CLAUDE.md](./CLAUDE.md) - Security standards

**Your Tasks** (from [tasks.md](./specs/tasks.md)):
- T028-T029: Firebase Authentication integration
- T025: Sealed Secrets for Azure credentials
- T163-T167: Security hardening (Azure Key Vault, rate limiting, CORS, XSS prevention, Istio mTLS)

**Security Requirements** (from [spec.md](./specs/spec.md)):
- **NFR7**: Istio mTLS for all service-to-service communication
- **NFR8**: Firebase JWT validation on every API request
- **NFR9**: Azure Blob SAS tokens with 24-hour expiry
- **NFR10**: User data isolation by userId (no cross-user access)
- **NFR11**: Uploaded files encrypted at rest
- **NFR12**: Database credentials in Azure Key Vault
- **NFR13**: No PII in logs or traces

**Key Security Patterns**:
- Firebase JWT authentication (Next.js middleware)
- Azure Key Vault for secrets (not .env in production)
- Istio mTLS policies (service mesh handles TLS)
- Input sanitization (prevent XSS)
- Rate limiting on public endpoints

**Getting Started**:
1. Review NFR7-NFR13 in [specs/spec.md](./specs/spec.md)
2. Read security sections in [CLAUDE.md](./CLAUDE.md)
3. Start with T028: Setup Firebase Authentication SDK

---

### 📊 Product Manager

**Your Focus**: User stories, acceptance criteria, success metrics, scope management

**Key Files**:
- [specs/spec.md](./specs/spec.md) - Complete feature specification
- [specs/tasks.md](./specs/tasks.md) - Implementation tasks organized by user story
- [specs/plan.md](./specs/plan.md) - MVP scope and phasing

**Your Priorities**:

**Phase 1 (MVP - 2-3 weeks)**:
- **P1.1**: File upload with resumable uploads → Tasks T034-T053
- **P1.2**: Interview metadata collection → Tasks T054-T062
- **P1.3**: Processing status & notifications → Tasks T063-T090
- **P1.4**: AI analysis & insights → Tasks T091-T119

**Phase 2 (1-2 weeks)**:
- **P2.1**: Pre-interview prep sessions → Tasks T120-T130
- **P2.2**: Prep vs. actual comparison → Tasks T131-T140

**Phase 3 (Future)**:
- **P3.1**: Performance tracking over time → Tasks T141-T148
- **P3.2**: Targeted skill practice → Tasks T149-T154

**Success Criteria** (from [spec.md](./specs/spec.md#success-criteria)):
- [ ] User can upload 1GB video and receive full analysis within 1 hour
- [ ] Speech analysis shows accurate filler word count (±5% manual count)
- [ ] Transcription accuracy >90% for clear audio
- [ ] 10 beta users successfully analyze real interviews

**Getting Started**:
1. Read [specs/spec.md](./specs/spec.md) user stories section
2. Review MVP success criteria
3. Track progress via [specs/tasks.md](./specs/tasks.md) checkboxes
4. Monitor team against dependency graph in tasks.md

---

### 🎯 Orchestrator

**Your Focus**: Coordinate team, manage dependencies, ensure progress, unblock issues

**Key Files**:
- [specs/tasks.md](./specs/tasks.md) - Complete task list with dependencies
- [specs/plan.md](./specs/plan.md) - Implementation phases and architecture
- All docs above

**Critical Path** (MVP):
```
Setup (T001-T009)
  → Foundational (T010-T033) [BLOCKS ALL USER STORIES]
    → P1.1 Upload (T034-T053)
      → P1.2 Metadata (T054-T062)
        → P1.3 Processing (T063-T090)
          → P1.4 Analysis (T091-T119) = MVP COMPLETE
```

**Parallel Opportunities**:
- After Foundational (T033): Frontend can work on P1.1 UI while Backend builds upload-service
- P2.1 (Prep) can start independently after Foundational (no dependency on P1)
- All tasks marked `[P]` can run in parallel within their phase

**Your Responsibilities**:
1. **Daily Standup**: Check task progress, identify blockers
2. **Dependency Management**: Ensure Foundational phase (T010-T033) completes before user stories start
3. **Parallel Coordination**: Assign `[P]` tasks to different team members
4. **Scope Management**: Work with Product to prioritize if timeline slips
5. **Integration Points**: Coordinate when services need to integrate (e.g., P1.3 processor-service needs P1.1 upload-service to emit events)

**Task Format** (from [tasks.md](./specs/tasks.md)):
```
- [ ] [T042] [P1.1] Implement file validation in apps/upload-service/src/modules/upload/upload.service.ts
       ^^^^   ^^^^  (user story)
       (task ID)
```

**Getting Started**:
1. Review full dependency graph in [specs/tasks.md](./specs/tasks.md)
2. Assign Phase 1 (Setup) tasks across team
3. Monitor Foundational phase completion (critical path)
4. Use task IDs for tracking (T001, T002, etc.)

---

## Project Structure

```
interview-buddy/
├── apps/                          # Microservices + Next.js frontend
│   ├── web/                       # Next.js 16 (Frontend + API Gateway)
│   ├── upload-service/            # NestJS - File upload handling
│   ├── processor-service/         # NestJS - Video Indexer integration
│   ├── ai-analyzer-service/       # NestJS - AI analysis orchestration
│   └── notification-service/      # NestJS - Email/push notifications
│
├── packages/                      # Shared code across services
│   ├── shared-types/              # TypeScript interfaces (events, API contracts)
│   ├── shared-utils/              # Common utilities (validation, logging, errors)
│   └── prisma-client/             # Shared Prisma schema + client
│
├── manifests/                     # Kubernetes manifests
│   ├── local/                     # Minikube overlay (ImagePullPolicy: Never)
│   └── dev/                       # AKS dev environment (to be created)
│
├── flux/                          # Flux GitOps configuration
│   ├── gitrepository.yaml         # Points to this repo
│   └── kustomization.yaml         # Auto-deploys manifests/dev/
│
├── specs/                         # All documentation
│   ├── spec.md                    # Feature specification + user stories
│   ├── plan.md                    # Implementation plan + architecture
│   ├── research.md                # Research findings + tech decisions
│   ├── data-model.md              # Prisma schema
│   ├── tasks.md                   # 180 actionable tasks
│   ├── quickstart.md              # Developer setup guide
│   └── contracts/                 # API contracts + event schemas
│
├── CLAUDE.md                      # Project standards + decision framework
├── README.md                      # This file
└── package.json                   # Monorepo workspace configuration
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **Docker Desktop** (for Minikube)
- **Minikube** + **kubectl**
- **Azure Account** (Video Indexer, PostgreSQL, AI Foundry)

### Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Start Minikube
minikube start
minikube addons enable istio

# 3. Deploy infrastructure (Redis + PostgreSQL)
kubectl apply -k manifests/local/

# 4. Setup database
cd packages/prisma-client
npx prisma migrate dev

# 5. Configure environment variables (see specs/quickstart.md)

# 6. Run linting and formatting (ensure code quality)
npm run lint        # Check for linting issues
npm run format      # Auto-format all code

# 7. Run services locally (separate terminals)
cd apps/web && npm run dev
cd apps/upload-service && npm run start:dev
cd apps/processor-service && npm run start:dev
cd apps/ai-analyzer-service && npm run start:dev
```

**Full setup guide**: See [specs/quickstart.md](./specs/quickstart.md)
**Linting & Formatting guide**: See [LINTING_AND_FORMATTING.md](./LINTING_AND_FORMATTING.md)

---

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **Firebase Authentication** - User auth and session management
- **tus-js-client** - Resumable file uploads
- **SWR / React Query** - Data fetching and caching

### Backend
- **NestJS 11** - Node.js framework for microservices
- **Prisma ORM** - Type-safe database access
- **@nestjs/microservices** - Redis Streams event bus
- **Azure Video Indexer SDK** - Video transcription + AI insights
- **OpenAI SDK** - Azure AI Foundry multi-model access

### Data Layer
- **PostgreSQL 16** - Azure Database for PostgreSQL (Flexible Server)
- **Redis** - Event streaming (local: K8s, prod: Azure Cache)
- **Azure Video Indexer** - Video storage + processing

### Infrastructure
- **Kubernetes (AKS)** - Container orchestration
- **Istio** - Service mesh (mTLS, observability)
- **Flux CD** - GitOps deployment
- **Docker** - Containerization
- **Azure Container Registry** - Image storage

### Observability
- **Jaeger** - Distributed tracing (via Istio)
- **Prometheus** - Metrics collection
- **Grafana** - Metrics visualization
- **Azure Application Insights** - Log aggregation

---

## Development Workflow

### 1. Pick a Task

Check [specs/tasks.md](./specs/tasks.md) for your next task:
- Frontend: Look for tasks in `apps/web/`
- Backend: Look for tasks in `apps/*-service/`
- DevOps: Look for tasks in `manifests/`
- Data: Look for tasks in `packages/prisma-client/`

### 2. Create Feature Branch

```bash
git checkout -b feature/T042-file-validation
```

(Use task ID in branch name for traceability)

### 3. Implement

- Follow patterns in [CLAUDE.md](./CLAUDE.md)
- Keep it simple (avoid over-engineering)
- Use shared types from `packages/shared-types/`
- Write minimal tests (not required for MVP unless requested)

### 4. Test Locally

```bash
# Run service
npm run start:dev

# Test integration
# (follow test plan in specs/spec.md acceptance criteria)
```

### 5. Commit & Push

```bash
git add .
git commit -m "[T042] Implement file validation in upload service"
git push origin feature/T042-file-validation
```

### 6. Deploy to Dev (if applicable)

```bash
# Build Docker image
docker build -t interviewbuddy.azurecr.io/upload-service:latest -f apps/upload-service/Dockerfile .

# Push to ACR
docker push interviewbuddy.azurecr.io/upload-service:latest

# Flux auto-deploys from Git (or manual apply)
kubectl apply -k manifests/dev/
```

---

## Deployment

### Environments

| Environment | Branch | Auto-Deploy | Purpose |
|-------------|--------|-------------|---------|
| **Local** | any | Manual | Development on Minikube |
| **Dev** | `main` | Flux CD | Integration testing on AKS dev namespace |
| **Prod** | `release/*` | Manual promotion | Production on AKS prod namespace |

### Deployment Process

1. **Local Development**: Run services via `npm run start:dev`
2. **Dev Deployment**: Push to `main` → Flux auto-deploys to AKS dev namespace
3. **Production**: Manual promotion from dev → prod namespace

### GitOps with Flux

Flux watches this repo and auto-applies Kubernetes manifests:

```yaml
# flux/kustomization.yaml
spec:
  interval: 5m
  path: ./manifests/dev
  prune: true
```

**Manual reconcile** (force sync):
```bash
flux reconcile kustomization interview-buddy-dev
```

---

## Key Metrics & Monitoring

### Business Metrics
- Uploads per day
- Analysis completion rate
- Average processing time
- User satisfaction (NPS score)

### Technical Metrics
- **NFR3**: Transcription time < 1.5x recording duration
- **NFR4**: AI analysis < 2 minutes after transcription
- **NFR6**: API P95 latency < 500ms
- **NFR19**: Upload service uptime > 99.5%

### Monitoring Tools
- **Jaeger**: Distributed tracing (track full request flow)
- **Grafana**: Service health dashboards
- **Prometheus**: Metrics scraping and alerting
- **Azure Application Insights**: Log aggregation

---

## Important Notes

### 🚨 Don't Commit Secrets!
- Use `.env.local` for local development (gitignored)
- Use **Sealed Secrets** for Kubernetes secrets in Git
- Use **Azure Key Vault** for production secrets

### 📏 Keep It Simple
- Json columns in Prisma for flexibility (avoid constant migrations)
- Minimal API contracts initially (flesh out as we build)
- Event payloads kept lightweight (store bulk data in Postgres)

### 🔄 Two-Way Doors
- Prefer reversible decisions (see [CLAUDE.md](./CLAUDE.md#prefer-two-way-doors))
- Examples: Redis in K8s → Azure Cache (just connection string change)
- Examples: Direct upload → tus protocol (add library, no architecture change)

### 📊 Service Ownership
Each service owns specific database tables (see [research.md R6](./specs/research.md#r6-prisma-schema-design-for-microservices)):
- **upload-service**: Interview (metadata + status)
- **processor-service**: Transcription
- **ai-analyzer-service**: Analysis
- **web (Next.js)**: PrepSession

Services can **read** shared tables but only **write** to their owned tables.

---

## Questions?

- **Architecture questions**: See [specs/plan.md](./specs/plan.md) or [CLAUDE.md](./CLAUDE.md)
- **Feature questions**: See [specs/spec.md](./specs/spec.md)
- **Implementation questions**: See [specs/research.md](./specs/research.md)
- **Task dependencies**: See [specs/tasks.md](./specs/tasks.md)

---

## Team Roles Summary

| Role | Focus | Start Here |
|------|-------|------------|
| **Frontend** | Next.js UI + API routes | [specs/spec.md](./specs/spec.md), Tasks T027+ |
| **Backend** | NestJS microservices | [specs/research.md](./specs/research.md), Tasks T034+ |
| **Data** | Prisma schema + migrations | [specs/data-model.md](./specs/data-model.md), Tasks T010+ |
| **DevOps** | K8s + Istio + CI/CD | [specs/plan.md](./specs/plan.md), Tasks T020+ |
| **Security** | Auth + secrets + hardening | [specs/spec.md](./specs/spec.md) NFR7-13, Tasks T028+ |
| **Product** | User stories + success criteria | [specs/spec.md](./specs/spec.md), track via tasks.md |
| **Orchestrator** | Coordinate + dependencies | [specs/tasks.md](./specs/tasks.md) full view |

---

## Let's Build Something Great! 🚀

**Current Status**: Phase 0 complete (planning & research). Ready to start Phase 1 (Setup).

**MVP Target**: 119 tasks (T001-T119) = Fully functional upload → analysis flow

**Next Steps**:
1. All team members read [CLAUDE.md](./CLAUDE.md) + their role-specific docs
2. Orchestrator assigns Phase 1 (Setup) tasks T001-T009
3. Team completes Phase 2 (Foundational) T010-T033 together
4. Parallel work on P1 user stories (T034+) after Foundational completes

---

**Last Updated**: 2025-12-08
**Version**: 1.0.0-mvp
**License**: Proprietary
