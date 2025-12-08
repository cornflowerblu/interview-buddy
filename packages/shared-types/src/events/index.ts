/**
 * Event Payload Types for Interview Buddy
 *
 * These events are published to Redis Streams and consumed by microservices
 * to orchestrate the interview processing pipeline.
 */

/**
 * Event emitted when an interview recording is successfully uploaded to Azure Blob Storage
 *
 * Consumed by: processor-service
 * Published by: upload-service
 */
export interface InterviewUploadedEvent {
  interviewId: string;
  userId: string;
  blobUrl: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
}

/**
 * Event emitted when Azure Media Services completes transcription of an interview
 *
 * Consumed by: ai-analyzer-service
 * Published by: processor-service
 */
export interface InterviewTranscribedEvent {
  interviewId: string;
  userId: string;
  transcriptionId: string;
  transcription: string;
  confidence: number;
  duration: number;
  transcribedAt: Date;
}

/**
 * Event emitted when AI analysis of an interview is completed
 *
 * Consumed by: notification-service, web (via WebSocket/SSE)
 * Published by: ai-analyzer-service
 */
export interface AnalysisCompletedEvent {
  interviewId: string;
  userId: string;
  analysisId: string;
  overallScore: number;
  completedAt: Date;
}

/**
 * Event emitted when processing fails at any stage
 *
 * Consumed by: notification-service, web (via WebSocket/SSE)
 * Published by: any service
 */
export interface ProcessingFailedEvent {
  interviewId: string;
  userId: string;
  stage: 'upload' | 'transcription' | 'analysis';
  error: string;
  failedAt: Date;
}

/**
 * Union type of all event types for type-safe event handling
 */
export type InterviewEvent =
  | InterviewUploadedEvent
  | InterviewTranscribedEvent
  | AnalysisCompletedEvent
  | ProcessingFailedEvent;

/**
 * Event names as string literals for Redis Stream topic names
 */
export const EventNames = {
  INTERVIEW_UPLOADED: 'interview.uploaded',
  INTERVIEW_TRANSCRIBED: 'interview.transcribed',
  ANALYSIS_COMPLETED: 'analysis.completed',
  PROCESSING_FAILED: 'processing.failed',
} as const;

export type EventName = (typeof EventNames)[keyof typeof EventNames];
