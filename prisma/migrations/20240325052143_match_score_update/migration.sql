-- CreateTable
CREATE TABLE "MatchScoreCard" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "isWinner" BOOLEAN NOT NULL,
    "winningTeamScore" INTEGER NOT NULL,
    "winningTeamId" TEXT NOT NULL,
    "losingTeamScore" INTEGER NOT NULL,
    "losingTeamId" TEXT NOT NULL,
    "teamId" TEXT,

    CONSTRAINT "MatchScoreCard_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MatchScoreCard" ADD CONSTRAINT "MatchScoreCard_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreCard" ADD CONSTRAINT "MatchScoreCard_winningTeamId_fkey" FOREIGN KEY ("winningTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreCard" ADD CONSTRAINT "MatchScoreCard_losingTeamId_fkey" FOREIGN KEY ("losingTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchScoreCard" ADD CONSTRAINT "MatchScoreCard_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
