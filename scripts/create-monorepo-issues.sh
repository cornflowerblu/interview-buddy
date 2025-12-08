#!/bin/bash

# Script to create GitHub issues for monorepo setup tasks
# Run this with: bash scripts/create-monorepo-issues.sh
# Requires: gh CLI with authentication

set -e

REPO="cornflowerblu/interview-buddy"

echo "Creating monorepo setup issues for ${REPO}..."
echo ""

# Check if gh CLI is authenticated
if ! gh auth status >/dev/null 2>&1; then
  echo "Error: GitHub CLI not authenticated. Run 'gh auth login' first."
  exit 1
fi

# Create milestone if it doesn't exist
echo "Creating milestone 'Monorepo Setup'..."
gh milestone create "Monorepo Setup" \
  --repo "${REPO}" \
  --description "Initial monorepo configuration and setup tasks" \
  --due-date "2025-12-20" 2>/dev/null || echo "Milestone already exists"

echo ""

# Issue 1: Nexus - T001
echo "Creating Issue 1: [Nexus] T001 - Initialize monorepo package.json..."
gh issue create \
  --repo "${REPO}" \
  --title "[Nexus] T001: Initialize monorepo package.json with workspaces" \
  --label "backend,infrastructure,monorepo" \
  --milestone "Monorepo Setup" \
  --body "## Assigned to
Nexus (Backend Engineer)

## Task
T001 - Initialize monorepo package.json with workspaces for apps/ and packages/

