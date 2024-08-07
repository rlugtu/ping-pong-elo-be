import { PartialType } from '@nestjs/mapped-types'
import { CreateMatchDto } from './create-match.dto'
import { ArrayMinSize, IsArray, IsBoolean, IsNumber, IsString } from 'class-validator'

export class UpdateMatchDto extends PartialType(CreateMatchDto) {}

export class JoinMatchDto {
    @IsArray()
    @ArrayMinSize(1)
    teamB: string[]
}

export class TeamScoreDto {
    @IsString()
    teamId: string

    @IsNumber()
    score: number
}

export class UpdateEloRatingDto {
    teamA: TeamScoreDto
    teamB: TeamScoreDto
}
