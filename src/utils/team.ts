import { PrismaTeamWithElo } from 'src/types/team'

export function getTeamCurrentElo(team: PrismaTeamWithElo): number {
    return team.eloHistory?.[0].elo ?? 0
}
