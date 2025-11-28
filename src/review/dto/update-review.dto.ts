import { PartialType } from '@nestjs/mapped-types';
import { CreateReviewDto } from './create-review.dto';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateReviewDto{

    @IsOptional()
    comment?: string;

    @IsOptional()
    rating?: number;
    @IsOptional()
    image_urls?: string[];
    @IsNotEmpty()
    userId: number;
    @IsNotEmpty()
    productId: number;
}



export class ChangeStatusReviewDto {
  @Type(() => Number)
  @IsInt()
  reviewId: number;

  @IsString()
  status: string;
}
