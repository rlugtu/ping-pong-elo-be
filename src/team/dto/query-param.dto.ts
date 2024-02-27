import { MatchMode } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator'

export class TeamQueryParams {
  @IsString()
  matchMode: MatchMode

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  limit: number

  @IsOptional()
  @IsBoolean()
  completedPlacements: boolean
}
