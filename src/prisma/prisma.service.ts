import { Injectable, OnModuleInit } from '@nestjs/common'
import { PrismaClient, Team } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient {
    async onModuleInit() {
        await this.$connect()
    }
    async findOrCreateTeam(userIds: string[]): Promise<Team> {
        // find teams associated with every user
        const userTeams = await this.team.findMany({
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
            return await this.team.create({
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
