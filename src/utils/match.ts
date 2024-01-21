import { TeamScore } from '@prisma/client'

export interface PrismaTeamWithUsers {
    users: ({
        user: {
            id: string
            accessToken: string
            email: string
            firstName: string
            lastName: string
            department: string
            createdAt: Date
            updatedAt: Date
        }
    } & {
        userId: string
        teamId: string
        createdAt: Date
        updatedAt: Date
    })[]
}
export function formatTeamUsers(team: PrismaTeamWithUsers) {
    return { ...team, users: team.users.map((user) => user.user) }
}

export function getTeamScoreByMatch(matchId: string, scores: TeamScore[]): number {
    const score = scores.find((score) => {
        return score.matchId === matchId
    })

    return score.score ?? 0
}
