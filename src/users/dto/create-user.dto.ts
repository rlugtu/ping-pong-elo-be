import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator'

export class GetUserDto {
    @IsString()
    id: string

    @IsString()
    accessToken: string

    @IsString()
    firstName: string
}

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

    @IsString()
    accessToken: string
}
