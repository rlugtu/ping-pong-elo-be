import { Module } from '@nestjs/common';
import { SeasonService } from './season.service';
import { SeasonController } from './season.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  controllers: [SeasonController],
  providers: [SeasonService, PrismaService],
})
export class SeasonModule { }
