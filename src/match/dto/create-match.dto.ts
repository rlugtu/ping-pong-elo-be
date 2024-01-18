import { MatchState } from '@prisma/client'
import { IsArray, IsNumber } from 'class-validator'

export class CreateMatchDto {
    state: MatchState

    @IsNumber()
    winningScore: number

    @IsArray()
    teamA: string[]
}
