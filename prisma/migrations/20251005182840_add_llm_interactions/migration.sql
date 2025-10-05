-- CreateTable
CREATE TABLE "llm_interactions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_interactions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "llm_interactions" ADD CONSTRAINT "llm_interactions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
