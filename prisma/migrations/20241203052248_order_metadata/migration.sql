-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "description" TEXT,
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "transactionId" TEXT;
