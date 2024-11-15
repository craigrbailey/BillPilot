-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_billId_fkey";

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
