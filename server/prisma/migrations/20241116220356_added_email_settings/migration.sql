-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "emailBillUpdates" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailHost" TEXT,
ADD COLUMN     "emailPass" TEXT,
ADD COLUMN     "emailPort" INTEGER,
ADD COLUMN     "emailSecure" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailSummaryEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "emailSummaryFrequency" TEXT,
ADD COLUMN     "emailUser" TEXT;
