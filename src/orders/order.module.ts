import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from 'src/common/entities/order.entity';
import { ProductVariant } from 'src/common/entities/product-variant.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Order, ProductVariant])],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule { }