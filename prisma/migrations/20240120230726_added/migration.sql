/*
  Warnings:

  - A unique constraint covering the columns `[teamId,matchId]` on the table `TeamScore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TeamScore_teamId_matchId_key" ON "TeamScore"("teamId", "matchId");
