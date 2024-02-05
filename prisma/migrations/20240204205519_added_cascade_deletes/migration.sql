-- DropForeignKey
ALTER TABLE "TeamScore" DROP CONSTRAINT "TeamScore_matchId_fkey";

-- DropForeignKey
ALTER TABLE "TeamScore" DROP CONSTRAINT "TeamScore_teamId_fkey";

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