## Description
Set up the root-level \`package.json\` with proper workspace configuration to support the monorepo structure.

## Acceptance Criteria
- ✅ Root package.json includes \`workspaces: [\"apps/*\", \"packages/*\"]\` (Already done)
- ✅ Appropriate package manager configuration (Bun is being used)
- ✅ Basic scripts for monorepo-wide commands (build, test, lint, dev) (Already done)
- ✅ Private flag set to prevent accidental publishing (Already done)

## Current Status
The root package.json already exists with workspace configuration. This task may just need verification and any enhancements.

## Context
This is the foundation task for the monorepo setup. The basic structure is in place."

# Issue 2: Prism - T002
echo "Creating Issue 2: [Prism] T002 - Setup TypeScript configuration..."
gh issue create \
  --repo "${REPO}" \
  --title "[Prism] T002: Setup TypeScript configuration with strict mode" \
  --label "frontend,typescript,configuration" \
  --milestone "Monorepo Setup" \
  --body "## Assigned to
Prism (Frontend Engineer)

## Task
T002 - Setup TypeScript configuration with strict mode in root tsconfig.json

## Description
Create a root-level TypeScript configuration with strict mode enabled that will be extended by all services and packages.

## Acceptance Criteria
- Root \`tsconfig.json\` with strict mode enabled
- Proper compiler options for monorepo (composite projects, path mapping)
- Base configuration that can be extended by services
- Module resolution configured for workspace packages
- Path aliases for \`@interview-buddy/shared-types\` and \`@interview-buddy/shared-utils\`

## Why Prism
Prism has expertise in TypeScript configuration for modern frontend/fullstack projects and understands the needs of both Next.js and NestJS TypeScript setups.

## Context
This configuration will ensure type safety across all TypeScript code in the monorepo. Individual services already have their own tsconfig.json files, but a root config is needed for shared settings."

# Issue 3: Prism - T003
echo "Creating Issue 3: [Prism] T003 - Configure ESLint and Prettier..."
gh issue create \
  --repo "${REPO}" \
  --title "[Prism] T003: Configure ESLint and Prettier for monorepo" \
  --label "frontend,code-quality,configuration" \
  --milestone "Monorepo Setup" \
  --body "## Assigned to
Prism (Frontend Engineer)

## Task
T003 - Configure ESLint and Prettier for monorepo in .eslintrc.js and .prettierrc

## Description
Set up consistent code style and linting rules across the entire monorepo.

## Acceptance Criteria
- \`.eslintrc.js\` with monorepo-appropriate rules
- Support for both TypeScript and JavaScript
- Rules compatible with NestJS and Next.js
- \`.prettierrc\` with formatting standards
- Integration between ESLint and Prettier (eslint-config-prettier)
- Ignore files configured (\`.eslintignore\`, \`.prettierignore\`)
- Scripts added to root package.json for linting/formatting all workspaces
- Pre-commit hooks (optional but recommended)

## Why Prism
Frontend engineers typically have strong opinions and expertise on code quality tooling that works across modern JavaScript/TypeScript projects.

## Context
This ensures code consistency across all services and packages. Should work with both NestJS backend services and Next.js frontend. CLAUDE.md mentions the project uses TypeScript with strict mode."

# Issue 4: Prism - T004
echo "Creating Issue 4: [Prism] T004 - Create packages/shared-types..."
gh issue create \
  --repo "${REPO}" \
  --title "[Prism] T004: Create packages/shared-types with TypeScript setup" \
  --label "frontend,typescript,shared-package" \
  --milestone "Monorepo Setup" \
  --body "## Assigned to
Prism (Frontend Engineer)

## Task
T004 - Create packages/shared-types/package.json with TypeScript setup

## Description
Create the shared-types package that will contain TypeScript interfaces and types used across all services.

## Acceptance Criteria
- \`packages/shared-types/package.json\` created with proper configuration
- \`packages/shared-types/tsconfig.json\` extending root config
- Basic directory structure (src/, dist/)
- Export configuration for package consumers (exports field in package.json)
- Build script configured (TypeScript compilation)
- Initial type definitions for common entities (User, Interview, Transcription, Analysis)
- README.md with usage instructions

## Current Status
The packages/shared-types directory already exists with basic structure. This task involves verifying and enhancing the setup.

## Why Prism
TypeScript type definitions are often managed by frontend engineers who understand the contracts between services.

## Context
This package will be used by all services to ensure type consistency. It should export interfaces for API contracts, event schemas, and domain models.

## Dependencies
Depends on T002 (root tsconfig)"

# Issue 5: Prism - T005
echo "Creating Issue 5: [Prism] T005 - Create packages/shared-utils..."
gh issue create \
  --repo "${REPO}" \
  --title "[Prism] T005: Create packages/shared-utils with utility structure" \
  --label "frontend,typescript,shared-package" \
  --milestone "Monorepo Setup" \
  --body "## Assigned to
Prism (Frontend Engineer)

## Task
T005 - Create packages/shared-utils/package.json with utility structure

## Description
Create the shared-utils package for common utility functions used across services.

## Acceptance Criteria
- \`packages/shared-utils/package.json\` created
- \`packages/shared-utils/tsconfig.json\` extending root config
- Directory structure for utility categories (validation, formatting, date-utils, etc.)
- Export configuration for package consumers
- Build script configured
- Unit tests setup with Jest
- README.md with usage examples

## Why Prism
Utility functions are common across frontend and backend, and Prism's experience with modern TypeScript patterns makes them well-suited for this.

## Context
Common utilities might include: date formatting, validation helpers, string utilities, error handling, etc. Should be framework-agnostic so both Next.js and NestJS can use them.

## Dependencies
Depends on T002 (root tsconfig)"

# Issue 6: Atlas - T006
echo "Creating Issue 6: [Atlas] T006 - Create Prisma schema..."
gh issue create \
  --repo "${REPO}" \
  --title "[Atlas] T006: Create Prisma schema with base entities" \
  --label "database,prisma,data-model" \
  --milestone "Monorepo Setup" \
  --body "## Assigned to
Atlas (Data Architect)

## Task
T006 - Create packages/prisma-client/prisma/schema.prisma with base entities

## Description
Design and implement the initial Prisma schema with core database entities for the Interview Buddy platform.

## Acceptance Criteria
- \`packages/prisma-client/prisma/schema.prisma\` created
- PostgreSQL as the database provider
- User reference entity (for Firebase Auth integration - stores userId from Firebase)
- Interview entity with status tracking, metadata, links to transcription and analysis
- Transcription entity with full text, timestamps, confidence score, language
- Analysis entity with speech metrics, content analysis, sentiment scores, recommendations
- PrepSession entity for pre-interview practice
- Proper relationships between entities (one-to-one, one-to-many)
- Indexes for performance-critical queries (userId, status, createdAt)
- Timestamps (createdAt, updatedAt) on all entities
- UUID primary keys

## Why Atlas
Atlas is the data architect with deep expertise in PostgreSQL, Prisma, and data modeling. This is a critical foundation task that requires thoughtful schema design.

## Context
- Refer to CLAUDE.md for architecture overview
- Privacy requirement: users never access raw recordings, only structured data
- Design should support the event flow: upload → transcribe → analyze

## Dependencies
Depends on T002 (root tsconfig)"

# Issue 7: Nexus - T007
echo "Creating Issue 7: [Nexus] T007 - Setup Prisma client generation..."
gh issue create \
  --repo "${REPO}" \
  --title "[Nexus] T007: Setup Prisma client generation" \
  --label "backend,prisma,shared-package" \
  --milestone "Monorepo Setup" \
  --body "## Assigned to
Nexus (Backend Engineer)

## Task
T007 - Setup Prisma client generation in packages/prisma-client/package.json

## Description
Configure the prisma-client package for proper client generation and consumption by services.

## Acceptance Criteria
- \`packages/prisma-client/package.json\` with Prisma dependencies
- Scripts configured: generate, migrate:dev, migrate:deploy, studio, db:push
- Export configuration for generated client
- TypeScript configuration
- README.md with instructions on consuming the client and running migrations
- \`.gitignore\` to exclude generated files

## Why Nexus
Backend engineers work closely with Prisma client in NestJS services and understand how to properly configure it for consumption.

## Context
This package will be imported by all backend services: upload-service, processor-service, ai-analyzer-service.

## Dependencies
**CRITICAL**: Depends on T006 (Prisma schema must exist first)"

# Issue 8: Forge - T008
echo "Creating Issue 8: [Forge] T008 - Configure Docker ignore files..."
gh issue create \
  --repo "${REPO}" \
  --title "[Forge] T008: Configure Docker ignore files for all services" \
  --label "devops,docker,optimization" \
  --milestone "Monorepo Setup" \
  --body "## Assigned to
Forge (DevOps Architect)

## Task
T008 - Configure Docker ignore files (.dockerignore) for all services

## Description
Create appropriate \`.dockerignore\` files to optimize Docker builds and prevent unnecessary files from being copied into containers.

## Acceptance Criteria
- \`.dockerignore\` in repository root
- \`.dockerignore\` in each service directory (apps/web/, apps/upload-service/, etc.)
- Common exclusions: node_modules, .git, .github, .env files, test files, documentation
- Optimized for monorepo structure with comments
- Reduces Docker image size significantly
- Improves build cache effectiveness

## Why Forge
DevOps architects have deep expertise in Docker optimization and understand what should/shouldn't be in containers for both security and performance.

## Context
- Each service will be containerized for Kubernetes deployment (AKS)
- Proper ignore files are crucial for security, performance, and build efficiency
- The project uses a monorepo structure with workspaces
- Services are deployed via Flux GitOps to AKS with Istio

## Dependencies
No dependencies - can be done in parallel"

# Issue 9: Prism - T009
echo "Creating Issue 9: [Prism] T009 - Setup Jest configuration..."
gh issue create \
  --repo "${REPO}" \
  --title "[Prism] T009: Setup Jest configuration for monorepo testing" \
  --label "frontend,testing,configuration" \
  --milestone "Monorepo Setup" \
  --body "## Assigned to
Prism (Frontend Engineer)

## Task
T009 - Setup Jest configuration for monorepo testing in jest.config.js

## Description
Configure Jest for running tests across the monorepo with proper workspace support.

## Acceptance Criteria
- Root \`jest.config.js\` with monorepo configuration
- Project-based configuration for NestJS and Next.js services
- Proper module resolution for workspace packages
- Coverage configuration with thresholds
- Support for TypeScript
- Test environment setup (node for backend, jsdom for frontend)
- Test scripts in root package.json: test, test:unit, test:integration, test:e2e, test:coverage
- Documentation on running tests

## Why Prism
Frontend engineers often set up test infrastructure and understand the needs of both unit and integration testing in modern TypeScript projects.

## Context
Testing strategy includes:
- Unit Tests: Business logic with mocked dependencies (>70% coverage target)
- Integration Tests: Redis event flows, Prisma operations
- E2E Tests: Critical path through upload → transcription → analysis

## Dependencies
Depends on T002 (root tsconfig)"

echo ""
echo "✅ All 9 issues created successfully!"
echo ""
echo "View them at: https://github.com/${REPO}/issues"
echo "View milestone: https://github.com/${REPO}/milestone/1"
