# Use Bun base image
FROM oven/bun:1.3.4-slim AS base
WORKDIR /app

# Build stage - install all deps and build
FROM base AS build
COPY package.json bun.lock tsconfig.base.json ./
COPY apps/web ./apps/web
COPY packages ./packages
RUN bun install
ENV NEXT_TELEMETRY_DISABLED=1
# Generate Prisma client and build packages first
RUN cd packages/prisma-client && bunx prisma generate
RUN cd packages/shared-types && bun run build
RUN cd packages/shared-utils && bun run build
RUN cd apps/web && bun run build

# Production image - Next.js standalone
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build /app/apps/web/public ./apps/web/public
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static

USER bun

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "apps/web/server.js"]
