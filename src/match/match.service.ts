import { Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dto/create-match.dto'
import { JoinMatchDto, UpdateMatchDto, UpdateMatchScoreDto } from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { UsersService } from 'src/users/users.service'
import { TeamService } from 'src/team/team.service'
import { MatchState } from '@prisma/client'
import { formatTeamUsers, getTeamScoreByMatch } from 'src/utils/match'
import { FormattedMatch, MatchTeam } from './entities/match.entity'
import { plainToClass } from 'class-transformer'

@Injectable()
export class MatchService {
    constructor(
        private prisma: PrismaService,
        private userService: UsersService,
        private teamService: TeamService,
    ) {}

    async create(createMatchDto: CreateMatchDto) {
        const teamToJoin = await this.teamService.findOrCreateTeam(createMatchDto.teamA)

        const match = this.prisma.match.create({
            data: {
                ...createMatchDto,
                teamA: {
                    connect: {
                        id: teamToJoin.id,
                    },
                },
                teamScores: {
                    create: {
                        score: 0,
                        teamId: teamToJoin.id,
                    },
                },
            },
        })

        return match
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

    async getUserCurrentMatches(id: string): Promise<FormattedMatch[]> {
        const user = await this.prisma.user.findFirstOrThrow({
            where: {
                id,
            },
        })

        return this.findAllByState('IN_PROGRESS', user.id)
    }

    async findAllByState(state: MatchState, filterByUserId?: string): Promise<FormattedMatch[]> {
        const matches = await this.prisma.match.findMany({
            where: {
                state,
                ...(filterByUserId && {
                    teamA: {
                        users: {
                            some: {
                                userId: filterByUserId,
                            },
                        },
                    },
                    teamB: {
                        users: {
                            some: {
                                userId: filterByUserId,
                            },
                        },
                    },
                }),
            },
            include: {
                teamA: {
                    include: {
                        users: {
                            include: {
                                user: true,
                            },
                        },
                        eloHistory: true,
                        score: true,
                    },
                },
                teamB: {
                    include: {
                        users: {
                            include: {
                                user: true,
                            },
                        },
                        eloHistory: true,
                        score: true,
                    },
                },
            },
        })

        const formattedMatch = matches.map((match) => {
            return plainToClass(FormattedMatch, {
                ...match,
                teamA: {
                    ...formatTeamUsers(match.teamA),
                    score: getTeamScoreByMatch(match.id, match.teamA.score),
                    elo: match.teamA.eloHistory[0].elo,
                },

                teamB: {
                    ...formatTeamUsers(match.teamB),
                    score: getTeamScoreByMatch(match.id, match.teamB.score),
                    elo: match.teamB.eloHistory[0].elo,
                },
            })
        })

        return formattedMatch
    }

    async findOne(matchId: string): Promise<FormattedMatch> {
        const match = await this.prisma.match.findUniqueOrThrow({
            where: {
                id: matchId,
            },
            include: {
                teamScores: {
                    where: {
                        matchId,
                    },
                    include: {
                        team: {
                            include: {
                                users: {
                                    include: {
                                        user: true,
                                    },
                                },
                                eloHistory: {
                                    orderBy: {
                                        elo: 'desc',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })

        // if (match.teamScores.length < 2) {
        //     throw new NotFoundException('Teams for match not found')
        // }

        // Add Error handling if filter returns []
        const teamAInfo = match.teamScores.filter(
            (teamScore) => teamScore.teamId === match.teamAId,
        )[0]

        if (!teamAInfo) {
            throw new Error('not found')
        }
        const teamA = plainToClass(MatchTeam, {
            ...teamAInfo.team,
            score: teamAInfo.score,
            users: teamAInfo.team.users.map((user) => user.user),
            elo: teamAInfo.team.eloHistory[0].elo,
        })

        // Add Error handling if filter returns []
        const teamBInfo = match.teamScores.filter(
            (teamScore) => teamScore.teamId === match.teamBId,
        )[0]

        const teamB = plainToClass(MatchTeam, {
            ...teamBInfo.team,
            score: teamBInfo.score,
            users: teamBInfo.team.users.map((user) => user.user),
            elo: teamBInfo.team.eloHistory[0].elo,
        })

        const formatted = {
            ...match,
            teamA,
            teamB,
        }

        return plainToClass(FormattedMatch, formatted)
    }

    async updateMatchScore(matchId: string, scoreData: UpdateMatchScoreDto): Promise<void> {
        const { score, teamId } = scoreData

        const match = await this.prisma.match.findFirst({
            where: {
                id: matchId,
            },
        })

        // Check if win condition has been reached
        if (scoreData.score >= match.winningScore) {
            await this.prisma.match.update({
                where: {
                    id: matchId,
                },
                data: {
                    state: 'COMPLETED',
                },
            })
        }

        await this.prisma.teamScore.update({
            where: {
                teamIdMatchId: {
                    teamId,
                    matchId,
                },
            },
            data: {
                score,
            },
        })
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
