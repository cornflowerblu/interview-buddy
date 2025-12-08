# Testing & Automation Strategy

## Philosophy

We adopt the "Aegis" mindset: **Quality is not a phase, but a mindset.**

- **Goal**: 100% passing tests, >80% code coverage.
- **Principle**: "If it's not tested, it's broken."

## Testing Pyramid

### 1. Unit Tests (Jest)

- **Scope**: Individual functions, classes, and components.
- **Focus**: Business logic, edge cases, and error handling.
- **Tooling**: Jest for NestJS services, React Testing Library for Web.
- **Requirement**: Must pass before any commit.

### 2. Integration Tests (Jest + Testcontainers)

- **Scope**: Interaction between modules and external services (DB, Redis).
- **Focus**: API contracts, database queries, message queue interactions.
- **Tooling**: Testcontainers to spin up ephemeral Postgres/Redis instances.
- **Requirement**: Run on every PR.

### 3. End-to-End (E2E) Tests (Playwright)

- **Scope**: Critical user journeys (Upload -> Processing -> Analysis -> Result).
- **Focus**: User experience, system reliability, and cross-service communication.
- **Tooling**: Playwright.
- **Requirement**: Run on staging/pre-prod before release.

## Automation Pipeline (CI/CD)

We aim for **Continuous Deployment** with rigorous gates.

1.  **Commit Stage**:

    - Linting & Formatting.
    - Unit Tests.
    - Static Analysis (SonarQube/CodeQL).

2.  **Build Stage**:

    - Build Docker images.
    - Publish to Container Registry with commit SHA tag.

3.  **Integration Stage**:

    - Deploy ephemeral environment (or use Testcontainers).
    - Run Integration Tests.

4.  **Release Stage (Automated)**:
    - **Canary Deployment**: Deploy new version to 5% of traffic using Flux/Flagger.
    - **Automated Analysis**: Monitor error rates (HTTP 500s) and latency.
    - **Promotion**: If metrics are healthy, gradually increase traffic (5% -> 20% -> 50% -> 100%).
    - **Rollback**: Automatic rollback if error threshold exceeded.

## Infrastructure & Observability

- **GitOps**: All deployments managed via Flux CD. Changes to `manifests/` trigger reconciliations.
- **Observability**: OpenTelemetry for distributed tracing. Prometheus/Grafana for metrics.
- **Alerting**: PagerDuty/Slack alerts for failed canary stages or production incidents.

## Next Steps

1.  Configure **Jest** with **Testcontainers** for `processor-service`.
2.  Set up **Playwright** in `apps/web` for the critical "Upload Interview" flow.
3.  Implement **Flagger** for canary deployments in Kubernetes.
