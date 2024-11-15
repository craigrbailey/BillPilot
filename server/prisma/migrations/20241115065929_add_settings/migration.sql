-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "discordWebhook" TEXT,
ADD COLUMN     "notifyDaysBefore" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "notifyOnDue" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notifyOnPayment" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "pushbulletToken" TEXT,
ADD COLUMN     "pushoverToken" TEXT,
ADD COLUMN     "pushoverUser" TEXT;
