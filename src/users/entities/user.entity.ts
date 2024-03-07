import { Season, Team } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { TeamHeadToHead, TeamRecordSummary } from 'src/types/team'

export class UserEntity {
    firstName: string
    lastName: string
    elo: number
    department: string
    email: string
    teams: Team[]
    performanceSummary: {
        totalWins: number
        totalLosses: number
        bySeason: (TeamRecordSummary & {
            season: Season
        })[]
        headToHeads: TeamHeadToHead[]
    }

    @Exclude()
    accessToken: string

    @Exclude()
    createdAt: Date

    @Exclude()
    updatedAt: Date
}
