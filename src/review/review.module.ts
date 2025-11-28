import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Product } from 'src/common/entities/product.entity';
import { ProductVariant } from 'src/common/entities/product-variant.entity';
import { Order } from 'src/common/entities/order.entity';
import { OrderItem } from 'src/common/entities/order-item.entity';
import { Review } from 'src/common/entities/review.entity';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  imports:[
    TypeOrmModule.forFeature([User, Product, ProductVariant, Order, OrderItem, Review]),
  ]
})
export class ReviewModule {}
