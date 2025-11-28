import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { NestVnpayModule } from 'src/vnpay/vnpay.module';
import { Order } from 'src/common/entities/order.entity';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from 'src/common/entities/order-item.entity';
import { ProductVariant } from 'src/common/entities/product-variant.entity';
import { Product } from 'src/common/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { CartsService } from 'src/carts/carts.service';
import { CartsModule } from 'src/carts/carts.module';

@Module({
  imports: [NestVnpayModule,TypeOrmModule.forFeature([Order, OrderItem, ProductVariant, Product, User]),CartsModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule { }
