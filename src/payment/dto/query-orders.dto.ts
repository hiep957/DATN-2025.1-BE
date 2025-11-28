import { IsOptional } from "class-validator";

export class QueryOrdersDto {
    @IsOptional()
    q:string;
    @IsOptional()
    payment_method?: string;
    @IsOptional()
    order_status?: string
    @IsOptional()
    payment_status?: string;
    @IsOptional()
    sortBy?: string;
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC';
    @IsOptional()
    page?: number
    @IsOptional()
    limit?: number
}