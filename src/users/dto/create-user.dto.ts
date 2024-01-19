import { IsEmail, IsOptional, IsString } from 'class-validator'

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

    @IsString()
    @IsOptional()
    department: string

    @IsOptional()
    @IsEmail()
    email: string
}
