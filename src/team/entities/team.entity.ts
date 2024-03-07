import { Elo, Season, User } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { TeamHeadToHead, TeamRecordSummary } from 'src/types/team'

export class Team {
    id: string
    users: User[]
    elo: number

    @Exclude()
    eloHistory: Elo[]
}

export class TeamPerformanceSummary {
    totalWins: number
    totalLosses: number
    bySeason: (TeamRecordSummary & {
        season: Season
    })[]
    headToHeads: TeamHeadToHead[]
}
