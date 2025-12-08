# Tasks: Interview Buddy MVP

**Input**: Design documents from `/home/rurich/Development/interview-buddy/specs/`
**Prerequisites**: plan.md, spec.md

**Tests**: Tests are NOT explicitly requested in spec.md, so test tasks are excluded from this file per SpecKit guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Infrastructure Approach**: We use Azure managed services (PostgreSQL, Redis, Video Indexer, AI Foundry) from day 1 via Terraform instead of running databases locally in Minikube. This costs ~$30/month for dev but:

- Matches production architecture (no migration needed)
- Eliminates local database complexity (no volume mounts, data persistence issues)
- Everyone develops against same environment (no "works on my machine")
- Infrastructure as Code documents all decisions

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1.1, US1.2, etc.)
- Include exact file paths in descriptions

## Path Conventions

This is a **monorepo** with the following structure (from plan.md):

```
apps/
├── web/                          # Next.js frontend + API gateway
├── upload-service/               # NestJS microservice
├── processor-service/            # NestJS microservice
├── ai-analyzer-service/          # NestJS microservice
└── notification-service/         # NestJS microservice

packages/
├── shared-types/                 # Shared TypeScript interfaces
├── shared-utils/                 # Common utilities
└── prisma-client/                # Shared Prisma schema + client
```

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure

- [x] T001 Initialize monorepo package.json with workspaces for apps/ and packages/
- [x] T002 [P] Setup TypeScript configuration with strict mode in root tsconfig.json
- [x] T [P] Configure ESLint and Prettier for monorepo in .eslintrc.js and .prettierrc
- [x] T [P] Create packages/shared-types/package.json with TypeScript setup
- [x] T [P] Create packages/shared-utils/package.json with utility structure
- [x] T Create packages/prisma-client/prisma/schema.prisma with base entities (User reference, Interview, Transcription, Analysis, PrepSession)
- [x] T Setup Prisma client generation in packages/prisma-client/package.json
- [x] T008 Configure Docker ignore files (.dockerignore) for all services
- [x] T009 [P] Setup Jest configuration for monorepo testing in jest.config.js

**Checkpoint**: Monorepo structure ready for service implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Shared Packages

- [x] T010 Define Interview model in packages/prisma-client/prisma/schema.prisma
- [x] T011 [P] Define Transcription model in packages/prisma-client/prisma/schema.prisma
- [x] T012 [P] Define Analysis model in packages/prisma-client/prisma/schema.prisma
- [x] T013 [P] Define PrepSession model in packages/prisma-client/prisma/schema.prisma
- [x] T014 Create initial Prisma migration for all models
- [x] T015 [P] Define event payload types in packages/shared-types/src/events/index.ts (interview.uploaded, interview.transcribed, analysis.completed)
- [x] T016 [P] Define API contract types in packages/shared-types/src/api/index.ts
- [x] T017 [P] Create validation utilities in packages/shared-utils/src/validation/index.ts
- [x] T018 [P] Create logging utilities in packages/shared-utils/src/logging/index.ts
- [x] T019 [P] Create error handling utilities in packages/shared-utils/src/errors/index.ts

### Azure Infrastructure (Terraform)

**Note**: We use Azure managed services (PostgreSQL, Redis) from day 1 instead of running databases in Minikube. This matches our production architecture and costs ~$30/month for dev environment.

- [x] T020 Create Terraform project structure in infrastructure/terraform/ with main.tf, variables.tf, outputs.tf
- [x] T021 [P] Define Azure Resource Group in infrastructure/terraform/resource-group.tf for dev environment
- [x] T022 [P] Define Azure Database for PostgreSQL Flexible Server in infrastructure/terraform/postgres.tf (Burstable B1ms tier, ~$12/month)
- [x] T023 [P] Define Azure Cache for Redis in infrastructure/terraform/redis.tf (Basic C0 tier 250MB, ~$16/month)
- [x] T024 [P] Define Azure Video Indexer account in infrastructure/terraform/video-indexer.tf
- [x] T025 [P] Define Azure AI Foundry workspace in infrastructure/terraform/ai-foundry.tf
- [x] T026 Create Terraform outputs for connection strings in infrastructure/terraform/outputs.tf (postgres_url, redis_host, redis_port, video_indexer_key)
- [x] T027 Create terraform.tfvars.example with required variables (azure_subscription_id, resource_group_name, etc.)
- [x] T028 Configure Terraform Azure backend for state storage in infrastructure/terraform/backend.tf
- [x] T_FLUX Register infrastructure in Flux (flux/infrastructure/terraform.yaml)
- [ ] T029 Initialize and apply Terraform to create dev environment: cd infrastructure/terraform && terraform init && terraform apply
- [ ] T030 Create script to export Terraform outputs to .env files: infrastructure/scripts/export-env.sh
- [ ] T031 Run export script to populate .env.example files for all services with Azure connection strings

