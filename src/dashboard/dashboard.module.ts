import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/common/entities/order.entity';
import { Category } from 'src/common/entities/category.entity';
import { User } from 'src/users/entities/user.entity';
import { Review } from 'src/common/entities/review.entity';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports:[
    TypeOrmModule.forFeature([Order, Category, User, Review])
  ]
})
export class DashboardModule {}
