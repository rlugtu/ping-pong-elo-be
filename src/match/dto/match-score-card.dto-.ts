import { IsNumber, IsString } from 'class-validator'

export class MatchScoreCardDto {
    @IsString()
    matchId: string

    @IsString()
    reportingTeamId: string

    @IsNumber()
    winningTeamScore: number

    @IsString()
    winningTeamId: string

    @IsNumber()
    losingTeamScore: number

    @IsString()
    losingTeamId: string
}
