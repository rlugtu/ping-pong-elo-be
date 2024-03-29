import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { plainToClass } from 'class-transformer'
import { UserEntity } from './entities/user.entity'
import { getTeamCurrentElo } from 'src/utils/team'
import { Team } from 'src/team/entities/team.entity'
import { STARTING_ELO } from 'src/elo-config'
import { TeamService } from 'src/team/team.service'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private teamService: TeamService,
    ) {}

    async create(createUserDto: CreateUserDto) {
        const user = await this.prisma.user.upsert({
            where: {
                id: createUserDto.id,
            },
            update: {
                ...createUserDto,
                accessToken: '',
            },
            create: {
                ...createUserDto,
                accessToken: '',
            },
            include: {
                teams: true,
            },
        })

        if (user.teams && !user.teams.length) {
            await this.prisma.team.create({
                data: {
                    users: {
                        create: {
                            user: {
                                connect: {
                                    id: user.id,
                                },
                            },
                        },
                    },
                    eloHistory: {
                        create: {
                            elo: STARTING_ELO,
                        },
                    },
                },
            })
        }

        return user
    }

    async findAll() {
        const users = await this.prisma.user.findMany({
            include: {
                teams: {
                    include: {
                        team: {
                            include: {
                                eloHistory: {
                                    orderBy: {
                                        createdAt: 'desc',
                                    },
                                },
                                users: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })
        // const formatted = users.map((user) => {
        //     const soloTeam = user.teams.find((team) => {
        //         return team.team.users.length === 1
        //     })

        //     const soloElo = soloTeam.team.eloHistory[0].elo
        //     console.log(soloElo)
        //     return { ...user, elo: soloElo }
        // })

        return users
    }

    async getUserPerformanceSummary(id: string) {
        const user = await this.prisma.user.findFirstOrThrow({
            where: {
                id,
            },
            include: {
                teams: {
                    include: {
                        team: {
                            include: {
                                users: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        const soloTeam = user.teams.find((team) => {
            return team.team.users.length === 1
        })

        // FUTURE USE FOR TEAM SUPPORT
        // const pairedTeams = user.teams.find((team) => {
        //     return team.team.users.length > 1
        // })

        return this.teamService.getHeadToHeads(soloTeam.teamId)
    }

    async findOne(id: string): Promise<UserEntity> {
        const user = await this.prisma.user.findFirstOrThrow({
            where: {
                id,
            },
            include: {
                teams: {
                    include: {
                        team: {
                            include: {
                                eloHistory: {
                                    orderBy: {
                                        createdAt: 'desc',
                                    },
                                },
                                users: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        const soloTeam = user.teams.find((team) => {
            return team.team.users.length === 1
        })

        const soloElo = soloTeam.team.eloHistory[0].elo

        const formattedDuoTeams = user.teams.map((team) => {
            return plainToClass(Team, {
                ...team.team,
                elo: getTeamCurrentElo(team.team),
            })
        })

        const res = plainToClass(UserEntity, {
            ...user,
            elo: soloElo,
            teams: formattedDuoTeams,
            performanceSummary: await this.getUserPerformanceSummary(id),
        })

        return res
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`
    }

    remove(id: number) {
        return `This action removes a #${id} user`
    }
}
