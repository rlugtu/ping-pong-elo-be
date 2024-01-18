import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { MatchModule } from './match/match.module'
import { PrismaService } from './prisma/prisma.service'
import { TeamModule } from './team/team.module';

@Module({
    imports: [UsersModule, MatchModule, TeamModule],
    controllers: [AppController],
    providers: [AppService, PrismaService],
})
export class AppModule {}
