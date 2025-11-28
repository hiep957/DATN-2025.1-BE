import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsDate, IsOptional, IsString } from 'class-validator';
export class UpdateUserDto {
    @IsOptional()
    @IsString()
    id?: string;

    //roles
    @IsOptional()
    @IsString({ each: true })
    roles?: string[];


    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsString()
    username?: string;
    @IsOptional()
    @IsString()
    avatar?: string;
    @IsOptional()
    phoneNumber?: string
    @IsOptional()
    birthday?: string;
    @IsOptional()
    gender?: string;
    @IsOptional()
    address?: string;
    @IsOptional()
    occupation?: string;
}