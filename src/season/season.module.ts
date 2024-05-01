import { Module } from '@nestjs/common';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { TeamService } from 'src/team/team.service';

@Module({
  controllers: [SeasonController],
  providers: [SeasonService, PrismaService, TeamService],
})
export class SeasonModule { }