### Next.js API Gateway (Web App)

- [ ] T037 Initialize Next.js 16 app in apps/web/ with TypeScript and App Router
- [ ] T038 Setup Firebase Authentication SDK in apps/web/src/lib/firebase.ts
- [ ] T044 Create authentication middleware in apps/web/src/middleware.ts for JWT validation
- [ ] T045 Create base API route structure in apps/web/src/app/api/
- [ ] T046 [P] Setup environment variables in apps/web/.env.local using connection strings from Terraform outputs
- [ ] T047 [P] Configure Next.js standalone output mode in apps/web/next.config.js
- [ ] T048 Create apps/web/Dockerfile for containerization

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story P1.1 - File Upload (Priority: P1) 🎯 MVP

**Goal**: Allow users to upload interview recordings up to 2GB with resumable uploads

**Independent Test**: User can upload a 1GB video file, see upload progress, and receive confirmation when complete. Upload can be resumed if interrupted.

**User Story from spec.md**: P1.1 - As a job seeker, I want to upload my interview recording so that I can get AI feedback on my performance

### NestJS Upload Service Setup

- [ ] T044 [P1.1] Initialize NestJS application in apps/upload-service/ with TypeScript
- [ ] T045 [P1.1] Add dependencies to apps/upload-service/package.json: @nestjs/microservices, @nestjs/platform-express, @azure/storage-blob, @tus/server
- [ ] T046 [P1.1] Configure Redis microservice transport in apps/upload-service/src/main.ts
- [ ] T047 [P1.1] Create upload module in apps/upload-service/src/modules/upload/upload.module.ts
- [ ] T048 [P1.1] Create storage module in apps/upload-service/src/modules/storage/storage.module.ts

### File Upload Implementation

- [ ] T049 [P] [P1.1] Create upload controller in apps/upload-service/src/modules/upload/upload.controller.ts with POST /upload endpoint
- [ ] T050 [P] [P1.1] Create Azure Blob Storage service in apps/upload-service/src/modules/storage/blob.service.ts
- [ ] T051 [P1.1] Implement tus protocol server in apps/upload-service/src/modules/upload/tus.service.ts for chunked uploads
- [ ] T052 [P1.1] Implement file validation (type, size) in apps/upload-service/src/modules/upload/upload.service.ts
- [ ] T053 [P1.1] Create upload progress tracking in apps/upload-service/src/modules/upload/upload.service.ts
- [ ] T054 [P1.1] Implement Interview record creation in apps/upload-service/src/modules/upload/upload.service.ts using Prisma
- [ ] T055 [P1.1] Emit interview.uploaded event in apps/upload-service/src/events/upload.emitter.ts using Redis transport
- [ ] T056 [P1.1] Create apps/upload-service/Dockerfile for containerization

### Kubernetes Deployment

- [ ] T057 [P1.1] Create upload service deployment manifest in manifests/local/upload-service-deployment.yaml
- [ ] T058 [P1.1] Create upload service Kubernetes service in manifests/local/upload-service-service.yaml
- [ ] T059 [P1.1] Create Istio VirtualService for upload service routing in manifests/local/upload-virtualservice.yaml

### Next.js Frontend Integration

- [ ] T060 [P] [P1.1] Create upload API route in apps/web/src/app/api/upload/route.ts proxying to upload-service
- [ ] T061 [P] [P1.1] Create upload UI component in apps/web/src/components/UploadForm.tsx with tus-js-client
- [ ] T062 [P] [P1.1] Implement upload progress tracking in apps/web/src/components/UploadProgress.tsx
- [ ] T063 [P1.1] Create upload page in apps/web/src/app/upload/page.tsx

**Checkpoint**: User Story P1.1 complete - Users can upload files with resumable uploads and see progress

---

## Phase 4: User Story P1.2 - Interview Metadata (Priority: P1) 🎯 MVP

**Goal**: Allow users to provide context about their interview (company, job title, type, notes, job description)

**Independent Test**: User can enter interview metadata before/during upload and edit it after upload completes

