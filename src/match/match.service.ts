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
        // finds all teams that players in included in
        const userTeams = await this.prisma.team.findMany({
            include: {
                users: {
                    where: {
                        userId: { in: createMatchDto.teamA },
                    },
                },
            },
        })

        // check if the team already exists
        const foundTeam = userTeams.filter((team) => {
            const sameLength = team.users.length === createMatchDto.teamA.length

            const samePlayers = team.users.every((user) => {
                return createMatchDto.teamA.includes(user.userId)
            })

            return sameLength && samePlayers
        })

        const teamToAdd =
            foundTeam.length === 1
                ? foundTeam[0]
                : await this.prisma.team.create({
                      data: {
                          users: {
                              create: createMatchDto.teamA.map((userId) => {
                                  return {
                                      user: {
                                          connect: { id: userId },
                                      },
                                  }
                              }),
                          },
                      },
                  })

        return this.prisma.match.create({
            data: {
                ...createMatchDto,
                teamA: {
                    connect: {
                        id: teamToAdd.id,
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
