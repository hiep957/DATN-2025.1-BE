import { IsNotEmpty } from "class-validator";


export class CreatePaymentLinkDto {
    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    orderId: string;
}
