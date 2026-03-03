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
import { OrderModule } from './orders/order.module';



@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        // host: "localhost",
        // port: 5432,
        // username: "postgres",
        // password: "hieplaso1",
        // database: "shopdb",
        url: config.get<string>('DATABASE_URL'),
        ssl: true,
        extra: {
          ssl: {
            rejectUnauthorized: false, // Cho phép kết nối kể cả khi chứng chỉ chưa được xác thực cục bộ (quan trọng với Neon)
          },
        },
        // 👆 HẾT ĐOẠN THÊM 👆
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
        // logging: true,
        // logging: config.get<string>('DB_LOGGING', 'false') === 'true',
      }),
    }),
    ProductsModule, CategoryModule, CartsModule, PaymentModule, TestModule, ReviewModule, ChatModule, DashboardModule, OrderModule

  ],
  controllers: [AppController, UploadController],
  providers: [AppService],
})
export class AppModule { }
