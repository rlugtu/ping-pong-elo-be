import { MatchMode, MatchState } from '@prisma/client'
import { ArrayMinSize, IsArray, IsNumber, IsString } from 'class-validator'

export class CreateMatchDto {
    state: MatchState

    @IsNumber()
    winningScore: number

    @IsArray()
    @ArrayMinSize(1)
    teamA: string[]

    @IsString()
    mode: MatchMode
}
