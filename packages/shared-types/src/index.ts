// Export event types
export * from './events';

// Export API contract types
export * from './api';

// Interview Upload Status
export type InterviewUploadStatus =
  | "uploading"
  | "uploaded"
  | "transcribing"
  | "analyzing"
  | "completed"
  | "failed";

// Interview Type
export type InterviewType = "behavioral" | "technical" | "phone" | "panel";

// Interview Entity (aligned with Prisma schema)
export interface Interview {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  interviewType: InterviewType;
  notes?: string;
  status: InterviewUploadStatus;
  videoIndexerUrl?: string; // Azure Video Indexer asset URL (null during upload)
  prepSessionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Transcription Entity (aligned with Prisma schema)
export interface Transcription {
  id: string;
  interviewId: string;
  text: string;
  timestamps: TranscriptSegment[]; // Stored as JSON in Prisma
  speakers?: SpeakerDiarization[]; // Speaker diarization data (stored as JSON in Prisma)
  language: string;
  confidence?: number; // Overall transcription confidence (0-1)
  createdAt: Date;
}

export interface TranscriptSegment {
  text: string;
  start: string; // ISO duration or timestamp
  end: string; // ISO duration or timestamp
  confidence: number;
}

export interface SpeakerDiarization {
  id: string;
  name?: string;
  instances: SpeakerInstance[];
}

export interface SpeakerInstance {
  start: string;
  end: string;
}

// Analysis Entity (aligned with Prisma schema - uses JSON fields)
export interface Analysis {
  id: string;
  interviewId: string;
  
  // Analysis results (stored as JSON in Prisma for schema flexibility)
  speechMetrics: SpeechMetrics;
  contentAnalysis: ContentAnalysis;
  sentiment: SentimentAnalysis;

  // Overall metrics
  overallScore: number; // Composite score 0-100
  recommendations: string[]; // Actionable improvement suggestions (stored as JSON)

  // Metadata
  modelUsed: string; // Track which AI model generated this (e.g., "gpt-4o", "claude-3.5-sonnet")
  
  createdAt: Date;
}

// Speech Metrics (part of Analysis.speechMetrics JSON field)
export interface SpeechMetrics {
  fillerWords: number;
  fillerWordsList: string[];
  speakingPace: number; // words per minute
  pauseCount: number;
  clarity: number; // 0-100 score
}

// Content Analysis (part of Analysis.contentAnalysis JSON field)
export interface ContentAnalysis {
  starMethod: boolean; // Whether STAR method was used
  relevance: number; // 0-100 score
  structureScore: number; // 0-100 score
  keyPoints: string[];
}

// Sentiment Analysis (part of Analysis.sentiment JSON field)
export interface SentimentAnalysis {
  overall: string; // "positive" | "neutral" | "negative"
  confidence: number; // 0-1
  enthusiasm: number; // 0-100
  timeline: SentimentTimelinePoint[];
}

export interface SentimentTimelinePoint {
  time: string; // ISO timestamp or duration
  sentiment: string; // "positive" | "neutral" | "negative"
}



// Prep Session Entity (aligned with Prisma schema)
export interface PrepSession {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  jobDescription?: string;
  questions: PrepQuestion[]; // Stored as JSON in Prisma
  practiceAnswers: PracticeAnswer[]; // Stored as JSON in Prisma
  createdAt: Date;
  updatedAt: Date;
}

export interface PrepQuestion {
  id: string;
  question: string;
  category?: string; // e.g., "behavioral", "technical"
  difficulty?: string; // e.g., "easy", "medium", "hard"
}

export interface PracticeAnswer {
  questionId: string;
  answer: string;
  aiFeedback: string;
  score?: number; // 0-100 score from AI feedback
}

// User Entity (for reference - auth handled by Firebase)
export interface User {
  id: string; // Firebase UID
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}
