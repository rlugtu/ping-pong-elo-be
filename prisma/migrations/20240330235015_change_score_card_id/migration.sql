/*
  Warnings:

  - The primary key for the `MatchScoreCard` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `MatchScoreCard` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MatchScoreCard" DROP CONSTRAINT "MatchScoreCard_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "MatchScoreCard_pkey" PRIMARY KEY ("matchId", "reportingTeamId");
