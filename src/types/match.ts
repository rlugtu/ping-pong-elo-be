import { TeamScore } from '@prisma/client'
import { PrismaTeamWithElo, PrismaTeamWithUsers } from './team'

export type MatchWinningScore = 11 | 21

export type PrismaTeamMatchInfo = PrismaTeamWithUsers &
    PrismaTeamWithElo & {
        score: TeamScore[]
    }

// Web Socket Types
export type SocketMatchTeamScore = {
    [roomId: string]: {
        [teamId: string]: number
    }
}
