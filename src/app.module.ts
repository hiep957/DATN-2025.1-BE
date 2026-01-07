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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Otp } from './common/entities/otp.entity';

import { PaymentModule } from './payment/payment.module';
import { TestModule } from './test/test.module';
import { Order } from './common/entities/order.entity';
import { OrderItem } from './common/entities/order-item.entity';
import { Review } from './common/entities/review.entity';
import { ReviewModule } from './review/review.module';
import { ChatModule } from './chat/chat.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ChatSession } from './common/entities/chat-session';
import { ChatMessage } from './common/entities/chat-message';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_NAME', 'shopdb'),
        entities: [
          User,
          RefreshToken,
          UserRole,
          Role,
          Category,
          Brand,
          Color,
          Size,
          Product,
          ProductVariant,
          ProductImage,
          Cart,
          CartItem,
          Otp,
          Order,
          OrderItem,
          Review,
          ChatSession,
          ChatMessage
        ],
        // nên tắt ở production
        synchronize: true,
        logging: config.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),
    ProductsModule, CategoryModule, CartsModule, PaymentModule, TestModule, ReviewModule, ChatModule, DashboardModule

  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule { }
