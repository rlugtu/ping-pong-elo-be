/*
  Warnings:

  - Added the required column `mode` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchMode" AS ENUM ('SINGLES', 'DOUBLES');

-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "mode" "MatchMode" NOT NULL;
