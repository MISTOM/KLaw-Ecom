-- CreateTable
CREATE TABLE "public"."ProductDocument" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL DEFAULT 'application/pdf',
    "sizeBytes" INTEGER NOT NULL,
    "checksumSha256" TEXT,
    "pageCount" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 999,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductDocument_productId_idx" ON "public"."ProductDocument"("productId");

-- CreateIndex
CREATE INDEX "ProductDocument_isPublished_idx" ON "public"."ProductDocument"("isPublished");

-- CreateIndex
CREATE UNIQUE INDEX "ProductDocument_productId_storedName_key" ON "public"."ProductDocument"("productId", "storedName");

-- AddForeignKey
ALTER TABLE "public"."ProductDocument" ADD CONSTRAINT "ProductDocument_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
