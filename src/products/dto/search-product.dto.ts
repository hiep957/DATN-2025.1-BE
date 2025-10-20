// src/products/dto/query-product.dto.ts
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsNumber, IsIn, IsArray, Matches } from 'class-validator';

export class QueryProductDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  maxPrice?: number;

  // Mảng id
  @IsOptional()
  @IsString()
  // Bạn có thể thêm regex để đảm bảo định dạng là "A,B,C"
  @Matches(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/, {
    message: 'Colors must be a comma-separated string (e.g., red,blue,green)'
  })
  colors?: string;

  @IsOptional()
  @IsString()
  // Bạn có thể thêm regex để đảm bảo định dạng là "A,B,C"
  @Matches(/^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/, {
    message: 'Sizes must be a comma-separated string (e.g., XL,L)'
  })
  sizes?: string;

  @IsOptional()
  @IsString()
  @IsIn(['created', 'price', 'name'])
  sortBy?: string = 'created';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 10;
}