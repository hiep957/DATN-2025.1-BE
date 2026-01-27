import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/common/entities/order.entity";
import { ProductVariant } from "src/common/entities/product-variant.entity";
import { PaymentStatus } from "src/common/utils/type.utils";
import { Repository } from "typeorm";


@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(Order)
        private readonly orderRepository: Repository<Order>,
        @InjectRepository(ProductVariant)
        private readonly productVariantRepository: Repository<ProductVariant>,
    ) { }

    async updatePaymentStatus(orderId: string, status: PaymentStatus): Promise<Order> {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new BadRequestException('Order not found');
        }
        order.payment_status = status;
        return this.orderRepository.save(order);
    }

    async cancelOrder(orderId: string): Promise<Order> {
        const order = await this.orderRepository.findOne({ where: { id: orderId }, relations: ['orderItems', 'user'] });
        console.log('Cancelling order:', orderId, order);
        if (!order) {
            throw new BadRequestException('Order not found');
        }
        if (order.payment_method !== 'cod') {
            throw new BadRequestException('Only COD orders can be cancelled');
        }
        if (order.payment_status === 'paid') {
            throw new BadRequestException('Paid orders cannot be cancelled');
        }
        // order. = 'cancelled'; // Assuming there is a status field to mark the order as cancelled
        const variantIds = order.orderItems.map(item => item.productVariantId);
        for (const variantId of variantIds) {
            const variant = await this.productVariantRepository.findOne({
                where: { id: variantId }
            })
            if (!variant) throw new BadRequestException('Product variant not found');
            variant.sold -= order.orderItems
                .filter(item => item.productVariantId === variantId)
                .reduce((sum, item) => sum + item.quantity, 0);
            variant.quantity += order.orderItems
                .filter(item => item.productVariantId === variantId)
                .reduce((sum, item) => sum + item.quantity, 0);
            await this.productVariantRepository.save(variant);
        }
        order.order_status = 'cancelled';
        return this.orderRepository.save(order);
    }
}