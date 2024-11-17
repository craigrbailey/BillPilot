/*
  Warnings:

  - You are about to drop the column `balance` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `isRecurring` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfMonth` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `parentId` on the `Income` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `discordWebhook` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailBillUpdates` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailEnabled` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailHost` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailPass` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailPort` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailSecure` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailSummaryEnabled` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailSummaryFrequency` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `emailUser` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `pushbulletToken` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `pushoverToken` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the column `pushoverUser` on the `Settings` table. All the data in the column will be lost.
  - You are about to drop the `EmailRecipient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `frequency` on the `Income` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "EmailRecipient" DROP CONSTRAINT "EmailRecipient_settingsId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_billId_fkey";

-- DropIndex
DROP INDEX "Category_name_key";

-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "balance",
DROP COLUMN "frequency",
DROP COLUMN "isRecurring",
DROP COLUMN "notes",
DROP COLUMN "parentId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "isOneTime" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "userId" INTEGER NOT NULL,
ALTER COLUMN "color" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Income" DROP COLUMN "dayOfMonth",
DROP COLUMN "dayOfWeek",
DROP COLUMN "notes",
DROP COLUMN "parentId",
DROP COLUMN "frequency",
ADD COLUMN     "frequency" TEXT NOT NULL,
ALTER COLUMN "isRecurring" SET DEFAULT true;

-- AlterTable
ALTER TABLE "Session" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Settings" DROP COLUMN "discordWebhook",
DROP COLUMN "emailBillUpdates",
DROP COLUMN "emailEnabled",
DROP COLUMN "emailHost",
DROP COLUMN "emailPass",
DROP COLUMN "emailPort",
DROP COLUMN "emailSecure",
DROP COLUMN "emailSummaryEnabled",
DROP COLUMN "emailSummaryFrequency",
DROP COLUMN "emailUser",
DROP COLUMN "pushbulletToken",
DROP COLUMN "pushoverToken",
DROP COLUMN "pushoverUser";

-- DropTable
DROP TABLE "EmailRecipient";

-- DropTable
DROP TABLE "Payment";

-- DropEnum
DROP TYPE "IncomeFrequency";

-- CreateTable
CREATE TABLE "BillHistory" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BillHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BillHistory" ADD CONSTRAINT "BillHistory_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
