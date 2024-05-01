import { Injectable } from '@nestjs/common';
import { CreateSeasonDto } from './dto/create-season.dto';
import { Season } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service'
import { TeamService } from 'src/team/team.service';

@Injectable()
export class SeasonService {
  constructor(
    private prisma: PrismaService,
    private teamService: TeamService
  ) {

  }
  async create(createSeasonDto: CreateSeasonDto): Promise<Season> {
    try {
      await this.teamService.resetAllTeamElos(createSeasonDto.teamSize)

      return await this.prisma.season.create({
        data: {
          name: createSeasonDto.name
        }
      })
    } catch (e) {
      console.log(e)
    }
  }




  remove(id: string) {
    return `This action removes a #${id} season`;
  }
}
