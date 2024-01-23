import { TeamScore, User } from '@prisma/client'
import { plainToClass } from 'class-transformer'
import { FormattedMatchTeam } from 'src/match/entities/match.entity'
import { PrismaTeamMatchInfo } from 'src/types/match'
import { PrismaTeamWithUsers } from 'src/types/team'
import { getTeamCurrentElo } from './team'

export function formatTeamUsers(team: PrismaTeamWithUsers): User[] {
    return team.users.map((user) => user.user)
}

export function getTeamScoreByMatch(matchId: string, scores: TeamScore[]): number {
    const score = scores.find((score) => {
        return score.matchId === matchId
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
        users: formatTeamUsers(team),
        score: getTeamScoreByMatch(matchId, team.score),
        elo: getTeamCurrentElo(team),
    })
}
