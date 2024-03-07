import { Elo, Season, Team, User, UserTeams } from '@prisma/client'

export type PrismaTeamWithUsers = Team & {
    users: ({
        user: User
    } & UserTeams)[]
}

export type PrismaTeamWithElo = Team & {
    eloHistory: Elo[]
}

export type TeamRecordSummary = {
    wins: number
    losses: number
}

export type TeamHeadToHeadRecord = TeamRecordSummary & {
    userNames: string[]
}

export type TeamHeadToHead = {
    teamId: string
    record: TeamHeadToHeadRecord
}

// export interface TeamPerformanceSummary {
//     totalWins: number
//     totalLosses: number
//     bySeason: TeamRecordSummary & {
//         season: Season
//     }
//     headToHeads: TeamHeadToHead[]
// }
