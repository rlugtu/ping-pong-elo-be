/*
  Warnings:

  - A unique constraint covering the columns `[matchId,reportingTeamId]` on the table `MatchScoreCard` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MatchScoreCard_matchId_reportingTeamId_key" ON "MatchScoreCard"("matchId", "reportingTeamId");
