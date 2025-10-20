import {
  IsString,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  IsObject,
  IsDefined,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductImageDto {
  @IsString()
  url: string;
}

export class CreateProductVariantDto {
  @IsString()
  sku: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsNumber()
  compare_at_price?: number;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  colorId: number;

  @IsNumber()
  sizeId: number;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  categoryId: number;

  @IsOptional()
  @IsNumber()
  brandId?: number;

  @IsOptional()
  @IsObject()
  specs?: Record<string, any>;

  @IsOptional()
  @IsObject()
  image_colors?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images: CreateProductImageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}