**User Story from spec.md**: P1.2 - As a job seeker, I want to provide context about my interview so that the AI analysis is relevant

### Metadata Collection Implementation

- [ ] T064 [P] [P1.2] Add metadata fields to Interview model in packages/prisma-client/prisma/schema.prisma (company, jobTitle, interviewType, notes, jobDescription)
- [ ] T065 [P] [P1.2] Create Prisma migration for metadata fields
- [ ] T066 [P] [P1.2] Create metadata API types in packages/shared-types/src/api/metadata.ts
- [ ] T067 [P1.2] Implement PATCH /upload/:id/metadata endpoint in apps/upload-service/src/modules/upload/upload.controller.ts
- [ ] T068 [P1.2] Add metadata validation in apps/upload-service/src/modules/upload/upload.service.ts

### Frontend Metadata UI

- [ ] T069 [P] [P1.2] Create metadata form component in apps/web/src/components/MetadataForm.tsx
- [ ] T070 [P] [P1.2] Add metadata fields to upload page in apps/web/src/app/upload/page.tsx
- [ ] T071 [P1.2] Create metadata edit API route in apps/web/src/app/api/upload/[id]/metadata/route.ts
- [ ] T072 [P1.2] Create metadata edit page in apps/web/src/app/interviews/[id]/edit/page.tsx

**Checkpoint**: User Story P1.2 complete - Users can provide and edit interview context metadata

---

## Phase 5: User Story P1.3 - Processing Status (Priority: P1) 🎯 MVP

**Goal**: Show users processing status (Uploaded → Transcribing → Analyzing → Complete) with notifications

**Independent Test**: User can view their interview dashboard showing all uploads with current status and estimated time remaining

**User Story from spec.md**: P1.3 - As a job seeker, I want to see when my recording is being processed so that I know when to expect results

### Processor Service Setup

- [ ] T073 [P1.3] Initialize NestJS application in apps/processor-service/ with TypeScript
- [ ] T069 [P1.3] Add dependencies to apps/processor-service/package.json: @nestjs/microservices, @azure/arm-mediaservices, @azure/ms-rest-js
- [ ] T070 [P1.3] Configure Redis microservice transport in apps/processor-service/src/main.ts
- [ ] T071 [P1.3] Create transcription module in apps/processor-service/src/modules/transcription/transcription.module.ts
- [ ] T072 [P1.3] Create jobs module in apps/processor-service/src/modules/jobs/jobs.module.ts

### Transcription Processing

- [ ] T073 [P] [P1.3] Create Azure Media Services client in apps/processor-service/src/modules/transcription/media-services.client.ts
- [ ] T074 [P] [P1.3] Create event consumer for interview.uploaded in apps/processor-service/src/events/upload.consumer.ts
- [ ] T075 [P1.3] Implement job submission to Azure Media Services in apps/processor-service/src/modules/jobs/jobs.service.ts
- [ ] T076 [P1.3] Implement job status polling in apps/processor-service/src/modules/jobs/jobs.service.ts with exponential backoff
- [ ] T077 [P1.3] Update Interview status in Prisma when jobs progress in apps/processor-service/src/modules/jobs/jobs.service.ts
- [ ] T078 [P1.3] Store transcription results in Transcription table via Prisma in apps/processor-service/src/modules/transcription/transcription.service.ts
- [ ] T079 [P1.3] Emit interview.transcribed event in apps/processor-service/src/events/transcription.emitter.ts
- [ ] T080 [P1.3] Create apps/processor-service/Dockerfile for containerization

### Kubernetes Deployment

- [ ] T081 [P1.3] Create processor service deployment manifest in manifests/local/processor-service-deployment.yaml
- [ ] T082 [P1.3] Create processor service Kubernetes service in manifests/local/processor-service-service.yaml

### Status Dashboard

- [ ] T083 [P] [P1.3] Create dashboard API route in apps/web/src/app/api/interviews/route.ts fetching user's interviews from Prisma
- [ ] T084 [P] [P1.3] Create interview status component in apps/web/src/components/InterviewStatus.tsx
- [ ] T085 [P] [P1.3] Create dashboard page in apps/web/src/app/dashboard/page.tsx
- [ ] T086 [P1.3] Implement status polling in dashboard using SWR or React Query

### Notification Service Setup

