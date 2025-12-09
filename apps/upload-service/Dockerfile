# Use Bun base image
FROM oven/bun:1.3.4-slim AS base
WORKDIR /app

# Install dependencies stage
FROM base AS install
# Copy all package.json files for workspace resolution
COPY package.json bun.lock ./
COPY apps/upload-service/package.json ./apps/upload-service/
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/shared-utils/package.json ./packages/shared-utils/
COPY packages/prisma-client/package.json ./packages/prisma-client/
RUN bun install

# Build stage
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY --from=install /app/apps/upload-service/node_modules ./apps/upload-service/node_modules
COPY --from=install /app/packages ./packages
COPY . .
# Generate Prisma client and build packages first
RUN cd packages/prisma-client && bunx prisma generate
RUN bun run --filter '@interview-buddy/shared-types' build
RUN bun run --filter '@interview-buddy/shared-utils' build
RUN bun run --filter 'upload-service' build

# Production stage
FROM base AS production
ENV NODE_ENV=production

COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/apps/upload-service/dist ./dist
COPY --from=build /app/packages/prisma-client ./packages/prisma-client
COPY apps/upload-service/package.json ./

USER bun

EXPOSE 3000

CMD ["bun", "run", "start:prod"]
