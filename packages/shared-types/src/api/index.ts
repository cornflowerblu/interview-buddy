/**
 * API Contract Types for Interview Buddy
 *
 * These types define the request/response contracts between the Next.js API Gateway
 * and the NestJS microservices, as well as between frontend and backend.
 */

/**
 * Interview Upload Request
 *
 * Sent from frontend to initiate a resumable upload session
 */
export interface CreateUploadRequest {
  fileName: string;
  fileSize: number;
  mimeType: string;
  company: string;
  jobTitle: string;
  interviewType: 'behavioral' | 'technical' | 'phone' | 'panel';
  jobDescription?: string;
  notes?: string;
  prepSessionId?: string;
}

/**
 * Interview Upload Response
 *
 * Returns upload URL and metadata for resumable upload
 */
export interface CreateUploadResponse {
  interviewId: string;
  uploadId: string;
  uploadUrl: string;
  expiresAt: string;
}

/**
 * Upload Progress Update Request
 *
 * Sent from upload-service to update interview status during upload
 */
export interface UpdateUploadProgressRequest {
  interviewId: string;
  bytesUploaded: number;
  status: 'uploading' | 'uploaded' | 'failed';
}

/**
 * Interview Metadata Update Request
 *
 * Allows users to update interview details after upload
 */
export interface UpdateInterviewRequest {
  company?: string;
  jobTitle?: string;
  interviewType?: 'behavioral' | 'technical' | 'phone' | 'panel';
  jobDescription?: string;
  notes?: string;
  prepSessionId?: string;
}

/**
 * Interview Status Response
 *
 * Real-time status of an interview during processing
 */
export interface InterviewStatusResponse {
  id: string;
  userId: string;
  status:
    | 'uploading'
    | 'uploaded'
    | 'transcribing'
    | 'analyzing'
    | 'completed'
    | 'failed';
  company: string;
  jobTitle: string;
  interviewType: string;
  uploadedAt: string;
  estimatedCompletionTime?: string;
  error?: string;
}

/**
 * Interview Details Response
 *
 * Full interview details with all metadata
 */
export interface InterviewDetailsResponse {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  interviewType: string;
  jobDescription?: string;
  notes?: string;
  status: string;
  fileSize: number;
  duration?: number;
  createdAt: string;
  updatedAt: string;
  transcription?: TranscriptionResponse;
  analysis?: AnalysisResponse;
}

/**
 * Transcription Response
 *
 * Interview transcription with timestamps
 */
export interface TranscriptionResponse {
  id: string;
  text: string;
  confidence: number;
  language: string;
  segments: TranscriptSegmentResponse[];
  createdAt: string;
}

/**
 * Transcript Segment Response
 *
 * Individual segment of transcription with timing
 */
export interface TranscriptSegmentResponse {
  start: number;
  end: number;
  text: string;
}

/**
 * Analysis Response
 *
 * AI-powered analysis results
 */
export interface AnalysisResponse {
  id: string;
  overallScore: number;
  speechMetrics: SpeechMetricsResponse;
  contentMetrics: ContentMetricsResponse;
  sentimentMetrics: SentimentMetricsResponse;
  recommendations: string[];
  comparisonMetrics?: ComparisonMetricsResponse;
  createdAt: string;
}

/**
 * Speech Metrics Response
 *
 * Analysis of speaking patterns
 */
export interface SpeechMetricsResponse {
  fillerWords: FillerWordResponse[];
  speakingPace: number;
  pauseCount: number;
  clarityScore: number;
}

/**
 * Filler Word Response
 */
export interface FillerWordResponse {
  word: string;
  count: number;
}

/**
 * Content Metrics Response
 *
 * Analysis of answer quality and structure
 */
export interface ContentMetricsResponse {
  starMethodUsage: StarMethodResponse[];
  answerRelevance: number;
}

/**
 * STAR Method Analysis Response
 */
export interface StarMethodResponse {
  question: string;
  hasSTAR: boolean;
  score: number;
}

/**
 * Sentiment Metrics Response
 *
 * Analysis of emotional tone and confidence
 */
export interface SentimentMetricsResponse {
  overallSentiment: 'positive' | 'neutral' | 'negative';
  confidenceLevel: number;
  enthusiasmScore: number;
  timeline: SentimentPointResponse[];
}

/**
 * Sentiment Point Response
 */
export interface SentimentPointResponse {
  timestamp: number;
  sentiment: number;
}

/**
 * Comparison Metrics Response
 *
 * Comparison between prep session and actual interview
 */
export interface ComparisonMetricsResponse {
  questionsMatched: number;
  questionsUnexpected: number;
  improvementScore: number;
  deviations: AnswerDeviationResponse[];
}

/**
 * Answer Deviation Response
 */
export interface AnswerDeviationResponse {
  question: string;
  prepAnswer: string;
  actualAnswer: string;
  delta: number;
}

/**
 * List Interviews Request
 *
 * Query parameters for listing user's interviews
 */
export interface ListInterviewsRequest {
  page?: number;
  limit?: number;
  status?:
    | 'uploading'
    | 'uploaded'
    | 'transcribing'
    | 'analyzing'
    | 'completed'
    | 'failed';
  company?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'company';
  sortOrder?: 'asc' | 'desc';
}

/**
 * List Interviews Response
 *
 * Paginated list of interviews
 */
export interface ListInterviewsResponse {
  interviews: InterviewStatusResponse[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Error Response
 * 
 * Standard error response format with distributed tracing support
 */
export interface ErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
  correlationId: string; // For distributed tracing across microservices
  path?: string;
  details?: Record<string, any>;
}

/**
 * Health Check Response
 *
 * Service health status for monitoring
 */
export interface HealthCheckResponse {
  status: 'ok' | 'degraded' | 'down';
  service: string;
  version: string;
  uptime: number;
  dependencies?: {
    [key: string]: {
      status: 'ok' | 'degraded' | 'down';
      latency?: number;
      error?: string;
    };
  };
}
