-- AlterTable
ALTER TABLE "public"."ProductOnOrder" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "promotionId" INTEGER,
ADD COLUMN     "unitPrice" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "public"."ProductOnOrder" ADD CONSTRAINT "ProductOnOrder_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "public"."Promotion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
