/*
  Warnings:

  - A unique constraint covering the columns `[paymentReference]` on the table `Cart` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'PENDING_PAYMENT', 'COMPLETED');

-- AlterTable
ALTER TABLE "Cart" ADD COLUMN     "paymentReference" TEXT,
ADD COLUMN     "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX "Cart_paymentReference_key" ON "Cart"("paymentReference");
