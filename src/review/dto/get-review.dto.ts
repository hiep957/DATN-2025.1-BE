import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";


export class GetReviewDto {
    @IsOptional()
    q: string; // Tìm kiếm theo tên người dùng hoặc tên sản phẩm
    @IsOptional()
    status?: string; // Lọc theo trạng thái đánh giá
    @IsOptional()
    rating?: string; // Lọc theo đánh giá sao
    @IsOptional()
    sortBy?: string; // Sắp xếp theo trường nào
    @IsOptional()
    sortOrder?: 'ASC' | 'DESC'
    @IsOptional()
    page?: number
    @IsOptional()
    limit?: number
}