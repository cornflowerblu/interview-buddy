# Orchestration Guide: Monorepo Setup Tasks

## Overview

This guide documents the orchestration of 9 monorepo setup tasks (T001-T009) across the Interview Buddy project's custom agents. Each task has been analyzed and assigned to the agent with the most appropriate expertise.

## Quick Start

### Option 1: Create Issues via GitHub CLI (Recommended)

If you have the GitHub CLI (`gh`) installed and authenticated:

```bash
bash scripts/create-monorepo-issues.sh
```

This will automatically create all 9 GitHub issues with proper labels, milestone, and agent assignments.

### Option 2: Create Issues Manually

If you prefer to create issues manually or don't have `gh` CLI:

1. Read the detailed issue descriptions in `TASK_ASSIGNMENTS.md`
2. Create each issue on GitHub manually
3. Copy the title, labels, and body content from the document
4. Assign or tag the appropriate agent in each issue

### Option 3: Use GitHub Web UI with Template

Navigate to the repository and create issues using this template structure:

**Title Format:** `[Agent] T00X: Brief task description`

**Labels:** As specified in each task (e.g., `backend`, `frontend`, `database`)

**Body:** Copy from the detailed descriptions in `TASK_ASSIGNMENTS.md`

## Agent Assignment Summary

| Task ID | Agent            | Task Description                 | Parallel Group  |
| ------- | ---------------- | -------------------------------- | --------------- |
| T001    | Nexus (Backend)  | Initialize monorepo package.json | ✅ Already done |
| T002    | Prism (Frontend) | Setup TypeScript strict mode     | Phase 2         |
| T003    | Prism (Frontend) | Configure ESLint and Prettier    | Phase 2         |
| T004    | Prism (Frontend) | Create packages/shared-types     | Phase 3         |
| T005    | Prism (Frontend) | Create packages/shared-utils     | Phase 3         |
| T006    | Atlas (Data)     | Create Prisma schema             | Phase 3         |
| T007    | Nexus (Backend)  | Setup Prisma client generation   | Phase 4         |
| T008    | Forge (DevOps)   | Configure Docker ignore files    | Phase 2         |
| T009    | Prism (Frontend) | Setup Jest configuration         | Phase 2         |

## Execution Phases

### Phase 1: Foundation (COMPLETE)

- ✅ **T001** - Monorepo package.json (Nexus)
  - Status: Already implemented with Bun workspaces

### Phase 2: Configuration (Can Run in Parallel)

These tasks have no dependencies on each other and can be executed simultaneously:

- **T002** - TypeScript config (Prism)
- **T003** - ESLint/Prettier (Prism)
- **T008** - Docker ignore files (Forge)
- **T009** - Jest config (Prism)

**Estimated Time:** 2-4 hours per agent working in parallel

### Phase 3: Shared Packages (Can Run in Parallel after Phase 2)

These tasks depend on T002 (TypeScript config) but can run in parallel with each other:

- **T004** - shared-types (Prism)
- **T005** - shared-utils (Prism)
- **T006** - Prisma schema (Atlas)

**Estimated Time:** 2-4 hours per agent working in parallel

### Phase 4: Prisma Client (Sequential)

This task must run after T006 is complete:

- **T007** - Prisma client generation (Nexus)
  - **Blocker:** Must wait for T006 (Prisma schema)

**Estimated Time:** 1-2 hours

## Agent Expertise Mapping

### Why This Assignment?

#### Nexus (Backend Engineer) - 2 tasks

- **T001:** Monorepo structure and package management are core backend infrastructure concerns
- **T007:** Prisma client configuration requires deep understanding of how NestJS services consume database tooling

#### Prism (Frontend Engineer) - 5 tasks

- **T002:** TypeScript configuration for modern fullstack projects (Next.js + NestJS)
- **T003:** Code quality tooling is typically a frontend engineer's domain
- **T004:** Type definitions and interfaces bridge frontend-backend contracts
- **T005:** Shared utilities benefit from frontend engineer's modern TypeScript patterns
- **T009:** Test infrastructure setup requires understanding of both Jest and framework-specific testing

#### Atlas (Data Architect) - 1 task

- **T006:** Database schema design is Atlas's core expertise. This is a critical foundation that requires careful data modeling.

#### Forge (DevOps Architect) - 1 task

- **T008:** Docker optimization and containerization strategy is Forge's domain, especially for K8s deployment

## Dependencies Graph

```
T001 (Nexus) ✅ DONE
  │
  └─> Phase 2 (Parallel)
      ├─> T002 (Prism) - TypeScript config
      ├─> T003 (Prism) - ESLint/Prettier
      ├─> T008 (Forge) - Docker ignore
      └─> T009 (Prism) - Jest config
          │
          └─> Phase 3 (Parallel, depends on T002)
              ├─> T004 (Prism) - shared-types
              ├─> T005 (Prism) - shared-utils
              └─> T006 (Atlas) - Prisma schema
                  │
                  └─> Phase 4 (Sequential)
                      └─> T007 (Nexus) - Prisma client
```

## Critical Path

The **critical path** (longest sequence) is:

