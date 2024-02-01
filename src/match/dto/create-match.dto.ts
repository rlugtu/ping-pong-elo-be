import { MatchMode, MatchState } from '@prisma/client'
import { ArrayMinSize, IsArray, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateMatchDto {
    state: MatchState

    @IsNumber()
    winningScore: number

    @IsArray()
    @ArrayMinSize(1)
    teamA: string[]

    @IsOptional()
    @IsArray()
    teamB: string[]

    @IsString()
    mode: MatchMode
}
