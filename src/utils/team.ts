import { Match, User } from '@prisma/client'
import { TeamPerformanceSummary } from 'src/team/entities/team.entity'
import { PrismaTeamWithElo, PrismaTeamWithUsers, TeamHeadToHeadRecord } from 'src/types/team'

export function getTeamCurrentElo(team: PrismaTeamWithElo): number {
    if (!team.eloHistory.length) {
        throw new Error('No elo found for team')
    }

    return team.eloHistory?.[0].elo
}

export function flattenPrismaTeamUsers(team: PrismaTeamWithUsers): User[] {
    return team.users.map((user) => user.user)
}

export function getTeamMatchSummary(teamPerformance: TeamPerformanceSummary, match, id: string) {
    // const isTeamA = match.teamAId === id
    // const opposingTeamId = isTeamA ? match.teamBId : match.teamAId
    // const opposingTeamUsers = isTeamA
    //     ? match.teamB.users.map((user) => user.user.firstName)
    //     : match.teamA.users.map((user) => user.user.firstName)

    const isWinner = match.winningTeamId === id

    if (isWinner) {
        teamPerformance.totalWins++
    } else {
        teamPerformance.totalLosses++
    }

    return teamPerformance
}
