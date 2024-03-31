-- DropForeignKey
ALTER TABLE "MatchScoreCard" DROP CONSTRAINT "MatchScoreCard_reportingTeamId_fkey";

-- DropIndex
DROP INDEX "MatchScoreCard_matchId_reportingTeamId_key";

-- AddForeignKey
ALTER TABLE "MatchScoreCard" ADD CONSTRAINT "MatchScoreCard_reportingTeamId_fkey" FOREIGN KEY ("reportingTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
