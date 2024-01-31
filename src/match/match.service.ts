import { Injectable } from '@nestjs/common'
import { CreateMatchDto } from './dto/create-match.dto'
import {
    JoinMatchDto,
    TeamScoreDto,
    UpdateEloRatingDto,
    UpdateMatchDto,
} from './dto/update-match.dto'
import { PrismaService } from 'src/prisma/prisma.service'
import { TeamService } from 'src/team/team.service'
import { MatchState } from '@prisma/client'

import { FormattedLobby, FormattedMatch, FormattedMatchTeam } from './entities/match.entity'
import { plainToClass } from 'class-transformer'
import { convertPrismaMatchTeamToFormattedMatchTeam } from 'src/utils/match'
import { flattenPrismaTeamUsers, getTeamCurrentElo } from 'src/utils/team'
import { ELO_CHANGE_CONSTANT, ELO_CHANGE_CONSTANT_PLACEMENTS, STARTING_ELO } from 'src/elo-config'

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
                        eloHistory: {
                            orderBy: {
                                createdAt: 'desc',
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
                        eloHistory: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                    },
                },
            },
        })

        // Need to make entity for lobby
        const formattedLobbies = lobbies.map((lobby) => {
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
                        eloHistory: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
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
                        eloHistory: {
                            orderBy: {
                                createdAt: 'desc',
                            },
                        },
                        score: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
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

    async updateMatchScore(matchId: string, matchInfo: TeamScoreDto): Promise<void> {
        // const { teamId, score, isFinalScore } = matchInfo

        // await this.prisma.teamScore.update({
        //     where: {
        //         teamIdMatchId: {
        //             teamId,
        //             matchId,
        //         },
        //     },
        //     data: {
        //         score,
        //         isFinalScore,
        //     },
        // })

        const match = await this.prisma.match.findFirst({
            where: {
                id: matchId,
            },
            include: {
                teamScores: true,
                teamA: {
                    include: {
                        score: true,
                    },
                },
                teamB: {
                    include: {
                        score: true,
                    },
                },
            },
        })

        // const matchScoresAreFinalized = match.teamScores.every((score) => {
        //     return score.isFinalScore === true
        // })

        if (true) {
            // Check if win condition has been reached
            const winConditionReached = match.teamScores.some(
                (score) => score.score >= match.winningScore,
            )

            if (winConditionReached) {
                await this.prisma.match.update({
                    where: {
                        id: matchId,
                    },
                    data: {
                        state: 'COMPLETED',
                    },
                })
                await this.updateEloRatings({
                    teamA: {
                        teamId: match.teamA.id,
                        score: match.teamA.score[0].score,
                        isFinalScore: true,
                    },
                    teamB: {
                        teamId: match.teamB.id,
                        score: match.teamB.score[0].score,
                        isFinalScore: true,
                    },
                })
            } else {
                // if last user submission wasn't winning, reset the game to in progress
                // await this.prisma.teamScore.update({
                //     where: {
                //         teamIdMatchId: {
                //             teamId,
                //             matchId,
                //         },
                //     },
                //     data: {
                //         isFinalScore: false,
                //     },
                // })
            }
        }
    }

    async updateEloRatings(scoreData: UpdateEloRatingDto) {
        // return await this.prisma.team.findMany()
        console.log(scoreData)
        const { teamA, teamB } = scoreData

        let outcomeA
        if (teamA.score > teamB.score) outcomeA = 1
        else if (teamA.score < teamB.score) outcomeA = 0
        else outcomeA = 0.5

        const outcomeB = 1 - outcomeA

        console.log('outcomeA', outcomeA)
        console.log('outcomeB', outcomeB)

        const teamAElos = await this.prisma.elo.findMany({
            where: {
                teamId: teamA.teamId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const teamBElos = await this.prisma.elo.findMany({
            where: {
                teamId: teamB.teamId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const teamAElo = teamAElos[0].elo ?? STARTING_ELO
        const teamBElo = teamBElos[0].elo ?? STARTING_ELO

        const scoreDiff = Math.abs(teamA.score - teamB.score)

        console.log('scoreDiff', scoreDiff)

        const constantA =
            teamAElos.length > 5 ? ELO_CHANGE_CONSTANT : ELO_CHANGE_CONSTANT_PLACEMENTS
        const constantB =
            teamBElos.length > 5 ? ELO_CHANGE_CONSTANT : ELO_CHANGE_CONSTANT_PLACEMENTS

        const adjustedChangeA = constantA * (1 + (scoreDiff - 1) / 10)
        const adjustedChangeB = constantB * (1 + (scoreDiff - 1) / 10)

        console.log('adjustedChangeA', adjustedChangeA)
        console.log('adjustedChangeB', adjustedChangeB)

        const expectedOutcomeA = 1 / (1 + Math.pow(10, (teamBElo - teamAElo) / 400))

        const eloANew = teamAElo + Math.round(adjustedChangeA * (outcomeA - expectedOutcomeA))
        console.log('matroundA', Math.round(adjustedChangeA * (outcomeA - expectedOutcomeA)))

        const expectedOutcomeB = 1 / (1 + Math.pow(10, (teamAElo - teamBElo) / 400))

        const eloBNew = teamBElo + Math.round(adjustedChangeB * (outcomeB - expectedOutcomeB))

        console.log('matroundB', Math.round(adjustedChangeB * (outcomeB - expectedOutcomeB)))

        console.log('expectedOutcomeA', expectedOutcomeA)
        console.log('expectedOutcomeB', expectedOutcomeB)

        console.log('teamA', teamAElo, '->', eloANew)
        console.log('teamB', teamBElo, '->', eloBNew)

        await this.prisma.elo.createMany({
            data: [
                { teamId: teamA.teamId, elo: eloANew },
                { teamId: teamB.teamId, elo: eloBNew },
            ],
        })
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
