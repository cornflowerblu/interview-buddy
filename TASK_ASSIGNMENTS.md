# Monorepo Setup Task Assignments

This document maps each monorepo setup task to the appropriate custom agent based on their expertise.

## Task Assignment Summary

| Task | Agent                     | Rationale                                     |
| ---- | ------------------------- | --------------------------------------------- |
| T001 | Nexus (Backend Engineer)  | Monorepo structure and package management     |
| T002 | Prism (Frontend Engineer) | TypeScript configuration expertise            |
| T003 | Prism (Frontend Engineer) | Code quality tooling (ESLint/Prettier)        |
| T004 | Prism (Frontend Engineer) | Shared TypeScript types package               |
| T005 | Prism (Frontend Engineer) | Shared utilities package                      |
| T006 | Atlas (Data Architect)    | Database schema design with Prisma            |
| T007 | Nexus (Backend Engineer)  | Prisma client tooling and backend integration |
| T008 | Forge (DevOps Architect)  | Docker configuration and containerization     |
| T009 | Prism (Frontend Engineer) | Testing infrastructure setup                  |

---

## GitHub Issues to Create

### Issue 1: [Nexus] Initialize monorepo package.json with workspaces (T001)

**Title:** `[Nexus] T001: Initialize monorepo package.json with workspaces`

**Assigned to:** Nexus (Backend Engineer)

**Labels:** `backend`, `infrastructure`, `monorepo`

**Description:**

Set up the root-level `package.json` with proper workspace configuration to support the monorepo structure.

**Task:** T001 - Initialize monorepo package.json with workspaces for apps/ and packages/

**Acceptance Criteria:**

- ✅ Root package.json includes `workspaces: ["apps/*", "packages/*"]` (Already done)
- ✅ Appropriate package manager configuration (Bun is being used)
- ✅ Basic scripts for monorepo-wide commands (build, test, lint, dev) (Already done)
- ✅ Private flag set to prevent accidental publishing (Already done)

**Current Status:**
The root package.json already exists with workspace configuration. This task may just need verification and any enhancements.

**Context:**
This is the foundation task for the monorepo setup. The basic structure is in place.

---

### Issue 2: [Prism] Setup TypeScript configuration with strict mode (T002)

**Title:** `[Prism] T002: Setup TypeScript configuration with strict mode`

**Assigned to:** Prism (Frontend Engineer)

**Labels:** `frontend`, `typescript`, `configuration`

**Description:**

Create a root-level TypeScript configuration with strict mode enabled that will be extended by all services and packages.

**Task:** T002 - Setup TypeScript configuration with strict mode in root tsconfig.json

**Acceptance Criteria:**

- Root `tsconfig.json` with strict mode enabled
- Proper compiler options for monorepo (composite projects, path mapping)
- Base configuration that can be extended by services
- Module resolution configured for workspace packages
- Path aliases for `@interview-buddy/shared-types` and `@interview-buddy/shared-utils`

**Why Prism:**
Prism has expertise in TypeScript configuration for modern frontend/fullstack projects and understands the needs of both Next.js and NestJS TypeScript setups.

**Context:**
This configuration will ensure type safety across all TypeScript code in the monorepo. Individual services already have their own tsconfig.json files, but a root config is needed for shared settings.

---

### Issue 3: [Prism] Configure ESLint and Prettier for monorepo (T003)

**Title:** `[Prism] T003: Configure ESLint and Prettier for monorepo`

**Assigned to:** Prism (Frontend Engineer)

**Labels:** `frontend`, `code-quality`, `configuration`

**Description:**

Set up consistent code style and linting rules across the entire monorepo.

**Task:** T003 - Configure ESLint and Prettier for monorepo in .eslintrc.js and .prettierrc

**Acceptance Criteria:**

- `.eslintrc.js` with monorepo-appropriate rules
- Support for both TypeScript and JavaScript
- Rules compatible with NestJS and Next.js
- `.prettierrc` with formatting standards
- Integration between ESLint and Prettier (eslint-config-prettier)
- Ignore files configured (`.eslintignore`, `.prettierignore`)
- Scripts added to root package.json for linting/formatting all workspaces
- Pre-commit hooks (optional but recommended)

**Why Prism:**
Frontend engineers typically have strong opinions and expertise on code quality tooling that works across modern JavaScript/TypeScript projects.

**Context:**
This ensures code consistency across all services and packages. Should work with both NestJS backend services and Next.js frontend. CLAUDE.md mentions the project uses TypeScript with strict mode.

---

### Issue 4: [Prism] Create packages/shared-types with TypeScript setup (T004)

**Title:** `[Prism] T004: Create packages/shared-types with TypeScript setup`

**Assigned to:** Prism (Frontend Engineer)

**Labels:** `frontend`, `typescript`, `shared-package`

**Description:**

Create the shared-types package that will contain TypeScript interfaces and types used across all services.

**Task:** T004 - Create packages/shared-types/package.json with TypeScript setup

**Acceptance Criteria:**

