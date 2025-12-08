# Testing Guide - Interview Buddy

This document describes how to run tests across the Interview Buddy monorepo.

## Overview

The monorepo uses Jest as the primary testing framework with project-based configuration. Tests are categorized into three types:

- **Unit Tests** (`.spec.ts`): Business logic, utilities, and components with mocked dependencies
- **Integration Tests** (`.integration.spec.ts`): Database operations, Redis event flows, and service communication
- **E2E Tests** (`.e2e-spec.ts`): Critical user journeys through the entire system

## Test Commands

All commands should be run from the root directory of the monorepo.

### Run All Tests

```bash
npm test
```

Runs all unit, integration, and E2E tests across all workspaces.

### Run Unit Tests Only

```bash
npm run test:unit
```

Runs only unit tests (`.spec.ts` files), excluding integration and E2E tests.

### Run Integration Tests

```bash
npm run test:integration
```

Runs integration tests (`.integration.spec.ts` files) that test interactions between components, database, Redis, etc.

### Run E2E Tests

```bash
npm run test:e2e
```

Runs end-to-end tests (`.e2e-spec.ts` files) that test critical user journeys.

### Run Tests with Coverage

```bash
npm run test:coverage
```

Runs all tests and generates a coverage report. Coverage reports are available in:
- Terminal: Text summary
- HTML: `<workspace>/coverage/index.html` (open in browser)
- JSON: `<workspace>/coverage/coverage-summary.json`

### Watch Mode

```bash
npm run test:watch
```

Runs tests in watch mode, re-running tests when files change.

## Running Tests for Specific Projects

You can run tests for a specific project by using Jest's `--selectProjects` flag:

```bash
# Run tests for upload-service only
npm test -- --selectProjects=upload-service

# Run tests for web app only
npm test -- --selectProjects=web

# Run tests for shared-utils only
npm test -- --selectProjects=shared-utils
```

## Running Specific Test Files

```bash
# Run a specific test file
npm test -- apps/upload-service/src/app.controller.spec.ts

# Run tests matching a pattern
npm test -- --testPathPattern=app.controller
```

## Test Structure

### NestJS Services (Node Environment)

```
apps/upload-service/
├── src/
│   ├── app.controller.spec.ts          # Unit tests
│   ├── app.service.spec.ts             # Unit tests
│   └── features/
│       ├── upload.service.spec.ts      # Unit tests
│       └── upload.integration.spec.ts  # Integration tests
└── test/
    └── app.e2e-spec.ts                 # E2E tests
```

### Next.js App (jsdom Environment)

```
apps/web/
├── app/
│   └── components/
│       └── Button.spec.tsx             # Component tests
└── __tests__/
    └── integration/
        └── auth.integration.spec.ts    # Integration tests
```

### Shared Packages (Node Environment)

```
packages/shared-utils/
└── src/
    ├── validation.ts
    └── validation.spec.ts              # Unit tests
```

## Coverage Thresholds

The monorepo has coverage thresholds configured in `jest.config.js`:

- **Branches**: 70%
- **Functions**: 70%
- **Lines**: 70%
- **Statements**: 70%

These thresholds align with the project's quality goals (>70% coverage per CLAUDE.md).

## Writing Tests

### Unit Test Example (NestJS Service)

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';

describe('UploadService', () => {
  let service: UploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UploadService],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate file size', () => {
    const result = service.validateFileSize(1024 * 1024 * 500); // 500MB
    expect(result).toBe(true);
  });
});
```

### Integration Test Example

```typescript
describe('Upload Flow Integration', () => {
  it('should emit interview.uploaded event after upload', async () => {
    // Arrange
    const mockFile = createMockFile();
    
    // Act
    await uploadService.handleUpload(mockFile);
    
    // Assert
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'interview.uploaded',
      expect.objectContaining({
        interviewId: expect.any(String),
        userId: 'test-user-id',
      })
    );
  });
});
```

### E2E Test Example

```typescript
describe('Upload API (e2e)', () => {
  it('/upload (POST)', () => {
    return request(app.getHttpServer())
      .post('/upload')
      .attach('file', './test/fixtures/sample.mp4')
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('interviewId');
        expect(res.body).toHaveProperty('status', 'uploading');
      });
  });
});
```

## Test Environment Configuration

### NestJS Services
- **Environment**: Node.js
- **Test Framework**: Jest with ts-jest
- **Mocking**: @nestjs/testing utilities
- **Coverage**: Excludes main.ts, *.module.ts, *.interface.ts, *.dto.ts

### Next.js App
- **Environment**: jsdom (simulates browser)
- **Test Framework**: Jest with ts-jest
- **React Testing**: Configure with @testing-library/react (when added)
- **Coverage**: Excludes layout.tsx, page.tsx, *.d.ts

### Shared Packages
- **Environment**: Node.js
- **Test Framework**: Jest with ts-jest
- **Coverage**: Excludes *.interface.ts, *.dto.ts

## Debugging Tests

### Debug a Single Test

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand <test-file>
```

Then attach your debugger (VS Code, Chrome DevTools, etc.) to `localhost:9229`.

### Verbose Output

```bash
npm test -- --verbose
```

### See Test Names Without Running

```bash
npm test -- --listTests
```

## CI/CD Integration

Tests are automatically run in the CI/CD pipeline:

1. **Commit Stage**: Unit tests run on every commit
2. **PR Stage**: All tests (unit + integration) run on pull requests
3. **Release Stage**: Full test suite including E2E tests before deployment

## Troubleshooting

### "Cannot find module" errors

Ensure all workspace dependencies are installed:

```bash
npm install
```

### Coverage threshold failures

If coverage drops below 70%, either:
1. Add tests to improve coverage
2. Review if threshold is appropriate (modify `jest.config.js` if needed)

### Tests timing out

Increase timeout for specific tests:

```typescript
it('should process large file', async () => {
  // Test code
}, 30000); // 30 second timeout
```

### TypeScript errors in tests

Ensure ts-jest is configured properly and tsconfig.json includes test files.

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Testing Strategy](./specs/TESTING_STRATEGY.md)
- [Project Architecture](./CLAUDE.md)

## Quality Goals

As per the Aegis philosophy: **"If it's not tested, it's broken."**

- ✅ 100% passing tests
- ✅ >70% code coverage (target: 80%+ for critical paths)
- ✅ Tests should validate behavior, not implementation
- ✅ Flaky tests should be fixed immediately
- ✅ Coverage is a floor, not a ceiling
