/*
  Warnings:

  - The primary key for the `MatchScoreCard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[matchId,reportingTeamId]` on the table `MatchScoreCard` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `MatchScoreCard` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "MatchScoreCard" DROP CONSTRAINT "MatchScoreCard_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "MatchScoreCard_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "MatchScoreCard_matchId_reportingTeamId_key" ON "MatchScoreCard"("matchId", "reportingTeamId");
