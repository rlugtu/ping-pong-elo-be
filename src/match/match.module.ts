import { Module } from '@nestjs/common'
import { MatchService } from './match.service'
import { MatchController } from './match.controller'
import { PrismaService } from 'src/prisma/prisma.service'
import { UsersService } from 'src/users/users.service'

@Module({
    controllers: [MatchController],
    providers: [MatchService, PrismaService, UsersService],
})
export class MatchModule {}
