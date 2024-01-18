import { MatchState } from '@prisma/client'
import { ArrayMinSize, IsArray, IsNumber } from 'class-validator'

export class CreateMatchDto {
    state: MatchState

    @IsNumber()
    winningScore: number

    @IsArray()
    @ArrayMinSize(1)
    teamA: string[]
}
