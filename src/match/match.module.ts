import { Module } from '@nestjs/common'
import { MatchService } from './match.service'
import { MatchController } from './match.controller'
import { PrismaService } from 'src/prisma/prisma.service'
import { UsersService } from 'src/users/users.service'
import { TeamService } from 'src/team/team.service'

@Module({
    controllers: [MatchController],
    providers: [MatchService, PrismaService, UsersService, TeamService],
    exports: [MatchService],
})
export class MatchModule {}
