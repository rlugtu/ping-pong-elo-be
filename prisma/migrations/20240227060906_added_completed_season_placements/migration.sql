/*
  Warnings:

  - Made the column `seasonId` on table `Match` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_seasonId_fkey";

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "seasonId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "completedSeasonPlacements" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
