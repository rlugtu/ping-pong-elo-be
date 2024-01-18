/*
  Warnings:

  - You are about to drop the column `userId` on the `Elo` table. All the data in the column will be lost.
  - Added the required column `teamId` to the `Elo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Elo" DROP CONSTRAINT "Elo_userId_fkey";

-- AlterTable
ALTER TABLE "Elo" DROP COLUMN "userId",
ADD COLUMN     "teamId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Elo" ADD CONSTRAINT "Elo_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
