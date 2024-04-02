import { Elo, MatchMode, MatchScoreCard, MatchState, TeamScore, User } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { MatchWinningScore } from 'src/types/match'

export class FormattedMatch {
    id: string
    createdAt: Date
    mode: MatchMode
    state: MatchState
    teamA: FormattedMatchTeam
    teamB: FormattedMatchTeam
    winningScore: MatchWinningScore
    scoreCards: MatchScoreCard[]

    @Exclude()
    teamAId: string
    @Exclude()
    teamBId: string

    @Exclude()
    eloHistory: Elo[]

    @Exclude()
    teamScores: TeamScore[]
}

export class FormattedLobby {
    id: string
    createdAt: Date
    mode: MatchMode
    state: MatchState
    teamA: FormattedMatchTeam
    teamB: FormattedMatchTeam
    winningScore: MatchWinningScore
}

export class FormattedMatchTeam {
    id: string
    elo: number
    createdAt: Date
    updatedAt: Date
    users: User[]
    score: number
    winningTeamId: string

    @Exclude()
    eloHistory: Elo[]
}
