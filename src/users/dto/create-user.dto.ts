import {IsString, IsEmail, MinLength, IsOptional} from 'class-validator'

export class CreateUserDto {
    @IsString({ message: 'Username must be a string' })
    @MinLength(3)
    username: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;

    @IsOptional()
    roleNames: string[];
}