- [ ] T087 [P1.3] Initialize NestJS application in apps/notification-service/ with TypeScript
- [ ] T088 [P1.3] Add dependencies to apps/notification-service/package.json: @nestjs/microservices, nodemailer
- [ ] T089 [P1.3] Configure Redis microservice transport in apps/notification-service/src/main.ts
- [ ] T090 [P1.3] Create email module in apps/notification-service/src/modules/email/email.module.ts
- [ ] T091 [P] [P1.3] Create email templates in apps/notification-service/src/modules/email/templates/
- [ ] T092 [P] [P1.3] Create event consumer for analysis.completed in apps/notification-service/src/events/analysis.consumer.ts
- [ ] T093 [P1.3] Implement email sending in apps/notification-service/src/modules/email/email.service.ts
- [ ] T094 [P1.3] Create apps/notification-service/Dockerfile for containerization
- [ ] T095 [P1.3] Create notification service deployment manifest in manifests/local/notification-service-deployment.yaml

**Checkpoint**: User Story P1.3 complete - Users can view processing status on dashboard and receive email notifications

---

## Phase 6: User Story P1.4 - AI Analysis Insights (Priority: P1) 🎯 MVP

**Goal**: Provide AI-powered analysis of interview performance with speech metrics, content analysis, sentiment, and recommendations

**Independent Test**: User can view completed analysis showing transcription, filler word count, speaking pace, STAR method usage, confidence score, and actionable recommendations

**User Story from spec.md**: P1.4 - As a job seeker, I want to view AI insights about my interview performance so that I can improve

### AI Analyzer Service Setup

- [ ] T096 [P1.4] Initialize NestJS application in apps/ai-analyzer-service/ with TypeScript
- [ ] T097 [P1.4] Add dependencies to apps/ai-analyzer-service/package.json: @nestjs/microservices, openai, @anthropic-ai/sdk
- [ ] T098 [P1.4] Configure Redis microservice transport in apps/ai-analyzer-service/src/main.ts
- [ ] T099 [P1.4] Create analysis module in apps/ai-analyzer-service/src/modules/analysis/analysis.module.ts
- [ ] T100 [P1.4] Create AI module in apps/ai-analyzer-service/src/modules/ai/ai.module.ts

### Speech Analysis Implementation

- [ ] T101 [P] [P1.4] Create filler word detection service in apps/ai-analyzer-service/src/modules/analysis/speech-metrics.service.ts
- [ ] T102 [P] [P1.4] Implement speaking pace (WPM) calculation in apps/ai-analyzer-service/src/modules/analysis/speech-metrics.service.ts
- [ ] T103 [P] [P1.4] Implement pause detection in apps/ai-analyzer-service/src/modules/analysis/speech-metrics.service.ts

### AI Analysis Implementation

- [ ] T104 [P] [P1.4] Create OpenAI client wrapper in apps/ai-analyzer-service/src/modules/ai/openai.client.ts
- [ ] T110 [P] [P1.4] Create Claude client wrapper in apps/ai-analyzer-service/src/modules/ai/claude.client.ts
- [ ] T111 [P1.4] Create AI provider selection logic in apps/ai-analyzer-service/src/modules/ai/ai.service.ts (Azure AI Foundry routing)
- [ ] T112 [P] [P1.4] Implement STAR method detection prompt in apps/ai-analyzer-service/src/modules/analysis/star-detector.service.ts
- [ ] T113 [P] [P1.4] Implement sentiment analysis prompt in apps/ai-analyzer-service/src/modules/analysis/sentiment.service.ts
- [ ] T114 [P] [P1.4] Implement answer relevance scoring in apps/ai-analyzer-service/src/modules/analysis/content-analyzer.service.ts
- [ ] T115 [P1.4] Generate recommendations in apps/ai-analyzer-service/src/modules/analysis/recommendations.service.ts

### Event Processing & Storage

- [ ] T116 [P1.4] Create event consumer for interview.transcribed in apps/ai-analyzer-service/src/events/transcription.consumer.ts
- [ ] T117 [P1.4] Orchestrate all analysis services in apps/ai-analyzer-service/src/modules/analysis/analysis-orchestrator.service.ts
- [ ] T118 [P1.4] Store Analysis results in Prisma in apps/ai-analyzer-service/src/modules/analysis/analysis.service.ts
- [ ] T119 [P1.4] Emit analysis.completed event in apps/ai-analyzer-service/src/events/analysis.emitter.ts
- [ ] T120 [P1.4] Create apps/ai-analyzer-service/Dockerfile for containerization

### Kubernetes Deployment

