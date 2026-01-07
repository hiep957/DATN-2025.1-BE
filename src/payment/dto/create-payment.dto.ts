import { IsNotEmpty } from "class-validator";


export class CreatePaymentLinkDto {
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    orderId: string;
}


export class CreatePaymentDto {
    @IsNotEmpty()
    paymentMethod: 'COD' | 'SEPAY' | 'VNPAY';
    @IsNotEmpty()
    orderId: string;
    @IsNotEmpty()
    amount: number;
}
