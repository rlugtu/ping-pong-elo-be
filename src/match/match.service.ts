import { Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dto/create-match.dto'
import { JoinMatchDto, UpdateMatchDto } from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { UsersService } from 'src/users/users.service'
import { TeamService } from 'src/team/team.service'
import { Match } from '@prisma/client'

@Injectable()
export class MatchService {
    constructor(
        private prisma: PrismaService,
        private userService: UsersService,
        private teamService: TeamService,
    ) {}

    async create(createMatchDto: CreateMatchDto) {
        const teamToJoin = await this.teamService.findOrCreateTeam(createMatchDto.teamA)

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
            include: {
                teamA: {
                    include: {
                        users: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                teamB: {
                    include: {
                        users: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
            },
        })

        const formattedLobbies = lobbies.map((lobby) => {
            return {
                ...lobby,
                teamA: {
                    ...lobby.teamA,
                    users: lobby.teamA.users.map((user) => user.user),
                },
                teamB: {
                    ...lobby.teamB,
                    users: lobby.teamB?.users.map((user) => user.user) ?? [],
                },
            }
        })

        return formattedLobbies
    }

    async getUserCurrentMatches(token: string): Promise<Match[]> {
        const user = await this.prisma.user.findFirst({
            where: {
                accessToken: token,
            },
        })

        const matches = await this.prisma.match.findMany({
            where: {
                state: 'IN_PROGRESS',
                teamA: {
                    users: {
                        some: {
                            userId: user.id,
                        },
                    },
                },
                teamB: {
                    users: {
                        some: {
                            userId: user.id,
                        },
                    },
                },
            },
        })

        return matches
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
        const teamToJoin = await this.teamService.findOrCreateTeam(joinMatchDto.teamB)

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
                state: 'IN_PROGRESS',
            },
        })
    }

    remove(id: number) {
        return `This action removes a #${id} match`
    }
}