- [ ] T121 [P1.4] Create ai-analyzer service deployment manifest in manifests/local/ai-analyzer-service-deployment.yaml
- [ ] T122 [P1.4] Create ai-analyzer service Kubernetes service in manifests/local/ai-analyzer-service-service.yaml

### Analysis Results UI

- [ ] T123 [P] [P1.4] Create analysis API route in apps/web/src/app/api/interviews/[id]/analysis/route.ts
- [ ] T124 [P] [P1.4] Create transcription viewer component in apps/web/src/components/TranscriptionViewer.tsx
- [ ] T125 [P] [P1.4] Create speech metrics component in apps/web/src/components/SpeechMetrics.tsx
- [ ] T126 [P] [P1.4] Create content analysis component in apps/web/src/components/ContentAnalysis.tsx
- [ ] T127 [P] [P1.4] Create sentiment chart component in apps/web/src/components/SentimentChart.tsx
- [ ] T128 [P] [P1.4] Create recommendations component in apps/web/src/components/Recommendations.tsx
- [ ] T129 [P1.4] Create analysis detail page in apps/web/src/app/interviews/[id]/page.tsx integrating all components

**Checkpoint**: User Story P1.4 complete - Users can view comprehensive AI analysis of their interview performance

**🎯 MVP COMPLETE**: All P1 (Must Have) user stories are now functional. System can upload, process, analyze, and display interview insights.

---

## Phase 7: User Story P2.1 - Pre-Interview Preparation (Priority: P2)

**Goal**: Allow users to create prep sessions with AI-generated questions and practice answers

**Independent Test**: User can create a prep session, see AI-generated questions based on job details, practice answering via text, and receive AI feedback

**User Story from spec.md**: P2.1 - As a job seeker, I want to prepare for my interview with AI coaching so that I can practice beforehand

### Prep Session Data Model

- [ ] T130 [P] [P2.1] Add PrepSession entity to packages/prisma-client/prisma/schema.prisma with questions and practice answers
- [ ] T131 [P2.1] Create Prisma migration for PrepSession model

### Prep Session API

- [ ] T132 [P] [P2.1] Create prep session API route in apps/web/src/app/api/prep/route.ts for CRUD operations
- [ ] T133 [P] [P2.1] Implement question generation using AI in apps/ai-analyzer-service/src/modules/prep/question-generator.service.ts
- [ ] T134 [P] [P2.1] Implement practice answer feedback using AI in apps/ai-analyzer-service/src/modules/prep/feedback.service.ts
- [ ] T135 [P2.1] Create REST endpoints for prep sessions in apps/upload-service/src/modules/prep/prep.controller.ts

### Prep Session UI

- [ ] T136 [P] [P2.1] Create prep session creation page in apps/web/src/app/prep/new/page.tsx
- [ ] T137 [P] [P2.1] Create question list component in apps/web/src/components/PrepQuestions.tsx
- [ ] T138 [P] [P2.1] Create practice answer form in apps/web/src/components/PracticeAnswerForm.tsx
- [ ] T139 [P] [P2.1] Create AI feedback display in apps/web/src/components/AIFeedback.tsx
- [ ] T140 [P2.1] Create prep session detail page in apps/web/src/app/prep/[id]/page.tsx

**Checkpoint**: User Story P2.1 complete - Users can prepare for interviews with AI coaching

---

## Phase 8: User Story P2.2 - Prep vs Actual Comparison (Priority: P2)

**Goal**: Compare actual interview performance against prep work to identify where user deviated

**Independent Test**: User can link an uploaded recording to existing prep session and see side-by-side comparison of prep vs actual answers

**User Story from spec.md**: P2.2 - As a job seeker, I want to compare my actual interview performance against my prep work so that I see where I deviated

### Comparison Implementation

- [ ] T141 [P] [P2.2] Add prepSessionId field to Interview model in packages/prisma-client/prisma/schema.prisma
- [ ] T142 [P2.2] Create Prisma migration for prepSessionId foreign key
- [ ] T143 [P] [P2.2] Create comparison module in apps/ai-analyzer-service/src/modules/comparison/comparison.module.ts
- [ ] T144 [P2.2] Implement prep vs actual comparison logic in apps/ai-analyzer-service/src/modules/comparison/comparison.service.ts
- [ ] T145 [P2.2] Extend Analysis model to include comparisonMetrics in packages/prisma-client/prisma/schema.prisma
- [ ] T146 [P2.2] Create Prisma migration for comparison metrics

### Comparison UI

