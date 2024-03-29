import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UsersModule } from './users/users.module'
import { MatchModule } from './match/match.module'
import { PrismaService } from './prisma/prisma.service'
import { TeamModule } from './team/team.module'
import { MatchWebSocketGateway } from './match-web-socket/match-web-socket.gateway'
import { SeasonModule } from './season/season.module';

@Module({
  imports: [UsersModule, MatchModule, TeamModule, SeasonModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, MatchWebSocketGateway],
})
export class AppModule { }
