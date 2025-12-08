# Event Schemas

**Status**: Minimal - expand as needed
**Last Updated**: 2025-12-08

Event payloads for Redis Streams communication between services.

## Event Flow

```
interview.uploaded → processor-service
                  ↓
       interview.transcribed → ai-analyzer-service
                           ↓
                analysis.completed → notification-service
```

## Events

### interview.uploaded

Emitted by: upload-service
Consumed by: processor-service

```typescript
{
  interviewId: string;
  userId: string;
  videoIndexerUrl: string; // Video Indexer video ID or SAS URL
  metadata: {
    company: string;
    jobTitle: string;
    interviewType: string;
  };
  timestamp: Date;
}
```

### interview.transcribed

Emitted by: processor-service
Consumed by: ai-analyzer-service

```typescript
{
  interviewId: string;
  userId: string;
  transcriptionId: string;
  // Include raw Video Indexer insights for AI analyzer to use
  videoIndexerInsights: any; // Keep flexible - Video Indexer schema may change
  timestamp: Date;
}
```

### analysis.completed

Emitted by: ai-analyzer-service
Consumed by: notification-service

```typescript
{
  interviewId: string;
  userId: string;
  analysisId: string;
  overallScore: number;
  timestamp: Date;
}
```

## Notes

- Keep event payloads lightweight
- Store bulk data in Postgres, reference by ID in events
- Add more events as we discover needs (e.g., `interview.failed`, `analysis.retry`)
- Event versioning: If we need to change schema, add `version` field
