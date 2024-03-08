import { Injectable } from '@nestjs/common'
import { CreateTeamDto } from './dto/create-team.dto'
import { UpdateTeamDto } from './dto/update-team.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { Team } from '@prisma/client'
import { Team as FormattedTeam, TeamPerformanceSummary } from './entities/team.entity'
import { plainToClass, plainToInstance } from 'class-transformer'
import { TeamQueryParams } from './dto/query-param.dto'
import { flattenPrismaTeamUsers } from 'src/utils/team'
import { STARTING_ELO } from 'src/elo-config'
import { TeamHeadToHeadRecord } from 'src/types/team'

@Injectable()
export class TeamService {
    constructor(private prisma: PrismaService) {}
    create(createTeamDto: CreateTeamDto) {
        return 'This action adds a new team'
    }

    async findAll(qp: TeamQueryParams) {
        const teams = await this.prisma.team.findMany({
            // ...(qp.limit && { take: qp.limit }),
            where: {
                completedSeasonPlacements: true,
            },
            include: {
                users: {
                    include: {
                        user: true,
                    },
                },
                eloHistory: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                },
            },
        })

        const filteredTeams = teams.filter((team) => {
            const teamSize = qp.matchMode === 'SINGLES' ? 1 : 2
            return team.users.length === teamSize
        })

        const flattenedUsers = filteredTeams
            .map((team) => {
                return plainToClass(FormattedTeam, {
                    ...team,
                    users: flattenPrismaTeamUsers(team),
                    elo: team.eloHistory[0].elo,
                })
            })
            .sort((a, b) => b.elo - a.elo)

        if (qp.limit) {
            return flattenedUsers.slice(0, qp.limit)
        }

        return flattenedUsers
    }

    findOne(id: number) {
        return `This action returns a #${id} team`
    }

    // In the future: add a limit
    async getEloHistory(id: string) {
        return await this.prisma.elo.findMany({
            where: {
                teamId: id,
            },
            orderBy: {
                createdAt: 'asc',
            },
        })
    }

    async getHeadToHeads(id: string): Promise<TeamPerformanceSummary> {
        const matches = await this.prisma.match.findMany({
            where: {
                OR: [
                    {
                        teamAId: id,
                    },
                    {
                        teamBId: id,
                    },
                ],
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
                season: true,
            },
        })

        const headToHeadRecords = new Map<string, TeamHeadToHeadRecord>()
        const teamPerformance: Partial<TeamPerformanceSummary> = {
            totalWins: 0,
            totalLosses: 0,
            bySeason: [],
            headToHeads: [],
        }

        for (const match of matches) {
            if (match.state !== 'COMPLETED') {
                continue
            }

            const isTeamA = match.teamAId === id
            const opposingTeamId = isTeamA ? match.teamBId : match.teamAId
            const opposingTeamUsers = isTeamA
                ? match.teamB.users.map((user) => user.user.firstName)
                : match.teamA.users.map((user) => user.user.firstName)

            const isWinner = match.winningTeamId === id

            if (isWinner) {
                teamPerformance.totalWins++
            } else {
                teamPerformance.totalLosses++
            }

            const record = headToHeadRecords.get(opposingTeamId)
            if (!record) {
                headToHeadRecords.set(opposingTeamId, {
                    wins: isWinner ? 1 : 0,
                    losses: isWinner ? 0 : 1,
                    userNames: opposingTeamUsers,
                })
            } else {
                if (isWinner) {
                    record.wins++
                } else {
                    record.losses++
                }
            }
        }

        teamPerformance.headToHeads = Array.from(headToHeadRecords, ([teamId, record]) => ({
            teamId,
            record,
        }))

        teamPerformance.headToHeads.sort((a, b) => {
            const aTotal = a.record.wins + a.record.losses
            const bTotal = b.record.wins + b.record.losses
            return bTotal - aTotal
        })

        return plainToInstance(TeamPerformanceSummary, teamPerformance)
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
                eloHistory: {
                    include: {
                        team: true,
                    },
                    orderBy: {
                        elo: 'desc',
                    },
                },
            },
        })

        // check if the team composition already exists
        const foundTeam = userTeams.filter((team) => {
            return (
                team.users.length === userIds.length &&
                team.users.every((user) => {
                    return userIds.includes(user.userId)
                })
            )
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
                    eloHistory: {
                        create: {
                            elo: STARTING_ELO,
                        },
                    },
                },
            })
        }

        if (foundTeam.length > 1) {
            // Temporary error just for development

            throw new Error(
                `found more than one team for the associated ids ${foundTeam.length}, ${foundTeam[0].users[0]}, ${foundTeam[1].users[0]}`,
            )
        }

        return foundTeam[0]
    }
}
