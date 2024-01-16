/*
  Warnings:

  - Added the required column `created_at` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchState" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "WinnerSide" AS ENUM ('sideA', 'sideB');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "state" "MatchState" NOT NULL DEFAULT 'IN_PROGRESS',
    "sideA" TEXT[],
    "sideB" TEXT[],
    "winner" "WinnerSide",
    "created_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);
