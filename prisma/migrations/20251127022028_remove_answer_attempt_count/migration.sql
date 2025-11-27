/*
  Warnings:

  - You are about to drop the column `attemptCount` on the `Answer` table. All the data in the column will be lost.
  - You are about to drop the column `timeTaken` on the `Answer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Answer" DROP COLUMN "attemptCount",
DROP COLUMN "timeTaken";
