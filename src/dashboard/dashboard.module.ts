import { Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/common/entities/order.entity';
import { Category } from 'src/common/entities/category.entity';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
  imports:[
    TypeOrmModule.forFeature([Order, Category])
  ]
})
export class DashboardModule {}