```
T001 (done) → T002 (Prism) → T006 (Atlas) → T007 (Nexus)
```

Total critical path time: ~4-8 hours

## Coordination Points

### Handoff 1: Prism → Atlas (T002 → T006)

- **What:** TypeScript config must be complete before Prisma schema work begins
- **Why:** Prisma schema generation requires TypeScript compiler
- **Action:** Prism notifies Atlas when T002 is merged

### Handoff 2: Atlas → Nexus (T006 → T007)

- **What:** Prisma schema must be complete and reviewed before client setup
- **Why:** Client generation depends on schema structure
- **Action:** Atlas notifies Nexus when T006 is merged, schema is validated

### Handoff 3: Prism → All (T002 → T004, T005, T009)

- **What:** Root TypeScript config enables other config-dependent tasks
- **Why:** All these tasks extend the root tsconfig
- **Action:** Prism notifies team when T002 is merged

## Communication Protocol

### For Each Task Completion:

1. Agent creates PR with changes
2. Agent self-reviews code
3. Agent marks issue as ready for review
4. Another team member reviews (cross-agent validation)
5. Agent merges PR
6. Agent notifies dependent agents if applicable
7. Agent closes issue

### Status Updates:

- Use issue comments for progress updates
- Tag dependent agents when nearing completion
- Use `@mentions` for blockers or questions

## Risk Management

### Risk 1: Prism Bottleneck

**Risk:** Prism has 5 tasks - potential bottleneck

**Mitigation:**

- Phase 2 tasks (T002, T003, T009) can be done sequentially by Prism
- Phase 3 tasks (T004, T005) can wait for Phase 2 completion
- Alternatively, consider splitting T004/T005 to another agent if Prism is overloaded

### Risk 2: T006 → T007 Dependency

**Risk:** If T006 (Prisma schema) is delayed, T007 blocks

**Mitigation:**

- Prioritize T006 in Atlas's queue
- Have Nexus review T006 early to catch issues before completion
- T007 is relatively quick once T006 is done

### Risk 3: Configuration Conflicts

**Risk:** Multiple config files being created might have conflicts

**Mitigation:**

- Agents should pull latest main before starting work
- Use feature branches, not direct commits to main
- Coordinate on overlapping files (e.g., package.json scripts)

## Success Criteria

### Definition of Done (for entire initiative):

- ✅ All 9 tasks completed and merged to main
- ✅ Root package.json has proper workspaces and scripts
- ✅ TypeScript compiles successfully across all workspaces
- ✅ ESLint and Prettier run without errors
- ✅ Jest tests can run (even if no tests exist yet)
- ✅ Prisma client generates successfully
- ✅ All services have .dockerignore files
- ✅ Documentation updated in CLAUDE.md or README.md

### Quality Gates:

- Each PR must pass linting
- Each PR must include updated documentation
- Prisma schema must be reviewed by at least 2 people
- TypeScript config must be tested with at least one service compilation

## Timeline Estimate

**Best Case Scenario** (all agents working in parallel):

- Phase 1: ✅ Done
- Phase 2: 2-4 hours
- Phase 3: 2-4 hours (starts after Phase 2)
- Phase 4: 1-2 hours (starts after Phase 3)
- **Total: 5-10 hours of wall-clock time**

**Realistic Scenario** (some serial work due to agent availability):

- 1-2 days to complete all tasks with reviews

**Conservative Scenario** (agents working serially):

- 3-5 days to complete all tasks with reviews

## Next Steps After Completion

Once all 9 tasks are complete, the monorepo foundation will be ready for:

1. **Service Development**
   - Implement upload-service endpoints
   - Implement processor-service with Azure Media Services
   - Implement ai-analyzer-service with OpenAI/Claude

2. **Frontend Development**
   - Build Next.js dashboard
   - Implement upload UI with tus protocol
   - Create analysis results view

3. **Infrastructure**
   - Set up Kubernetes manifests
   - Configure Istio service mesh
   - Implement Flux GitOps

## Troubleshooting

### "I can't start my task because of a dependency"

- Check the Dependencies Graph above
- Confirm the blocking task is truly complete (not just in PR)
- If urgent, coordinate with the blocking agent

### "My task conflicts with another agent's work"

- Communicate in the issue comments
- Consider pair programming or screen sharing
- Orchestrator (that's me!) can help mediate

### "I don't have expertise in this area"

- Agents were assigned based on expertise, but if you're truly blocked:
  - Ask questions in the issue
  - Tag another agent for guidance
  - Orchestrator can reassign if needed

## Contact

For questions about task assignments, dependencies, or orchestration:

- Comment on the relevant GitHub issue
- Tag the orchestrator or specific agents
- Reference this guide and `TASK_ASSIGNMENTS.md`

## Files Reference

- **TASK_ASSIGNMENTS.md** - Detailed issue descriptions for all 9 tasks
- **scripts/create-monorepo-issues.sh** - Automated issue creation script
- **ORCHESTRATION_GUIDE.md** - This file, explains the execution strategy

---

**Last Updated:** 2025-12-08  
**Orchestrator:** Conductor  
**Status:** Ready for execution
