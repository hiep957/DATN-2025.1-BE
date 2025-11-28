import { IsNotEmpty, IsOptional } from "class-validator";


export class CreateReviewDto {
    @IsNotEmpty()
    rating: number;

    @IsNotEmpty()
    comment: string;

    @IsOptional()
    image_urls: string[];

    @IsNotEmpty()
    productId: number;

    @IsNotEmpty()
    userId: number;
}
