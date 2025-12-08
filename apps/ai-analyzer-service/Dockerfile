# Use Bun base image
FROM oven/bun:1.3.4-slim AS base
WORKDIR /app

# Install dependencies stage
FROM base AS install
COPY package.json ./
RUN bun install

# Build stage
FROM base AS build
COPY --from=install /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production stage
FROM base AS production
ENV NODE_ENV=production

COPY --from=install /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Use bun user (already exists in image)
USER bun

EXPOSE 3002

CMD ["bun", "run", "start:prod"]
