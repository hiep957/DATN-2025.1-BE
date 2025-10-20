import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/entities/user.entity';
import { RefreshToken } from './users/entities/refresh-token.entity';
import { UserRole } from './users/entities/user-role.entity';
import { Role } from './users/entities/role.entity';
import { Category } from './common/entities/category.entity';
import { Brand } from './common/entities/brand.entity';

import { ProductsModule } from './products/products.module';
import { Color } from './common/entities/color.entity';
import { Size } from './common/entities/size.entity';
import { Product } from './common/entities/product.entity';

import { ProductVariant } from './common/entities/product-variant.entity';
import { CategoryModule } from './categories/category.module';
import { ProductImage } from './common/entities/product-image.entity';
import { Cart } from './common/entities/cart.entity';
import { CartItem } from './common/entities/cart-item.entity';
import { CartsModule } from './carts/carts.module';
import { UploadController } from './common/utils/upload.controller';
import { ConfigModule } from '@nestjs/config';
import { Otp } from './common/entities/otp.entity';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'hieplaso1',
      synchronize: true,
      // logging: true,
      database: 'shopdb',
      entities: [User, RefreshToken, UserRole, Role,
        Category, Brand, Color,Size, Product,  ProductVariant, ProductImage, Cart, CartItem,Otp],
    }),
    ProductsModule, CategoryModule, CartsModule
  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule { }
