/*
  Warnings:

  - Made the column `author` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `pageCount` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `publicationDate` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "author" SET NOT NULL,
ALTER COLUMN "pageCount" SET NOT NULL,
ALTER COLUMN "publicationDate" SET NOT NULL;

-- AlterTable
ALTER TABLE "_ProductCategory" ADD CONSTRAINT "_ProductCategory_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProductCategory_AB_unique";
