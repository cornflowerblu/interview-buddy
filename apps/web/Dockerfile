# Use Bun base image
FROM oven/bun:1.3.4-slim AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
# Copy all package.json files for workspace resolution
COPY package.json bun.lock ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/prisma-client/package.json ./packages/prisma-client/
RUN bun install --frozen-lockfile

# Build application
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages ./packages
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Generate Prisma client and build packages first
RUN cd packages/prisma-client && bunx prisma generate
RUN bun run --filter '@interview-buddy/shared-types' build
RUN bun run --filter '@interview-buddy/shared-utils' build
RUN bun run --filter 'web' build

# Production image
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static

USER bun

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
