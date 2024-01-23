import { Elo, Team } from '@prisma/client'

export function getTeamCurrentElo(
    team: Team & {
        eloHistory: Elo[]
    },
): number {
    return team.eloHistory?.[0].elo ?? 0
}
