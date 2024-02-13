-- DropForeignKey
ALTER TABLE "Elo" DROP CONSTRAINT "Elo_teamId_fkey";

-- DropForeignKey
ALTER TABLE "UserTeams" DROP CONSTRAINT "UserTeams_teamId_fkey";

-- DropForeignKey
ALTER TABLE "UserTeams" DROP CONSTRAINT "UserTeams_userId_fkey";

-- AddForeignKey
ALTER TABLE "Elo" ADD CONSTRAINT "Elo_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeams" ADD CONSTRAINT "UserTeams_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTeams" ADD CONSTRAINT "UserTeams_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
