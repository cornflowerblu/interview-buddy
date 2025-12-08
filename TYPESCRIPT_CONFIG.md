# TypeScript Configuration

This document describes the TypeScript configuration structure for the Interview Buddy monorepo.

## Overview

The monorepo uses a **strict TypeScript configuration** with composite projects to ensure type safety across all services and packages.

## Configuration Hierarchy

```
tsconfig.base.json          # Base configuration with strict mode
  ├── tsconfig.json          # Root configuration with project references
  ├── packages/
  │   ├── shared-types/tsconfig.json
  │   ├── shared-utils/tsconfig.json
  │   └── prisma-client/tsconfig.json
  └── apps/
      ├── upload-service/tsconfig.json
      ├── processor-service/tsconfig.json
      ├── ai-analyzer-service/tsconfig.json
      └── web/tsconfig.json
```

## Base Configuration (`tsconfig.base.json`)

The base configuration enables **strict mode** with the following key settings:

### Strict Type Checking
- `strict: true` - Enables all strict type checking options
- `noImplicitAny: true` - Error on expressions with implied 'any' type
- `strictNullChecks: true` - Enable strict null checks
- `strictFunctionTypes: true` - Enable strict checking of function types
- `strictBindCallApply: true` - Enable strict checking of bind, call, and apply
- `strictPropertyInitialization: true` - Ensure properties are initialized in constructor
- `noImplicitThis: true` - Error on 'this' expressions with implied 'any' type
- `alwaysStrict: true` - Parse in strict mode and emit "use strict"

### Additional Checks
- `noImplicitReturns: true` - Error on code paths that don't explicitly return
- `noFallthroughCasesInSwitch: true` - Report errors for fallthrough cases

### Module Configuration
- `target: ES2022` - Modern JavaScript target
- `moduleResolution: node` - Node.js style module resolution
- `resolveJsonModule: true` - Allow importing .json files
- `esModuleInterop: true` - Emit additional JavaScript for interop with CommonJS

### Decorators
- `experimentalDecorators: true` - Enable decorators (required for NestJS)
- `emitDecoratorMetadata: true` - Emit design-type metadata (required for NestJS DI)

## Root Configuration (`tsconfig.json`)

The root configuration:
- Extends `tsconfig.base.json`
- Enables `composite: true` for project references
- Defines **path aliases** for workspace packages:
  - `@interview-buddy/shared-types` → `./packages/shared-types/src`
  - `@interview-buddy/shared-utils` → `./packages/shared-utils/src`
  - `@interview-buddy/prisma-client` → `./packages/prisma-client`
- Lists all project references for composite builds

## Package Configurations

### Shared Packages (`packages/shared-types`, `packages/shared-utils`)

Each shared package extends the base configuration and:
- Sets `composite: true` for incremental builds
- Uses `module: commonjs` for compatibility
- Configures output directories (`outDir: ./dist`)
- Defines local path aliases for cross-package dependencies

### NestJS Services (`apps/*-service`)

NestJS services extend the base configuration and:
- Set `composite: true` for incremental builds
- Use `module: commonjs` for Node.js compatibility
- Configure path aliases to shared packages
- Exclude test files from build output

### Next.js App (`apps/web`)

The Next.js app extends the base configuration but:
- Uses `module: esnext` and `moduleResolution: bundler` (Next.js requirement)
- Sets `jsx: preserve` for Next.js JSX handling
- Includes Next.js plugin for type generation
- Maintains strict mode while accommodating Next.js patterns

## Path Aliases

Path aliases enable importing shared packages using workspace names:

```typescript
// Instead of relative imports:
import { InterviewUploadedEvent } from '../../../../packages/shared-types/src/events';

// Use workspace aliases:
import { InterviewUploadedEvent } from '@interview-buddy/shared-types';
```

## Building

### Individual Package/Service
```bash
cd packages/shared-types
npm run build
```

### All Projects (Composite Build)
```bash
# From root
npx tsc --build
```

This uses TypeScript's project references for incremental, dependency-aware builds.

### Clean Build
```bash
npx tsc --build --clean
npx tsc --build
```

## IDE Support

Modern IDEs (VS Code, WebStorm) automatically detect the TypeScript configuration and provide:
- IntelliSense with path aliases
- Go-to-definition across packages
- Real-time type checking
- Import auto-completion

## Adding a New Package

When adding a new package to the monorepo:

1. Create `tsconfig.json` extending the base:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "composite": true,
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

2. Add path alias to root `tsconfig.json`:
```json
"paths": {
  "@interview-buddy/new-package": ["./packages/new-package/src"]
}
```

3. Add project reference to root `tsconfig.json`:
```json
"references": [
  { "path": "./packages/new-package" }
]
```

## Troubleshooting

### "Cannot find module '@interview-buddy/...'"

Ensure:
1. The package has been built (`npm run build` in the package directory)
2. Path aliases are defined in your tsconfig.json
3. The package is listed in project references

### Strict Mode Errors

The strict configuration catches potential bugs at compile time. Common patterns:

**Uninitialized properties:**
```typescript
// ❌ Error: Property has no initializer
class Service {
  private config: Config;
}

// ✅ Fixed: Initialize in constructor or use definite assignment
class Service {
  private config!: Config; // Definite assignment assertion
  
  constructor() {
    this.initConfig();
  }
}
```

**Nullable types:**
```typescript
// ❌ Error: Object is possibly undefined
const value = array.find(x => x.id === id);
return value.name;

// ✅ Fixed: Handle null/undefined
const value = array.find(x => x.id === id);
if (!value) throw new Error('Not found');
return value.name;
```

## References

- [TypeScript Handbook - Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [TypeScript Compiler Options](https://www.typescriptlang.org/tsconfig)
- [NestJS TypeScript Best Practices](https://docs.nestjs.com/techniques/typescript)
