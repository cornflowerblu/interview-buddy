# API Contracts

**Status**: Lightweight - flesh out as we build
**Last Updated**: 2025-12-08

High-level API endpoints. We'll add detailed request/response schemas as we implement.

## Next.js API Routes (apps/web)

User-facing API gateway. Handles auth and proxies to microservices.

### Uploads
- `POST /api/upload/sas-url` - Get Video Indexer SAS URL for direct upload
- `POST /api/upload/complete` - Notify backend that upload finished
- `PATCH /api/interviews/:id/metadata` - Update interview metadata

### Interviews
- `GET /api/interviews` - List user's interviews
- `GET /api/interviews/:id` - Get interview details
- `GET /api/interviews/:id/analysis` - Get analysis results

### Prep Sessions
- `POST /api/prep` - Create prep session
- `GET /api/prep/:id` - Get prep session
- `POST /api/prep/:id/practice` - Submit practice answer, get AI feedback

## Internal Service APIs

### upload-service (NestJS)
Mostly internal - called by Next.js API routes.

- `POST /internal/upload/initiate` - Create Interview record
- `PATCH /internal/upload/:id/status` - Update status

### processor-service (NestJS)
Event-driven - no HTTP API needed initially.
- Listens to `interview.uploaded` event
- Receives Video Indexer webhooks
- Emits `interview.transcribed` event

### ai-analyzer-service (NestJS)
Event-driven - no HTTP API needed initially.
- Listens to `interview.transcribed` event
- Emits `analysis.completed` event

### notification-service (NestJS)
Event-driven only.
- Listens to `analysis.completed` event
- Sends emails/notifications

## Events (Redis Streams)

See `events.md` for event schemas.

## Notes

- Start with minimal endpoints
- Add more as we discover what the UI needs
- Internal services communicate via events, not HTTP (mostly)
- Next.js is the only public-facing API
- Use NestJS Swagger to auto-generate docs as we build
