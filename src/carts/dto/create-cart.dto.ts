import { IsNotEmpty, IsOptional } from 'class-validator';
export class CreateCartDto {
    @IsOptional()
    variantId?: number;
    @IsOptional()
    quantity?: number;
    @IsOptional()
    productId?: number;
    @IsOptional()
    productName?: string;
    @IsOptional()
    productImage?: string;

}

export class AddItemDto {
    @IsNotEmpty()
    variantId: number;
    @IsNotEmpty()
    quantity: number;
    @IsNotEmpty()
    productId: number;
    @IsNotEmpty()
    productName: string;
    @IsOptional()
    productImage?: string;
}


export class DecreaseItemDto {
    @IsNotEmpty()
    variantId: number;
    @IsNotEmpty()
    quantity: number;
   
}

export class MergeCartDto {
    @IsNotEmpty()
    variantId: number;
    @IsNotEmpty()
    quantity: number
    @IsNotEmpty()
    productId: number;
    @IsNotEmpty()
    productName: string;
    @IsOptional()
    productImage?: string;
   
}


