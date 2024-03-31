/*
  Warnings:

  - You are about to drop the column `losingTeamId` on the `MatchScoreCard` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `MatchScoreCard` table. All the data in the column will be lost.
  - You are about to drop the column `winningTeamId` on the `MatchScoreCard` table. All the data in the column will be lost.
  - Added the required column `reportingTeamId` to the `MatchScoreCard` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MatchScoreCard" DROP CONSTRAINT "MatchScoreCard_losingTeamId_fkey";

-- DropForeignKey
ALTER TABLE "MatchScoreCard" DROP CONSTRAINT "MatchScoreCard_teamId_fkey";

-- DropForeignKey
ALTER TABLE "MatchScoreCard" DROP CONSTRAINT "MatchScoreCard_winningTeamId_fkey";

-- AlterTable
ALTER TABLE "MatchScoreCard" DROP COLUMN "losingTeamId",
DROP COLUMN "teamId",
DROP COLUMN "winningTeamId",
ADD COLUMN     "reportingTeamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MatchScoreCard" ADD CONSTRAINT "MatchScoreCard_reportingTeamId_fkey" FOREIGN KEY ("reportingTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
