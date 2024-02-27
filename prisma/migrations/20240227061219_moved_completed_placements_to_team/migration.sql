/*
  Warnings:

  - You are about to drop the column `completedSeasonPlacements` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Team" ADD COLUMN     "completedSeasonPlacements" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "completedSeasonPlacements";
