import { ArrayMinSize, IsArray, IsNumber, IsOptional } from 'class-validator'

export class CreateMatchDto {
    @IsArray()
    @ArrayMinSize(1)
    sideA: string[]

    @IsArray()
    @ArrayMinSize(1)
    sideB: string[]

    @IsNumber()
    winningScore: number

    @IsNumber()
    @IsOptional()
    sideAScore: number

    @IsNumber()
    @IsOptional()
    sideBScore: number
}
