-- CreateEnum
CREATE TYPE "OcrStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "documents" ADD COLUMN     "extractedText" TEXT,
ADD COLUMN     "ocrStatus" "OcrStatus" NOT NULL DEFAULT 'PENDING';
