import { Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dto/create-match.dto'
import { UpdateMatchDto } from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'

@Injectable()
export class MatchService {
    constructor(private prisma: PrismaService) {}

    create(createMatchDto: CreateMatchDto) {
        return this.prisma.match.create({
            data: createMatchDto,
        })
    }

    findAll() {
        return `This action returns all match`
    }

    findOne(id: number) {
        return `This action returns a #${id} match`
    }

    update(id: number, updateMatchDto: UpdateMatchDto) {
        return `This action updates a #${id} match`
    }

    remove(id: number) {
        return `This action removes a #${id} match`
    }
}
