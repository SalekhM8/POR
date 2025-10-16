-- CreateTable
CREATE TABLE "public"."AIChunk" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "embedding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIChunk_type_sourceId_idx" ON "public"."AIChunk"("type", "sourceId");
