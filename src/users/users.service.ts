import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { plainToClass } from 'class-transformer'
import { UserEntity } from './entities/user.entity'
import { getTeamCurrentElo } from 'src/utils/team'
import { formatTeamUsers } from 'src/utils/match'
import { Team } from 'src/team/entities/team.entity'

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async create(createUserDto: CreateUserDto, accessToken: string) {
        const user = await this.prisma.user.create({
            data: { ...createUserDto, accessToken },
        })

        this.prisma.team.create({
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
                        elo: 1400,
                    },
                },
            },
        })

        return user
    }

    findAll() {
        return `This action returns all users`
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
                                eloHistory: true,
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

        const duoTeams = user.teams.filter((team) => {
            return team.team.users.length > 1
        })
        const formattedDuoTeams = duoTeams.map((team) => {
            return plainToClass(Team, {
                ...formatTeamUsers(team.team),
                elo: getTeamCurrentElo(team.team),
            })
        })

        const res = plainToClass(UserEntity, { ...user, elo: soloElo, teams: formattedDuoTeams })

        return res
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`
    }

    remove(id: number) {
        return `This action removes a #${id} user`
    }
}
