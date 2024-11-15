-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "frequency" TEXT NOT NULL DEFAULT 'ONE_TIME',
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "parentId" INTEGER;

-- AlterTable
ALTER TABLE "Income" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "parentId" INTEGER;
