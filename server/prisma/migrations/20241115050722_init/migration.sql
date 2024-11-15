-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "dayOfMonth" INTEGER,
ADD COLUMN     "dayOfWeek" INTEGER,
ADD COLUMN     "frequency" TEXT,
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false;
