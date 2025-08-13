-- CreateTable
CREATE TABLE "public"."Document" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "pageCount" INTEGER NOT NULL,
    "wrappedKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);
