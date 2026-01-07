// src/payment/strategies/cod.strategy.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { IPaymentStrategy } from '../interfaces/payment-strategy.interface';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Order } from 'src/common/entities/order.entity';
import { ProductVariant } from 'src/common/entities/product-variant.entity';
import { OrderStatus, PaymentStatus } from 'src/common/utils/type.utils';
import { CartsService } from 'src/carts/carts.service';

@Injectable()
export class CodStrategy implements IPaymentStrategy {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(ProductVariant)
        private readonly productVariantRepository: Repository<ProductVariant>,
        private readonly cartsService: CartsService,
    ) { }
    async processPayment(orderId: string, amount: number): Promise<any> {
        // Logic: Cập nhật DB trạng thái là "Pending"
        const order = await this.orderRepository.findOne({
            where: { id: orderId },
            relations: ['orderItems', 'user'],
        });
        if (!order) {
            throw new BadRequestException('Order not found');
        }
        order.payment_status = PaymentStatus.PENDING;
        order.order_status = OrderStatus.PENDING;
        //tru so luong san pham
        const variantIds = order.orderItems.map(item => item.productVariantId);
        for (const variantId of variantIds) {
            const variant = await this.productVariantRepository.findOne({
                where: { id: variantId }
            })
            if (!variant) throw new BadRequestException('Product variant not found');
            variant.sold += order.orderItems
                .filter(item => item.productVariantId === variantId)
                .reduce((sum, item) => sum + item.quantity, 0);
            await this.productVariantRepository.save(variant);

            variant.quantity -= order.orderItems
                .filter(item => item.productVariantId === variantId)
                .reduce((sum, item) => sum + item.quantity, 0);
            await this.productVariantRepository.save(variant);
            if (variant.quantity < 0) {
                variant.quantity = 0;
                await this.productVariantRepository.save(variant);
            }
            await this.cartsService.removeItemFromCart(variantId, Number(order.user?.id));
        }
        await this.orderRepository.save(order);
        return order;
    }
}