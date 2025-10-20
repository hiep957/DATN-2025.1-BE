import { Module } from '@nestjs/common';
import { CartsService } from './carts.service';
import { CartsController } from './carts.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartItem } from 'src/common/entities/cart-item.entity';
import { ProductVariant } from 'src/common/entities/product-variant.entity';
import { User } from 'src/users/entities/user.entity';
import { Cart } from 'src/common/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem, ProductVariant, User])],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule { }
