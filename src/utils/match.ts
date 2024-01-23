import { TeamScore, User } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import { FormattedMatchTeam } from 'src/match/entities/match.entity'
import { PrismaTeamMatchInfo } from 'src/types/match'
import { PrismaTeamWithUsers } from 'src/types/team'
import { getTeamCurrentElo } from './team'

export function flattenPrismaTeamUsers(team: PrismaTeamWithUsers): User[] {
    return team.users.map((user) => user.user)
}

export function getTeamScoreByMatch(matchId: string, teamId: string, scores: TeamScore[]): number {
    const score = scores.find((score) => {
        return score.matchId === matchId && score.teamId === teamId
    })

    if (!score) {
        throw new Error(`Could not find score associated with matchId ${matchId}`)
    }

    return score.score
}

export function convertPrismaMatchTeamToFormattedMatchTeam(
    matchId: string,
    team: PrismaTeamMatchInfo,
) {
    return plainToClass(FormattedMatchTeam, {
        ...team,
        users: flattenPrismaTeamUsers(team),
        score: getTeamScoreByMatch(matchId, team.id, team.score),
        elo: getTeamCurrentElo(team),
    })
}
