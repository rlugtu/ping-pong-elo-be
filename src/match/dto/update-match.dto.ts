import { PartialType } from '@nestjs/mapped-types'
import { CreateMatchDto } from './create-match.dto'
import { ArrayMinSize, IsArray, IsNumber } from 'class-validator'

export class UpdateMatchDto extends PartialType(CreateMatchDto) {}

export class JoinMatchDto {
    @IsArray()
    @ArrayMinSize(1)
    teamB: string[]
}

export class UpdateMatchScoreDto {
    @IsNumber()
    teamAScore: number

    @IsNumber()
    teamBScore: number
}
