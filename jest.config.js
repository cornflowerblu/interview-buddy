/**
 * Root Jest Configuration for Interview Buddy Monorepo
 * 
 * This configuration orchestrates testing across all workspaces:
 * - NestJS microservices (upload-service, processor-service, ai-analyzer-service)
 * - Next.js frontend (web)
 * - Shared packages (shared-types, shared-utils, prisma-client)
 * 
 * Test Types:
 * - Unit: *.spec.ts files (business logic, components)
 * - Integration: *.integration.spec.ts files (database, Redis, service communication)
 * - E2E: *.e2e-spec.ts files (critical user journeys)
 */

module.exports = {
  // Projects-based configuration for monorepo
  projects: [
    // NestJS Services - Node environment
    {
      displayName: 'upload-service',
      testEnvironment: 'node',
      rootDir: './apps/upload-service',
      testMatch: [
        '<rootDir>/src/**/*.spec.ts',
        '<rootDir>/test/**/*.e2e-spec.ts',
      ],
      moduleFileExtensions: ['js', 'json', 'ts'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/main.ts',
        '!src/**/*.module.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.dto.ts',
      ],
      coverageDirectory: '<rootDir>/coverage',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'processor-service',
      testEnvironment: 'node',
      rootDir: './apps/processor-service',
      testMatch: [
        '<rootDir>/src/**/*.spec.ts',
        '<rootDir>/test/**/*.e2e-spec.ts',
      ],
      moduleFileExtensions: ['js', 'json', 'ts'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/main.ts',
        '!src/**/*.module.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.dto.ts',
      ],
      coverageDirectory: '<rootDir>/coverage',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    {
      displayName: 'ai-analyzer-service',
      testEnvironment: 'node',
      rootDir: './apps/ai-analyzer-service',
      testMatch: [
        '<rootDir>/src/**/*.spec.ts',
        '<rootDir>/test/**/*.e2e-spec.ts',
      ],
      moduleFileExtensions: ['js', 'json', 'ts'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/main.ts',
        '!src/**/*.module.ts',
        '!src/**/*.interface.ts',
        '!src/**/*.dto.ts',
      ],
      coverageDirectory: '<rootDir>/coverage',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
    },
    // Next.js Web App - jsdom environment for React components
    {
      displayName: 'web',
      testEnvironment: 'jsdom',
      rootDir: './apps/web',
      testMatch: [
        '<rootDir>/app/**/*.{spec,test}.{ts,tsx}',
        '<rootDir>/__tests__/**/*.{spec,test}.{ts,tsx}',
      ],
      moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
      transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', {
          tsconfig: {
            jsx: 'react',
            esModuleInterop: true,
          },
        }],
      },
      collectCoverageFrom: [
        'app/**/*.{ts,tsx}',
        '!app/**/*.d.ts',
        '!app/**/layout.tsx',
        '!app/**/page.tsx',
      ],
      coverageDirectory: '<rootDir>/coverage',
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
        // Handle CSS imports (with CSS modules)
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        // Handle CSS imports (without CSS modules)
        '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
        // Handle image imports
        '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    // Shared Packages - Node environment
    {
      displayName: 'shared-utils',
      testEnvironment: 'node',
      rootDir: './packages/shared-utils',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      moduleFileExtensions: ['js', 'json', 'ts'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: [
        'src/**/*.(t|j)s',
        '!src/**/*.interface.ts',
        '!src/**/*.dto.ts',
      ],
      coverageDirectory: '<rootDir>/coverage',
    },
    {
      displayName: 'shared-types',
      testEnvironment: 'node',
      rootDir: './packages/shared-types',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      moduleFileExtensions: ['js', 'json', 'ts'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: [
        'src/**/*.(t|j)s',
      ],
      coverageDirectory: '<rootDir>/coverage',
    },
    {
      displayName: 'prisma-client',
      testEnvironment: 'node',
      rootDir: './packages/prisma-client',
      testMatch: ['<rootDir>/src/**/*.spec.ts'],
      moduleFileExtensions: ['js', 'json', 'ts'],
      transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
      },
      collectCoverageFrom: [
        'src/**/*.(t|j)s',
      ],
      coverageDirectory: '<rootDir>/coverage',
    },
  ],

  // Global coverage thresholds (target >70% per CLAUDE.md)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // Global settings
  collectCoverage: false, // Enable with --coverage flag
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/test/',
    '.*\\.module\\.ts$',
    '.*\\.interface\\.ts$',
    '.*\\.dto\\.ts$',
    'main\\.ts$',
  ],
  
  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/.next/',
    '/coverage/',
  ],
  
  // Module path ignore patterns
  modulePathIgnorePatterns: [
    '<rootDir>/dist/',
    '<rootDir>/.next/',
  ],
};
