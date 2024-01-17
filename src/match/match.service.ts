import { Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dto/create-match.dto'
import { JoinMatchDto, UpdateMatchDto } from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { UsersService } from 'src/users/users.service'
import { join } from 'path'

@Injectable()
export class MatchService {
    constructor(
        private prisma: PrismaService,
        private userService: UsersService,
    ) {}

    create(createMatchDto: CreateMatchDto) {
        return this.prisma.match.create({
            data: createMatchDto,
        })
    }
    async getAllOpenLobbies() {
        const matches = await this.prisma.match.findMany({
            where: {
                state: 'SETUP',
            },
        })
        const lobbies = matches.map(async (match) => {
            return {
                id: match.id,
                sideA: [
                    {
                        ...(await this.userService.findPlayerInfoById(match.sideA[0])),
                    },
                ],
                sideB: [{}],
                winningScore: match.winningScore,
            }
        })
        return await Promise.all(lobbies)
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

    async joinMatch(id: string, joinMatchDto: JoinMatchDto) {
        const res = await this.prisma.match.update({
            where: {
                id,
            },
            data: {
                ...joinMatchDto,
                state: 'IN_PROGRESS',
            },
        })
        console.log({ res })
        return res
    }

    remove(id: number) {
        return `This action removes a #${id} match`
    }
}
