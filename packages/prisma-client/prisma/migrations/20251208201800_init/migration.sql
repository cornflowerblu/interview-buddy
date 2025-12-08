-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "interviewType" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL,
    "videoIndexerUrl" TEXT,
    "prepSessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transcription" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "timestamps" JSONB NOT NULL,
    "speakers" JSONB,
    "language" TEXT NOT NULL DEFAULT 'en-US',
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transcription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "speechMetrics" JSONB NOT NULL,
    "contentAnalysis" JSONB NOT NULL,
    "sentiment" JSONB NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "recommendations" JSONB NOT NULL,
    "modelUsed" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrepSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobDescription" TEXT,
    "questions" JSONB NOT NULL,
    "practiceAnswers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrepSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interview_userId_idx" ON "Interview"("userId");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE INDEX "Interview_createdAt_idx" ON "Interview"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Transcription_interviewId_key" ON "Transcription"("interviewId");

-- CreateIndex
CREATE INDEX "Transcription_interviewId_idx" ON "Transcription"("interviewId");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_interviewId_key" ON "Analysis"("interviewId");

-- CreateIndex
CREATE INDEX "Analysis_interviewId_idx" ON "Analysis"("interviewId");

-- CreateIndex
CREATE INDEX "PrepSession_userId_idx" ON "PrepSession"("userId");

-- CreateIndex
CREATE INDEX "PrepSession_createdAt_idx" ON "PrepSession"("createdAt");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_prepSessionId_fkey" FOREIGN KEY ("prepSessionId") REFERENCES "PrepSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transcription" ADD CONSTRAINT "Transcription_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

