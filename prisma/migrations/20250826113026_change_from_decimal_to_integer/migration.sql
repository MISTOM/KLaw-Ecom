/*
  Warnings:

  - You are about to alter the column `amount` on the `Payment` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `discountValue` on the `Promotion` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.
  - You are about to alter the column `price` on the `SubscriptionPlan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Integer`.

*/
-- AlterTable
ALTER TABLE "public"."Payment" ALTER COLUMN "amount" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."Promotion" ALTER COLUMN "discountValue" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "public"."SubscriptionPlan" ALTER COLUMN "price" SET DATA TYPE INTEGER;
