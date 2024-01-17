-- AlterEnum
ALTER TYPE "MatchState" ADD VALUE 'SETUP';

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "state" SET DEFAULT 'SETUP';
