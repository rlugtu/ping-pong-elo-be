import { Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dto/create-match.dto'
import { JoinMatchDto, UpdateMatchDto, UpdateMatchScoreDto } from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { TeamService } from 'src/team/team.service'
import { MatchState } from '@prisma/client'

import { FormattedLobby, FormattedMatch, FormattedMatchTeam } from './entities/match.entity'
import { plainToClass } from 'class-transformer'
import { convertPrismaMatchTeamToFormattedMatchTeam } from 'src/utils/match'
import { flattenPrismaTeamUsers, getTeamCurrentElo } from 'src/utils/team'

@Injectable()
export class MatchService {
    constructor(
        private prisma: PrismaService,
        private teamService: TeamService,
    ) {}

    async create(createMatchDto: CreateMatchDto) {
        try {
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
        } catch (error) {}
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
                        eloHistory: true,
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
                    },
                },
            },
        })

        // Need to make entity for lobby
        const formattedLobbies = lobbies.map((lobby) => {
            console.log(lobby.teamA.users[0].user)
            // return {
            //     ...lobby,
            //     teamA: {
            //         ...lobby.teamA,
            //         users: lobby.teamA.users.map((user) => user.user),
            //     },
            //     teamB: {
            //         ...lobby.teamB,
            //         users: lobby.teamB?.users.map((user) => user.user) ?? [],
            //     },
            // }
            return plainToClass(FormattedLobby, {
                ...lobby,
                teamA: plainToClass(FormattedMatchTeam, {
                    ...lobby.teamA,
                    users: lobby.teamA.users.map((user) => user.user),
                    elo: getTeamCurrentElo(lobby.teamA),
                }),
                teamB: plainToClass(FormattedMatchTeam, {
                    ...lobby.teamB,
                    users: lobby.teamB?.users?.map((user) => user.user) ?? [],
                }),
            })
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

    async findAllByState(
        state: MatchState,
        filterByUserId: string = '',
    ): Promise<FormattedMatch[]> {
        const matches = await this.prisma.match.findMany({
            where: {
                state,
                ...(filterByUserId && {
                    OR: [
                        {
                            teamA: {
                                users: {
                                    some: {
                                        userId: {
                                            equals: filterByUserId,
                                        },
                                    },
                                },
                            },
                        },
                        {
                            teamB: {
                                users: {
                                    some: {
                                        userId: {
                                            equals: filterByUserId,
                                        },
                                    },
                                },
                            },
                        },
                    ],
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
                teamA: convertPrismaMatchTeamToFormattedMatchTeam(match.id, match.teamA),
                teamB: convertPrismaMatchTeamToFormattedMatchTeam(match.id, match.teamB),
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

        const teamA = plainToClass(FormattedMatchTeam, {
            ...teamAInfo.team,
            score: teamAInfo.score,
            users: flattenPrismaTeamUsers(teamAInfo.team),
            elo: getTeamCurrentElo(teamAInfo.team),
        })

        // Add Error handling if filter returns []
        const teamBInfo = match.teamScores.filter(
            (teamScore) => teamScore.teamId === match.teamBId,
        )[0]

        const teamB = plainToClass(FormattedMatchTeam, {
            ...teamBInfo.team,
            score: teamBInfo.score,
            users: flattenPrismaTeamUsers(teamBInfo.team),
            elo: getTeamCurrentElo(teamBInfo.team),
        })

        return plainToClass(FormattedMatch, {
            ...match,
            teamA,
            teamB,
        })
    }

    async updateMatchScore(matchId: string, scoreData: UpdateMatchScoreDto): Promise<void> {
        const { teamA, teamB } = scoreData

        const match = await this.prisma.match.findFirst({
            where: {
                id: matchId,
            },
        })

        const teamScores = [teamA, teamB].map((team) => {
            return this.prisma.teamScore.update({
                where: {
                    teamIdMatchId: {
                        teamId: team.id,
                        matchId,
                    },
                },
                data: {
                    score: team.score,
                },
            })
        })

        await Promise.all(teamScores)

        // Check if win condition has been reached
        if (teamA.score >= match.winningScore || teamB.score >= match.winningScore) {
            await this.prisma.match.update({
                where: {
                    id: matchId,
                },
                data: {
                    state: 'COMPLETED',
                },
            })
        }
    }

    update(id: number, updateMatchDto: UpdateMatchDto) {
        return `This action updates a #${id} match`
    }

    async joinMatch(id: string, joinMatchDto: JoinMatchDto) {
        try {
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
                    teamScores: {
                        create: {
                            teamId: teamToJoin.id,
                            score: 0,
                        },
                    },
                    state: 'IN_PROGRESS',
                },
            })
        } catch (error) {}
    }

    remove(id: number) {
        return `This action removes a #${id} match`
    }
}
