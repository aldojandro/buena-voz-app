-- CreateTable
CREATE TABLE "CandidateInsights" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "overview" JSONB NOT NULL,
    "patterns" JSONB NOT NULL,
    "detailLevels" JSONB NOT NULL,
    "score" JSONB NOT NULL,

    CONSTRAINT "CandidateInsights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicClassification" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "categories" JSONB NOT NULL,

    CONSTRAINT "TopicClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProposalSummary" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "typologies" JSONB NOT NULL,
    "metrics" JSONB NOT NULL,
    "economicFocus" TEXT,

    CONSTRAINT "ProposalSummary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_metrics" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "detailHigh" INTEGER NOT NULL,
    "detailMedium" INTEGER NOT NULL,
    "detailLow" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thematic_classifications" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "examples" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "thematic_classifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_typologies" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "typology" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "examples" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposal_typologies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandidateInsights_candidateId_documentId_key" ON "CandidateInsights"("candidateId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "TopicClassification_candidateId_documentId_key" ON "TopicClassification"("candidateId", "documentId");

-- CreateIndex
CREATE UNIQUE INDEX "ProposalSummary_candidateId_documentId_key" ON "ProposalSummary"("candidateId", "documentId");

-- AddForeignKey
ALTER TABLE "CandidateInsights" ADD CONSTRAINT "CandidateInsights_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateInsights" ADD CONSTRAINT "CandidateInsights_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicClassification" ADD CONSTRAINT "TopicClassification_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicClassification" ADD CONSTRAINT "TopicClassification_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalSummary" ADD CONSTRAINT "ProposalSummary_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProposalSummary" ADD CONSTRAINT "ProposalSummary_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_metrics" ADD CONSTRAINT "candidate_metrics_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_metrics" ADD CONSTRAINT "candidate_metrics_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thematic_classifications" ADD CONSTRAINT "thematic_classifications_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thematic_classifications" ADD CONSTRAINT "thematic_classifications_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_typologies" ADD CONSTRAINT "proposal_typologies_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposal_typologies" ADD CONSTRAINT "proposal_typologies_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
