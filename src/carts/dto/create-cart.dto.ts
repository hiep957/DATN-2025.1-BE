import { IsNotEmpty } from 'class-validator';
export class CreateCartDto {
    variantId?: number;
    quantity?: number;
    userId: number; // Chưa làm bảo mật nên để tạm thời, mấy nữa sẽ lấy từ token
}

export class AddItemDto {
    @IsNotEmpty()
    variantId: number;
    @IsNotEmpty()
    quantity: number;

    userId?: number; // Chưa làm bảo mật nên để tạm thời, mấy nữa sẽ lấy từ token
}


export class DecreaseItemDto {
    @IsNotEmpty()
    variantId: number;
    @IsNotEmpty()
    quantity: number;

    userId?: number; // Chưa làm bảo mật nên để tạm thời, mấy nữa sẽ lấy từ token
}


