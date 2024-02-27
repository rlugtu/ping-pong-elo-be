import { Injectable } from '@nestjs/common';
import { CreateSeasonDto } from './dto/create-season.dto';
import { Season } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class SeasonService {
  constructor(
    private prisma: PrismaService,
  ) {

  }
  async create(createSeasonDto: CreateSeasonDto): Promise<Season> {
    try {
      return await this.prisma.season.create({
        data: createSeasonDto
      })
    } catch (e) {
      console.log(e)
    }
  }




  remove(id: string) {
    return `This action removes a #${id} season`;
  }
}
