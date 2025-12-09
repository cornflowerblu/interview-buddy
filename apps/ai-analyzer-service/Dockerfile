# Use Bun base image
FROM oven/bun:1.3.4-slim AS base
WORKDIR /app

# Build stage - install all deps and build
FROM base AS build
COPY package.json bun.lock tsconfig.base.json ./
COPY apps/ai-analyzer-service ./apps/ai-analyzer-service
COPY packages ./packages
RUN bun install
# Generate Prisma client and build
RUN cd packages/prisma-client && bunx prisma generate
RUN cd packages/shared-types && bun run build
RUN cd packages/shared-utils && bun run build
RUN cd apps/ai-analyzer-service && bun run build

# Production stage - use app directory as workdir
FROM base AS production
ENV NODE_ENV=production
WORKDIR /app/apps/ai-analyzer-service

# Copy the entire built workspace structure
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/apps/ai-analyzer-service/node_modules ./node_modules
COPY --from=build /app/apps/ai-analyzer-service/dist ./dist
COPY --from=build /app/apps/ai-analyzer-service/package.json ./
COPY --from=build /app/packages/prisma-client /app/packages/prisma-client

USER bun

EXPOSE 3002

CMD ["bun", "run", "start:prod"]
