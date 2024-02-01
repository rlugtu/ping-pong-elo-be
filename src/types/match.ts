import { MatchMode, TeamScore } from '@prisma/client'
import { PrismaTeamWithElo, PrismaTeamWithUsers } from './team'

export type MatchWinningScore = 11 | 21

export type PrismaTeamMatchInfo = PrismaTeamWithUsers &
    PrismaTeamWithElo & {
        score: TeamScore[]
    }

export interface MatchChallenge {
    challenger: {
        elo: number
        firstName: string
        id: string
    }
    challengeeUserId: string
    matchInfo: {
        id: string
        winningScore: MatchWinningScore
        mode: MatchMode
    }
}
