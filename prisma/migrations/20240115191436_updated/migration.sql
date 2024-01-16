/*
  Warnings:

  - You are about to drop the column `created_at` on the `Match` table. All the data in the column will be lost.
  - Added the required column `createdAt` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sideAScore` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sideBScore` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `winningScore` to the `Match` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "created_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "sideAScore" INTEGER NOT NULL,
ADD COLUMN     "sideBScore" INTEGER NOT NULL,
ADD COLUMN     "winningScore" INTEGER NOT NULL;
