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

// Interview Entity
export interface Interview {
  id: string;
  userId: string;
  uploadId: string;
  company: string;
  jobTitle: string;
  interviewType: InterviewType;
  jobDescription?: string;
  notes?: string;
  status: InterviewUploadStatus;
  blobUrl: string;
  fileSize: number;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Transcription Entity
export interface Transcription {
  id: string;
  interviewId: string;
  text: string;
  timestamps: TranscriptSegment[];
  confidence: number;
  language: string;
  createdAt: Date;
}

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

// Analysis Entity
export interface Analysis {
  id: string;
  interviewId: string;
  transcriptionId: string;

  // Speech metrics
  fillerWords: FillerWord[];
  speakingPace: number;
  pauseCount: number;
  clarityScore: number;

  // Content metrics
  starMethodUsage: StarMethodAnalysis[];
  answerRelevance: number;

  // Sentiment
  overallSentiment: "positive" | "neutral" | "negative";
  confidenceLevel: number;
  enthusiasmScore: number;
  sentimentTimeline: SentimentPoint[];

  // Overall
  overallScore: number;
  recommendations: string[];

  // Comparison (if linked to prep)
  prepSessionId?: string;
  comparisonMetrics?: ComparisonMetrics;

  createdAt: Date;
}

export interface FillerWord {
  word: string;
  count: number;
}

export interface StarMethodAnalysis {
  question: string;
  hasSTAR: boolean;
  score: number;
}

export interface SentimentPoint {
  timestamp: number;
  sentiment: number;
}

export interface ComparisonMetrics {
  questionsMatched: number;
  questionsUnexpected: number;
  improvementScore: number;
  deviations: AnswerDeviation[];
}

export interface AnswerDeviation {
  question: string;
  prepAnswer: string;
  actualAnswer: string;
  delta: number;
}

// Prep Session Entity
export interface PrepSession {
  id: string;
  userId: string;
  company: string;
  jobTitle: string;
  jobDescription?: string;
  questions: PrepQuestion[];
  practiceAnswers: PracticeAnswer[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PrepQuestion {
  id: string;
  question: string;
  aiGenerated: boolean;
}

export interface PracticeAnswer {
  questionId: string;
  answer: string;
  aiFeedback: string;
}