- [ ] T147 [P] [P2.2] Create comparison API route in apps/web/src/app/api/interviews/[id]/comparison/route.ts
- [ ] T148 [P] [P2.2] Create side-by-side comparison component in apps/web/src/components/PrepVsActual.tsx
- [ ] T149 [P] [P2.2] Create improvement score visualization in apps/web/src/components/ImprovementScore.tsx
- [ ] T150 [P2.2] Create comparison view page in apps/web/src/app/interviews/[id]/comparison/page.tsx

**Checkpoint**: User Story P2.2 complete - Users can compare prep work against actual interview performance

---

## Phase 9: User Story P3.1 - Performance Tracking (Priority: P3)

**Goal**: Track interview performance over time with trend charts and historical comparisons

**Independent Test**: User with multiple interviews can view dashboard showing performance trends across interviews

**User Story from spec.md**: P3.1 - As a job seeker, I want to track my interview performance over time so that I can measure improvement

### Performance Tracking Implementation

- [ ] T151 [P] [P3.1] Create analytics API route in apps/web/src/app/api/analytics/route.ts aggregating user interview data
- [ ] T152 [P] [P3.1] Implement trend calculation in apps/web/src/lib/analytics.ts
- [ ] T153 [P] [P3.1] Create performance chart component in apps/web/src/components/PerformanceChart.tsx using Chart.js or Recharts
- [ ] T154 [P] [P3.1] Create company/type comparison component in apps/web/src/components/ComparisonChart.tsx
- [ ] T155 [P3.1] Create analytics dashboard page in apps/web/src/app/analytics/page.tsx

### PDF Export

- [ ] T156 [P] [P3.1] Add PDF generation library to apps/web/package.json (e.g., jsPDF or Puppeteer)
- [ ] T157 [P3.1] Create PDF export API route in apps/web/src/app/api/analytics/export/route.ts
- [ ] T158 [P3.1] Implement PDF report generation in apps/web/src/lib/pdf-generator.ts

**Checkpoint**: User Story P3.1 complete - Users can track performance over time and export reports

---

## Phase 10: User Story P3.2 - Targeted Practice (Priority: P3)

**Goal**: Generate targeted practice questions for weak areas and track skill-specific improvement

**Independent Test**: User can request practice questions for specific skills (e.g., behavioral, storytelling) and see improvement in those areas

**User Story from spec.md**: P3.2 - As a job seeker, I want to practice specific interview skills so that I can target weak areas

### Skill-Specific Practice

- [ ] T159 [P] [P3.2] Extend PrepSession model to include skillFocus field in packages/prisma-client/prisma/schema.prisma
- [ ] T160 [P3.2] Create Prisma migration for skill tracking
- [ ] T161 [P] [P3.2] Implement skill detection in analysis results in apps/ai-analyzer-service/src/modules/analysis/skill-detector.service.ts
- [ ] T162 [P3.2] Generate skill-specific practice questions in apps/ai-analyzer-service/src/modules/prep/skill-generator.service.ts
- [ ] T163 [P] [P3.2] Create skill practice UI in apps/web/src/app/practice/[skill]/page.tsx
- [ ] T164 [P3.2] Track skill improvement over time in apps/web/src/components/SkillProgress.tsx

**Checkpoint**: User Story P3.2 complete - Users can practice targeted skills and measure improvement

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

### Error Handling & Resilience

- [ ] T165 [P] Implement dead-letter queue for failed events in all microservices
- [ ] T166 [P] Add retry logic with exponential backoff for Azure API calls
- [ ] T167 [P] Implement circuit breakers for external API calls (OpenAI, Azure) using resilience libraries
- [ ] T168 [P] Add graceful shutdown handlers in all NestJS services

### Observability

- [ ] T169 [P] Add OpenTelemetry instrumentation to all NestJS services
- [ ] T170 [P] Configure Jaeger tracing in manifests/local/jaeger-deployment.yaml
- [ ] T171 [P] Create Grafana dashboards for key metrics in manifests/local/grafana-dashboards.yaml
- [ ] T172 [P] Setup Prometheus scraping in manifests/local/prometheus-config.yaml

### Security

- [ ] T173 [P] Implement Azure Key Vault integration for secrets in all services
- [ ] T174 [P] Add request rate limiting to Next.js API routes
- [ ] T175 [P] Implement CORS configuration in all NestJS services
- [ ] T176 [P] Add input sanitization to prevent XSS in Next.js frontend
- [ ] T177 [P] Configure Istio mTLS policies in manifests/local/istio-mtls-policy.yaml

