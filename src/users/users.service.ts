import { Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { plainToClass } from 'class-transformer'
import { UserEntity } from './entities/user.entity'
import { flattenPrismaTeamUsers, getTeamCurrentElo } from 'src/utils/team'
import { Team } from 'src/team/entities/team.entity'
import { STARTING_ELO } from 'src/elo-config'

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

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
            console.log('New User Found. Creating Solo Team')
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
                ...flattenPrismaTeamUsers(team.team),
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
