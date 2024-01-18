-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_teamBId_fkey";

-- AlterTable
ALTER TABLE "Match" ALTER COLUMN "teamBId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_teamBId_fkey" FOREIGN KEY ("teamBId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