### Performance Optimization

- [ ] T178 [P] Add caching layer using Redis for frequently accessed analysis results
- [ ] T179 [P] Implement database query optimization with Prisma indexes
- [ ] T180 [P] Add Next.js image optimization for dashboard thumbnails
- [ ] T181 [P] Implement server-side pagination for interview lists

### Documentation

- [ ] T182 [P] Create API documentation using Swagger for all NestJS services
- [ ] T183 [P] Write deployment guide in docs/deployment.md
- [ ] T184 [P] Create developer quickstart in docs/quickstart.md
- [ ] T185 [P] Document environment variables in .env.example files

### Deployment & CI/CD

- [ ] T181 [P] Create production Kubernetes manifests in manifests/prod/
- [ ] T182 [P] Setup Flux CD for production in flux/prod/kustomization.yaml
- [ ] T183 [P] Configure autoscaling policies for all services
- [ ] T184 [P] Create health check endpoints in all NestJS services
- [ ] T185 [P] Setup Azure Monitor integration for production logging

**Checkpoint**: System is production-ready with observability, security, and resilience

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Setup completion - BLOCKS all user stories
- **Phase 3-6 (P1 User Stories - MVP)**: All depend on Foundational phase completion
  - P1.1 (Upload) → Can start after Foundational
  - P1.2 (Metadata) → Depends on P1.1 (needs upload service)
  - P1.3 (Processing) → Depends on P1.1 (needs interview.uploaded event)
  - P1.4 (Analysis) → Depends on P1.3 (needs interview.transcribed event)
- **Phase 7-8 (P2 User Stories)**: Can start after Foundational, but benefit from P1 completion
  - P2.1 (Prep) → Independent, can start after Foundational
  - P2.2 (Comparison) → Depends on P1.4 and P2.1 (needs both analysis and prep)
- **Phase 9-10 (P3 User Stories)**: Depend on multiple P1 interviews being analyzed
  - P3.1 (Tracking) → Depends on P1.4 (needs analysis data)
  - P3.2 (Practice) → Depends on P1.4 and P2.1 (needs skill detection + prep framework)
- **Phase 11 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **P1.1 (Upload)**: Independent after Foundational
- **P1.2 (Metadata)**: Requires P1.1
- **P1.3 (Processing)**: Requires P1.1
- **P1.4 (Analysis)**: Requires P1.3
- **P2.1 (Prep)**: Independent after Foundational
- **P2.2 (Comparison)**: Requires P1.4 + P2.1
- **P3.1 (Tracking)**: Requires P1.4
- **P3.2 (Practice)**: Requires P1.4 + P2.1

### Critical Path (MVP - P1 Only)

```
Setup → Foundational → P1.1 → P1.2 → P1.3 → P1.4 → MVP DONE
```

### Parallel Opportunities

**After Foundational Phase Completes**:

- P1.1 (Upload) and P2.1 (Prep) can be built in parallel by different developers
- All models in a phase marked [P] can be created in parallel
- All API routes marked [P] can be created in parallel
- Frontend components marked [P] can be created in parallel

**Example - Phase 6 Parallel Tasks**:

```bash
# Run in parallel:
- T101 [P] Filler word detection
- T102 [P] Speaking pace calculation
- T103 [P] Pause detection
- T104 [P] OpenAI client wrapper
- T110 [P] Claude client wrapper
- T112 [P] STAR method detection
- T113 [P] Sentiment analysis
- T114 [P] Answer relevance scoring
```

---

## Parallel Example: User Story P1.4 (AI Analysis)

```bash
# Launch all speech analysis services together:
Task: "Create filler word detection service" [T101]
Task: "Implement speaking pace calculation" [T102]
Task: "Implement pause detection" [T103]

# Launch all AI client wrappers together:
Task: "Create OpenAI client wrapper" [T104]
Task: "Create Claude client wrapper" [T110]

# Launch all analysis prompts together:
Task: "Implement STAR method detection prompt" [T112]
Task: "Implement sentiment analysis prompt" [T113]
Task: "Implement answer relevance scoring" [T114]

# Launch all UI components together:
Task: "Create transcription viewer component" [T124]
Task: "Create speech metrics component" [T125]
Task: "Create content analysis component" [T126]
Task: "Create sentiment chart component" [T127]
Task: "Create recommendations component" [T128]
```

---

## Implementation Strategy

