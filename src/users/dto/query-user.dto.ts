import { IsOptional } from "class-validator";


export class QueuryUserDto {
    @IsOptional()
    q: string;
    @IsOptional()
    role?: string;
    @IsOptional()
    sortBy?: string;
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC';
    @IsOptional()
    page?: number
    @IsOptional()
    limit?: number

}