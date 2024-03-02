-- AlterTable
ALTER TABLE "Elo" ADD COLUMN     "matchId" TEXT;

-- AddForeignKey
ALTER TABLE "Elo" ADD CONSTRAINT "Elo_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
