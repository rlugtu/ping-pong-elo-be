/*
  Warnings:

  - Added the required column `losingTeamId` to the `MatchScoreCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winningTeamId` to the `MatchScoreCard` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MatchScoreCard" ADD COLUMN     "losingTeamId" TEXT NOT NULL,
ADD COLUMN     "winningTeamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "MatchScoreCard" ADD CONSTRAINT "MatchScoreCard_winningTeamId_fkey" FOREIGN KEY ("winningTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreCard" ADD CONSTRAINT "MatchScoreCard_losingTeamId_fkey" FOREIGN KEY ("losingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
