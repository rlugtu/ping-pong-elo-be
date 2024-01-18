import { Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dto/create-match.dto'
import { JoinMatchDto, UpdateMatchDto } from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class MatchService {
    constructor(
        private prisma: PrismaService,
        private userService: UsersService,
    ) {}

    async create(createMatchDto: CreateMatchDto) {
        const teamToJoin = await this.prisma.findOrCreateTeam(createMatchDto.teamA)

        return this.prisma.match.create({
            data: {
                ...createMatchDto,
                teamA: {
                    connect: {
                        id: teamToJoin.id,
                    },
                },
            },
        })
    }

    async getAllOpenLobbies() {
        const lobbies = await this.prisma.match.findMany({
            where: {
                state: 'SETUP',
            },
        })

        return lobbies
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
        const teamToJoin = await this.prisma.findOrCreateTeam(joinMatchDto.teamB)

        return this.prisma.match.update({
            where: {
                id,
            },
            data: {
                teamB: {
                    connect: {
                        id: teamToJoin.id,
                    },
                },
            },
        })
    }

    remove(id: number) {
        return `This action removes a #${id} match`
    }
}
