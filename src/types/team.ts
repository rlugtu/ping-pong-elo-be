import { Elo, Team, User, UserTeams } from '@prisma/client'

export type PrismaTeamWithUsers = Team & {
    users: ({
        user: User
    } & UserTeams)[]
}

export type PrismaTeamWithElo = Team & {
    eloHistory: Elo[]
}
