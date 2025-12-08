# Linting and Formatting Guide

This document explains the ESLint and Prettier configuration for the Interview Buddy monorepo.

## Overview

The monorepo uses a consistent code style across all packages and applications using:

- **ESLint v9** with flat config format for linting TypeScript and JavaScript
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **lint-staged** for running linters on staged files

## Configuration Files

### Root Level

- **`eslint.config.mjs`**: Main ESLint configuration using the new flat config format
- **`.prettierrc`**: Prettier formatting rules
- **`.prettierignore`**: Files and directories to ignore when formatting
- **`.husky/pre-commit`**: Git pre-commit hook that runs lint-staged

### Workspace Level

Individual workspaces (apps and packages) may have their own ESLint configs that extend or override the root config:

- `apps/web/eslint.config.mjs` - Next.js specific rules
- `apps/upload-service/eslint.config.mjs` - NestJS specific rules
- `apps/processor-service/eslint.config.mjs` - NestJS specific rules
- `apps/ai-analyzer-service/eslint.config.mjs` - NestJS specific rules

## ESLint Configuration

The root ESLint configuration (`eslint.config.mjs`) includes:

- **Base rules**: ESLint recommended rules
- **TypeScript rules**: TypeScript ESLint recommended rules
- **Prettier integration**: Disables ESLint formatting rules that conflict with Prettier
- **Custom rules**:
  - Warning on `any` types (not an error to allow gradual typing)
  - Error on unused variables (unless prefixed with `_`)
  - Warning on console statements (except `console.warn` and `console.error`)
  - Enforcing `import type` for type-only imports
  - Prefer `const` over `let` and no `var`

### Key Features

- **Monorepo support**: Ignores build outputs, node_modules, and generated files
- **TypeScript & JavaScript**: Handles both `.ts`/`.tsx` and `.js`/`.jsx` files
- **NestJS compatible**: Works with decorators and dependency injection patterns
- **Next.js compatible**: Works with React and Next.js specific patterns

## Prettier Configuration

The Prettier configuration (`.prettierrc`) enforces:

```json
{
  "semi": true, // Use semicolons
  "singleQuote": true, // Use single quotes
  "trailingComma": "all", // Trailing commas everywhere possible
  "printWidth": 80, // Wrap lines at 80 characters
  "tabWidth": 2, // 2 spaces for indentation
  "useTabs": false, // Use spaces, not tabs
  "arrowParens": "always", // Always use parens around arrow function params
  "endOfLine": "lf", // Unix line endings
  "bracketSpacing": true, // Spaces in object literals
  "bracketSameLine": false // Put `>` on new line for multi-line JSX
}
```

## Available Scripts

### Root Level (runs on entire monorepo)

```bash
# Lint all files in monorepo
npm run lint

# Lint and auto-fix issues
npm run lint:fix

# Format all files with Prettier
npm run format

# Check formatting without modifying files
npm run format:check

# Lint all workspaces using their local configs
npm run lint:workspaces

# Format all workspaces using their local configs
npm run format:workspaces
```

### Workspace Level

Each workspace has its own scripts:

```bash
# In any workspace (apps/web, apps/upload-service, etc.)
cd apps/web

# Lint the workspace
npm run lint

# Fix linting issues
npm run lint:fix

# Format the workspace
npm run format

# Check formatting
npm run format:check
```

## Pre-commit Hooks

Pre-commit hooks are configured using Husky and lint-staged. When you commit changes:

1. **lint-staged** runs automatically via the pre-commit hook
2. It runs ESLint and Prettier only on **staged files** (not the entire codebase)
3. If linting fails, the commit is blocked until issues are fixed

This ensures that:

- Only properly formatted code is committed
- CI/CD pipelines don't fail due to linting issues
- Code quality is maintained consistently

### Bypassing Pre-commit Hooks

In rare cases where you need to bypass the hooks (not recommended):

```bash
git commit --no-verify -m "Your commit message"
```

## Common Issues and Solutions

### Issue: ESLint "Parsing error" about tsconfig.json

**Solution**: The root ESLint config doesn't use type-aware linting to avoid requiring a root `tsconfig.json`. Individual workspaces can enable type-aware linting in their own configs if needed.

### Issue: Prettier and ESLint conflict

**Solution**: We use `eslint-config-prettier` which disables all ESLint formatting rules that might conflict with Prettier. Always run Prettier after ESLint.

### Issue: Pre-commit hook is slow

**Solution**: lint-staged only runs on staged files, not the entire codebase. If it's still slow:

- Commit smaller changesets
- Use `git commit --no-verify` sparingly for non-code commits (docs only, etc.)

### Issue: Different line endings (CRLF vs LF)

**Solution**: Prettier is configured with `endOfLine: "lf"` and auto-fixes line endings. Git should be configured with:

```bash
git config --global core.autocrlf false
```

## IDE Integration

### VS Code

Install these extensions:

- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

Recommended `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ]
}
```

### WebStorm / IntelliJ IDEA

1. Enable ESLint: Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
2. Enable Prettier: Settings → Languages & Frameworks → JavaScript → Prettier
3. Enable "Run eslint --fix on save"
4. Enable "On save" for Prettier

## Customizing Rules

### For the entire monorepo

Edit `eslint.config.mjs` in the root directory.

### For a specific workspace

Create or edit `eslint.config.mjs` in the workspace directory. The workspace config will extend the root config.

Example for adding a custom rule to a NestJS service:

```javascript
// apps/my-service/eslint.config.mjs
import baseConfig from '../../eslint.config.mjs';

export default [
  ...baseConfig,
  {
    rules: {
      // Override or add custom rules here
      '@typescript-eslint/no-explicit-any': 'error', // Make this an error instead of warning
    },
  },
];
```

## Best Practices

1. **Run linters before pushing**: Always run `npm run lint` and `npm run format:check` before pushing
2. **Fix warnings gradually**: We use warnings for `any` types to allow gradual migration to stricter types
3. **Use `_` prefix for unused variables**: If a parameter is required by an interface but not used, prefix it with `_`
4. **Import types correctly**: Use `import type` for type-only imports to help with tree-shaking
5. **Don't disable rules globally**: If you need to disable a rule, do it inline with a comment explaining why

## CI/CD Integration

In CI pipelines, run:

```bash
# Check linting (don't auto-fix in CI)
npm run lint

# Check formatting (don't auto-format in CI)
npm run format:check
```

This ensures that code is properly formatted before merging to main branches.

## Migration Notes

This configuration uses:

- **ESLint v9**: Uses the new "flat config" format (`.mjs` instead of `.json` or `.js`)
- **.eslintignore is deprecated**: Use the `ignores` property in the config instead
- **No type-checking at root**: Individual workspaces can enable type-aware linting if needed

For more information:

- [ESLint Flat Config Migration Guide](https://eslint.org/docs/latest/use/configure/migration-guide)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [typescript-eslint Documentation](https://typescript-eslint.io/)
