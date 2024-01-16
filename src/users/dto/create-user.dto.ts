import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator'

export class CreateUserDto {
    @IsString()
    id: string

    @IsString()
    firstName: string

    @IsString()
    lastName: string

    @IsNumber()
    elo: number

    @IsString()
    @IsOptional()
    department: string

    @IsOptional()
    @IsEmail()
    email: string

    @IsOptional()
    @IsString()
    accessToken: string
}
