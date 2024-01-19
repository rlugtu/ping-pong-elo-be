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
