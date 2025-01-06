/*
  Warnings:

  - You are about to drop the column `transactionId` on the `Order` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[billRefNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "transactionId",
ADD COLUMN     "billRefNumber" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_billRefNumber_key" ON "Order"("billRefNumber");
