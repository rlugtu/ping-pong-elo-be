import { PrismaTeamWithElo } from 'src/types/team'

export function getTeamCurrentElo(team: PrismaTeamWithElo): number {
    if (!team.eloHistory.length) {
        throw new Error('No elo found for team')
    }

    return team.eloHistory?.[0].elo
}
