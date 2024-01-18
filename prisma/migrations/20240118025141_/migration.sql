/*
  Warnings:

  - You are about to drop the column `sideA` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `sideAScore` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `sideB` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `sideBScore` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `winner` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `elo` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `teamAId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teamBId` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "sideA",
DROP COLUMN "sideAScore",
DROP COLUMN "sideB",
DROP COLUMN "sideBScore",
DROP COLUMN "winner",
ADD COLUMN     "teamAId" TEXT NOT NULL,
ADD COLUMN     "teamBId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "elo",
ADD COLUMN     "currentElo" INTEGER NOT NULL DEFAULT 1400;

-- DropEnum
DROP TYPE "WinnerSide";

-- CreateTable
CREATE TABLE "Elo" (
    "id" TEXT NOT NULL,
    "elo" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Elo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTeams" (
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "UserTeams_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamScore" (
    "id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "teamId" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,

    CONSTRAINT "TeamScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTeams_userId_key" ON "UserTeams"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserTeams_teamId_key" ON "UserTeams"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamScore_teamId_key" ON "TeamScore"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- AddForeignKey
ALTER TABLE "Elo" ADD CONSTRAINT "Elo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeams" ADD CONSTRAINT "UserTeams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeams" ADD CONSTRAINT "UserTeams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamScore" ADD CONSTRAINT "TeamScore_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamAId_fkey" FOREIGN KEY ("teamAId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
