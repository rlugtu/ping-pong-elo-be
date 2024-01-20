import { Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaService } from 'src/prisma/prisma.service'
import { TeamService } from 'src/team/team.service'

@Module({
    controllers: [UsersController],
    providers: [UsersService, PrismaService, TeamService],
})
export class UsersModule {}