- `packages/shared-types/package.json` created with proper configuration
- `packages/shared-types/tsconfig.json` extending root config
- Basic directory structure (src/, dist/)
- Export configuration for package consumers (exports field in package.json)
- Build script configured (TypeScript compilation)
- Initial type definitions for common entities (User, Interview, Transcription, Analysis)
- README.md with usage instructions

**Current Status:**
The packages/shared-types directory already exists with basic structure. This task involves verifying and enhancing the setup.

**Why Prism:**
TypeScript type definitions are often managed by frontend engineers who understand the contracts between services.

**Context:**
This package will be used by all services to ensure type consistency. It should export interfaces for API contracts, event schemas, and domain models.

---

### Issue 5: [Prism] Create packages/shared-utils with utility structure (T005)

**Title:** `[Prism] T005: Create packages/shared-utils with utility structure`

**Assigned to:** Prism (Frontend Engineer)

**Labels:** `frontend`, `typescript`, `shared-package`

**Description:**

Create the shared-utils package for common utility functions used across services.

**Task:** T005 - Create packages/shared-utils/package.json with utility structure

**Acceptance Criteria:**

- `packages/shared-utils/package.json` created
- `packages/shared-utils/tsconfig.json` extending root config
- Directory structure for utility categories (validation, formatting, date-utils, etc.)
- Export configuration for package consumers
- Build script configured
- Unit tests setup with Jest
- README.md with usage examples

**Why Prism:**
Utility functions are common across frontend and backend, and Prism's experience with modern TypeScript patterns makes them well-suited for this.

**Context:**
Common utilities might include: date formatting, validation helpers, string utilities, error handling, etc. Should be framework-agnostic so both Next.js and NestJS can use them.

---

### Issue 6: [Atlas] Create Prisma schema with base entities (T006)

**Title:** `[Atlas] T006: Create Prisma schema with base entities`

**Assigned to:** Atlas (Data Architect)

**Labels:** `database`, `prisma`, `data-model`

**Description:**

Design and implement the initial Prisma schema with core database entities for the Interview Buddy platform.

**Task:** T006 - Create packages/prisma-client/prisma/schema.prisma with base entities

**Acceptance Criteria:**

- `packages/prisma-client/prisma/schema.prisma` created
- PostgreSQL as the database provider
- User reference entity (for Firebase Auth integration - stores userId from Firebase)
- Interview entity with:
  - Status tracking (uploading, uploaded, transcribing, analyzing, completed, failed)
  - Metadata (company, jobTitle, interviewType)
  - Links to transcription and analysis
  - Soft delete support
- Transcription entity with:
  - Full text with timestamps
  - Confidence score
  - Language detection
- Analysis entity with:
  - Speech metrics (filler words, WPM, pauses)
  - Content analysis
  - Sentiment scores
  - Recommendations
- PrepSession entity for pre-interview practice
- Proper relationships between entities (one-to-one, one-to-many)
- Indexes for performance-critical queries (userId, status, createdAt)
- Timestamps (createdAt, updatedAt) on all entities
- UUID primary keys

**Why Atlas:**
Atlas is the data architect with deep expertise in PostgreSQL, Prisma, and data modeling. This is a critical foundation task that requires thoughtful schema design.

**Context:**
Refer to:

- CLAUDE.md for architecture overview
- specs/data-model.md for detailed requirements (if it exists)
- Privacy requirement: users never access raw recordings, only structured data
- Design should support the event flow: upload → transcribe → analyze

---

### Issue 7: [Nexus] Setup Prisma client generation (T007)

**Title:** `[Nexus] T007: Setup Prisma client generation`

**Assigned to:** Nexus (Backend Engineer)

**Labels:** `backend`, `prisma`, `shared-package`

**Description:**

Configure the prisma-client package for proper client generation and consumption by services.

**Task:** T007 - Setup Prisma client generation in packages/prisma-client/package.json

**Acceptance Criteria:**

- `packages/prisma-client/package.json` with Prisma dependencies
  - `@prisma/client`
  - `prisma` as devDependency
- Scripts configured:
  - `generate`: Generate Prisma client
  - `migrate:dev`: Run migrations in development
  - `migrate:deploy`: Run migrations in production
  - `studio`: Open Prisma Studio
  - `db:push`: Push schema changes (for dev)
- Export configuration for generated client
- TypeScript configuration
- README.md with instructions:
  - How to consume the client in services
  - How to run migrations
  - How to add new entities
- `.gitignore` to exclude generated files

**Why Nexus:**
Backend engineers work closely with Prisma client in NestJS services and understand how to properly configure it for consumption.

**Context:**
This package will be imported by all backend services:

- `upload-service`
- `processor-service`
- `ai-analyzer-service`

Each service will add it as a workspace dependency.

---

### Issue 8: [Forge] Configure Docker ignore files for all services (T008)

**Title:** `[Forge] T008: Configure Docker ignore files for all services`

**Assigned to:** Forge (DevOps Architect)

**Labels:** `devops`, `docker`, `optimization`

**Description:**

Create appropriate `.dockerignore` files to optimize Docker builds and prevent unnecessary files from being copied into containers.

