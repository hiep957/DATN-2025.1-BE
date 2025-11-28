import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsUUID, IsInt, IsNotEmpty, IsNumber, IsString, Min, IsOptional, IsEnum, ValidateNested, ArrayMinSize } from 'class-validator';
import { OrderStatus, PaymentMethod, PaymentStatus } from 'src/common/utils/type.utils';

export class CreateOrderItemDto {
  
    @IsNotEmpty()
    productVariantId: number;

    @IsInt()
    quantity: number;

    @IsNumber()
    unit_price: number;

    @IsString()
    @IsNotEmpty()
    productName: string;

    @IsOptional()
    productId: number;

    @IsString()
    @IsNotEmpty()
    link_image: string;
}

export class CreateOrderDto {
    @IsOptional()
    userId?: number;

    @IsString()
    @IsNotEmpty()
    customer_name: string;

    @IsString()
    @IsNotEmpty()
    customer_phone: string;

    @IsString()
    @IsNotEmpty()
    shipping_address: string;

    @IsString()
    @IsNotEmpty()
    customer_email: string;

    @IsOptional()
    @IsString()
    note?: string;

  
    @IsNotEmpty()
    payment_method: PaymentMethod;

    @IsNotEmpty()
    order_status: OrderStatus;

    @IsNotEmpty()
    payment_status: PaymentStatus;

    @IsOptional()
    @IsString()
    transaction_code?: string;

    @IsNumber()
    subtotal: number;

    @IsNumber()
    shipping_fee: number;

    @IsNumber()
    discount_amount: number;

    @IsNumber()
    grand_total: number;

    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    @ArrayMinSize(1)
    orderItems: CreateOrderItemDto[];
}


export class UpdateOrderDto extends PartialType(CreateOrderDto) {}

export class UpdateOrderItemDto extends PartialType(CreateOrderItemDto) {}

