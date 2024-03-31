-- DropForeignKey
ALTER TABLE "MatchScoreCard" DROP CONSTRAINT "MatchScoreCard_reportingTeamId_fkey";

-- AddForeignKey
ALTER TABLE "MatchScoreCard" ADD CONSTRAINT "MatchScoreCard_reportingTeamId_fkey" FOREIGN KEY ("reportingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