**Task:** T008 - Configure Docker ignore files (.dockerignore) for all services

**Acceptance Criteria:**

- `.dockerignore` in repository root for multi-stage builds
- `.dockerignore` in each service directory:
  - `apps/web/`
  - `apps/upload-service/`
  - `apps/processor-service/`
  - `apps/ai-analyzer-service/`
  - `apps/notification-service/` (if exists)
- Common exclusions across all files:
  - `node_modules` (rebuilt in container)
  - `.git` and `.github`
  - `.env` and `.env.*` files
  - Test files (`*.test.ts`, `*.spec.ts`, `**/__tests__/`)
  - Documentation (`*.md` except service-specific README)
  - Development files (`.vscode`, `.idea`)
  - Build artifacts from other services
  - `coverage/`, `dist/`, `.next/`
- Optimized for monorepo structure
- Comments explaining exclusions
- Reduces Docker image size significantly
- Improves build cache effectiveness

**Why Forge:**
DevOps architects have deep expertise in Docker optimization and understand what should/shouldn't be in containers for both security and performance.

**Context:**

- Each service will be containerized for Kubernetes deployment (AKS)
- Proper ignore files are crucial for:
  - Security (don't copy secrets or git history)
  - Performance (smaller images = faster deployments)
  - Build efficiency (better layer caching)
- The project uses a monorepo structure with workspaces
- Services are deployed via Flux GitOps to AKS with Istio

---

### Issue 9: [Prism] Setup Jest configuration for monorepo testing (T009)

**Title:** `[Prism] T009: Setup Jest configuration for monorepo testing`

**Assigned to:** Prism (Frontend Engineer)

**Labels:** `frontend`, `testing`, `configuration`

**Description:**

Configure Jest for running tests across the monorepo with proper workspace support.

**Task:** T009 - Setup Jest configuration for monorepo testing in jest.config.js

**Acceptance Criteria:**

- Root `jest.config.js` with monorepo configuration
- Project-based configuration for different types of services:
  - NestJS backend services (use `@nestjs/testing`)
  - Next.js frontend (use `next/jest`)
- Proper module resolution for workspace packages:
  - `@interview-buddy/shared-types`
  - `@interview-buddy/shared-utils`
  - `@interview-buddy/prisma-client`
- Coverage configuration with thresholds
- Support for TypeScript
- Test environment setup (node for backend, jsdom for frontend)
- Test scripts in root package.json:
  - `test`: Run all tests
  - `test:unit`: Run only unit tests
  - `test:integration`: Run integration tests
  - `test:e2e`: Run end-to-end tests
  - `test:coverage`: Generate coverage report
- Documentation on:
  - Running tests per-service
  - Running tests across monorepo
  - Writing tests with shared packages

**Why Prism:**
Frontend engineers often set up test infrastructure and understand the needs of both unit and integration testing in modern TypeScript projects.

**Context:**
From CLAUDE.md, the testing strategy includes:

- **Unit Tests**: Business logic with mocked dependencies (>70% coverage target)
- **Integration Tests**: Redis event flows, Prisma operations
- **E2E Tests**: Critical path through upload → transcription → analysis

The configuration should support all three types across different service contexts.

---

## Notes for Issue Creation

When creating these issues in GitHub:

1. **Copy each issue section** into a new GitHub issue
2. **Use the title** provided for each issue
3. **Add the labels** mentioned in each issue
4. **Tag the agent** in the issue description if possible (e.g., `@cornflowerblu/nexus`)
5. **Link issues** where there are dependencies (e.g., T007 depends on T006)
6. **Create a milestone** called "Monorepo Setup" and add all issues to it
7. **Use a project board** (optional) to track progress

## Dependencies

```
T001 (Nexus)
  └─> Enables all other tasks (foundation)

T002 (Prism) + T003 (Prism) + T009 (Prism)
  └─> Can be done in parallel, no dependencies

T004 (Prism) + T005 (Prism)
  └─> Depends on T002 (need root tsconfig)
  └─> Can be done in parallel with each other

T006 (Atlas)
  └─> Depends on T002 (need root tsconfig)
  └─> Can be done in parallel with T004, T005

T007 (Nexus)
  └─> Depends on T006 (need schema first)

T008 (Forge)
  └─> Can be done in parallel with all others
  └─> No dependencies
```

## Recommended Order

**Phase 1 (Foundation):**

1. T001 - Monorepo package.json (Nexus) ✅ Already done

**Phase 2 (Configuration - Parallel):** 2. T002 - TypeScript config (Prism) 3. T003 - ESLint/Prettier (Prism) 4. T008 - Docker ignore files (Forge) 5. T009 - Jest config (Prism)

**Phase 3 (Shared Packages - Parallel):** 6. T004 - shared-types (Prism) 7. T005 - shared-utils (Prism) 8. T006 - Prisma schema (Atlas)

**Phase 4 (Prisma Client):** 9. T007 - Prisma client generation (Nexus) - Depends on T006

Total estimated time: 1-2 days with agents working in parallel.