### MVP First (P1 User Stories Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: P1.1 (Upload)
4. Complete Phase 4: P1.2 (Metadata)
5. Complete Phase 5: P1.3 (Processing)
6. Complete Phase 6: P1.4 (Analysis)
7. **STOP and VALIDATE**: Test full upload → analysis flow with real interview recording
8. Deploy to AKS dev environment

**MVP Success Criteria** (from spec.md):

- [ ] User can upload 1GB video and receive full analysis within 1 hour
- [ ] Speech analysis shows accurate filler word count (±5% manual count)
- [ ] Transcription accuracy >90% for clear audio
- [ ] End-to-end tracing visible in Jaeger
- [ ] All microservices deployed to AKS with Istio mTLS
- [ ] 10 beta users successfully analyze real interviews

### Incremental Delivery (Add P2 Features)

1. Complete MVP (P1 stories)
2. Add Phase 7: P2.1 (Prep) → Test independently
3. Add Phase 8: P2.2 (Comparison) → Test with existing P1 interviews
4. Deploy/Demo Phase 2 features

### Full Feature Set (Add P3 Enhancements)

1. Complete P1 + P2
2. Add Phase 9: P3.1 (Tracking) → Requires multiple interviews in system
3. Add Phase 10: P3.2 (Practice) → Test skill improvement tracking
4. Complete Phase 11: Polish → Production readiness
5. Production deployment

### Parallel Team Strategy

With multiple developers:

1. **Week 1**: Team completes Setup + Foundational together
2. **Week 2**: Once Foundational is done:
   - Developer A: Phase 3 (P1.1 Upload) + Phase 4 (P1.2 Metadata)
   - Developer B: Phase 5 (P1.3 Processing)
   - Developer C: Phase 7 (P2.1 Prep - can start independently)
3. **Week 3**:
   - Developer A: Phase 6 (P1.4 Analysis)
   - Developer B: Phase 8 (P2.2 Comparison - needs A to finish P1.4)
   - Developer C: Phase 9 (P3.1 Tracking)
4. **Week 4**: Integration, testing, and Phase 11 (Polish)

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **MVP scope**: Phase 1-6 (P1 user stories) delivers fully functional system
- **Tests excluded**: spec.md does not explicitly request tests, so test tasks omitted per SpecKit guidelines
- **Research pending**: Some technical decisions pending research.md (Azure Media Services vs Video Indexer, tus library, multi-model routing) - tasks assume standard implementations
- **Commit strategy**: Commit after each task or logical group
- **Independent testing**: Each user story should be independently testable at its checkpoint
- **Event-driven flow**: Upload → Processor → AI Analyzer → Notification (via Redis Streams)
- **Istio integration**: All service-to-service communication uses mTLS, distributed tracing enabled

---

## Task Summary

- **Total Tasks**: 185 (updated from 180 - added Terraform infrastructure tasks)
- **Phase 1 (Setup)**: 9 tasks
- **Phase 2 (Foundational)**: 29 tasks (BLOCKING) - includes 12 Terraform tasks for Azure managed services
  - Database & Shared Packages: 9 tasks (T010-T019)
  - Azure Infrastructure (Terraform): 12 tasks (T020-T031) - PostgreSQL, Redis, Video Indexer, AI Foundry
  - Next.js API Gateway: 7 tasks (T032-T038)
- **Phase 3 (P1.1 Upload)**: 20 tasks
- **Phase 4 (P1.2 Metadata)**: 9 tasks
- **Phase 5 (P1.3 Processing)**: 28 tasks
- **Phase 6 (P1.4 Analysis)**: 29 tasks (MVP complete)
- **Phase 7 (P2.1 Prep)**: 11 tasks
- **Phase 8 (P2.2 Comparison)**: 10 tasks
- **Phase 9 (P3.1 Tracking)**: 8 tasks
- **Phase 10 (P3.2 Practice)**: 6 tasks
- **Phase 11 (Polish)**: 26 tasks

**MVP Task Count**: 124 tasks (Phase 1-6) - increased from 119 due to Terraform infrastructure
**Full Feature Set**: 185 tasks

**Parallel Opportunities**: 83 tasks marked [P] can run in parallel within their phase

**Infrastructure Note**: We deploy Azure managed services (PostgreSQL, Redis, Video Indexer, AI Foundry) via Terraform from day 1. This costs ~$30/month for dev but eliminates local database complexity and matches production architecture.

**Suggested MVP Scope**: Phase 1-6 (P1 user stories) - delivers upload, processing, and AI analysis
