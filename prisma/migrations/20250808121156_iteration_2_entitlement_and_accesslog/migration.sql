    -- CreateTable
CREATE TABLE "public"."Entitlement" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "documentId" INTEGER NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Entitlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."DocAccessLog" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "documentId" INTEGER NOT NULL,
    "page" INTEGER NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Entitlement_documentId_idx" ON "public"."Entitlement"("documentId");

-- CreateIndex
CREATE UNIQUE INDEX "Entitlement_userId_documentId_key" ON "public"."Entitlement"("userId", "documentId");

-- CreateIndex
CREATE INDEX "DocAccessLog_userId_idx" ON "public"."DocAccessLog"("userId");

-- CreateIndex
CREATE INDEX "DocAccessLog_documentId_page_idx" ON "public"."DocAccessLog"("documentId", "page");

-- AddForeignKey
ALTER TABLE "public"."Entitlement" ADD CONSTRAINT "Entitlement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Entitlement" ADD CONSTRAINT "Entitlement_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocAccessLog" ADD CONSTRAINT "DocAccessLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."DocAccessLog" ADD CONSTRAINT "DocAccessLog_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "public"."Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
