import { Type, Transform } from 'class-transformer';
import {
  IsOptional, IsString, IsBoolean, IsInt, IsNumber,
  IsObject, IsArray, ValidateNested, ValidateIf, IsUrl
} from 'class-validator';

// --- Images ---
export class UpdateProductImageDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsBoolean()
  _destroy?: boolean;
}

// --- Variants ---
export class UpdateProductVariantDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  id?: number; // có -> update theo id

  @IsOptional()
  @IsString()
  sku?: string; // không id -> match theo sku

  // chấp nhận string hoặc number -> convert sang number
  @IsOptional()
  @Transform(({ value }) => (value === '' || value === null || value === undefined) ? undefined : Number(value))
  @IsNumber()
  price?: number;

  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value === null ? null : Number(value)))
  @ValidateIf((_, v) => v !== null) // null hợp lệ để "xóa" compare_at_price
  @IsNumber()
  compare_at_price?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  colorId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sizeId?: number;

  @IsOptional()
  @IsBoolean()
  _destroy?: boolean;
}

// --- Product ---
export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Cho phép null để gỡ liên kết: dùng ValidateIf để bỏ qua các rule khi null
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Type(() => Number)
  @IsInt()
  categoryId?: number | null;

  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @Type(() => Number)
  @IsInt()
  brandId?: number | null;

  @IsOptional()
  @IsBoolean()
  is_published?: boolean;

  @IsOptional()
  @IsObject()
  specs?: Record<string, any>;

  @IsOptional()
  @IsObject()
  image_colors?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantDto)
  variants?: UpdateProductVariantDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductImageDto)
  images?: UpdateProductImageDto[];
}
