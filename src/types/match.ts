import { TeamScore } from '@prisma/client'
import { PrismaTeamWithElo, PrismaTeamWithUsers } from './team'

export type MatchWinningScore = 11 | 21

export type PrismaTeamMatchInfo = PrismaTeamWithUsers &
    PrismaTeamWithElo & {
        score: TeamScore[]
    }

export type SocketMatchTeamScore = {
    matchId: string
    scores: {
        [teamId: string]: number
    }
}
