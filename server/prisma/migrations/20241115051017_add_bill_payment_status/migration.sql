/*
  Warnings:

  - You are about to drop the column `dayOfMonth` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `dayOfWeek` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `frequency` on the `Bill` table. All the data in the column will be lost.
  - You are about to drop the column `isRecurring` on the `Bill` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bill" DROP COLUMN "dayOfMonth",
DROP COLUMN "dayOfWeek",
DROP COLUMN "frequency",
DROP COLUMN "isRecurring",
ADD COLUMN     "paidDate" TIMESTAMP(3);
