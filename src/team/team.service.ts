import { Injectable } from '@nestjs/common'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Team } from '@prisma/client'

@Injectable()
export class TeamService {
    constructor(private prisma: PrismaService) {}
    create(createTeamDto: CreateTeamDto) {
        return 'This action adds a new team'
    }

    findAll() {
        return `This action returns all team`
    }

    findOne(id: number) {
        return `This action returns a #${id} team`
    }

    update(id: number, updateTeamDto: UpdateTeamDto) {
        return `This action updates a #${id} team`
    }

    remove(id: number) {
        return `This action removes a #${id} team`
    }

    async findOrCreateTeam(userIds: string[]): Promise<Team> {
        // find teams associated with every user
        const userTeams = await this.prisma.team.findMany({
            include: {
                users: {
                    where: {
                        userId: { in: userIds },
                    },
                },
            },
        })

        // check if the team composition already exists
        const foundTeam = userTeams.filter((team) => {
            const samePlayers = team.users.every((user) => {
                return userIds.includes(user.userId)
            })

            return samePlayers
        })

        if (!foundTeam.length) {
            return await this.prisma.team.create({
                data: {
                    users: {
                        create: userIds.map((userId) => {
                            return {
                                user: {
                                    connect: { id: userId },
                                },
                            }
                        }),
                    },
                },
            })
        }

        if (foundTeam.length > 1) {
            // Temporary error just for development
            throw new Error('found more than one team for the associated ids')
        }

        return foundTeam[0]
    }
}
