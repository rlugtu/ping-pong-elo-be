import { Elo, MatchMode, MatchState, TeamScore, User } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { MatchWinningScore } from 'src/types/match'

export class FormattedMatch {
    id: string
    createdAt: Date
    mode: MatchMode
    state: MatchState
    teamA: MatchTeam
    teamB: MatchTeam
    winningScore: MatchWinningScore

    @Exclude()
    teamAId: string
    @Exclude()
    teamBId: string

    @Exclude()
    eloHistory: Elo[]

    @Exclude()
    teamScores: TeamScore[]
}

export class MatchTeam {
    id: string
    elo: number
    createdAt: Date
    updatedAt: Date
    users: User[]
    score: number

    @Exclude()
    eloHistory: Elo[]
}
